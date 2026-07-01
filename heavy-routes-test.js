import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const importDuration = new Trend('import_duration');
const paymentDuration = new Trend('payment_duration');
const loginDuration = new Trend('login_duration');

const BASE_URL = __ENV.BASE_URL || 'https://eps-high-school.vercel.app';

// ─── Test accounts ───────────────────────────────────────────────
// IMPORTANT: create these accounts manually before running, with
// password "Test1234!" each, via your normal register flow + choose-level.
// Using dummy accounts so we don't pollute real teacher data.
const TEST_USERS = [
  { email: 'loadtest1@epshigh.dz', password: 'Test1234!' },
  { email: 'loadtest2@epshigh.dz', password: 'Test1234!' },
  { email: 'loadtest3@epshigh.dz', password: 'Test1234!' },
  { email: 'loadtest4@epshigh.dz', password: 'Test1234!' },
  { email: 'loadtest5@epshigh.dz', password: 'Test1234!' },
];

export const options = {
  scenarios: {
    heavy_routes: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },   // light start
        { duration: '1m', target: 50 },    // realistic concurrent teachers importing
        { duration: '1m', target: 100 },   // stress point
        { duration: '1m', target: 150 },   // push further
        { duration: '1m', target: 0 },     // ramp down
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    errors: ['rate<0.05'],
  },
};

// ─── Helper: fake class+student payload for import ──────────────
function buildFakeClassPayload() {
  const classes = [];
  for (let c = 0; c < 2; c++) {
    const students = [];
    for (let s = 0; s < 30; s++) {
      students.push({
        name: `تلميذ تجريبي ${s}`,
        gender: s % 2 === 0 ? 'male' : 'female',
        status: 'normal',
      });
    }
    classes.push({
      name: `قسم تجريبي ${__VU}-${c}`,
      students,
    });
  }
  return { classes };
}

export default function () {
  const user = TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
  const jar = http.cookieJar();

  let sessionOk = false;

  group('Login flow', function () {
    const start = Date.now();

    // 1. get CSRF token
    const csrfRes = http.get(`${BASE_URL}/api/auth/csrf`);
    const csrfToken = csrfRes.json('csrfToken');

    if (!csrfToken) {
      errorRate.add(1);
      return;
    }

    // 2. post credentials to the callback
    const loginRes = http.post(
      `${BASE_URL}/api/auth/callback/credentials`,
      {
        email: user.email,
        password: user.password,
        csrfToken: csrfToken,
        json: 'true',
      },
      { redirects: 0 }
    );

    loginDuration.add(Date.now() - start);

    // 3. confirm session is alive
    const sessionRes = http.get(`${BASE_URL}/api/auth/session`);
    const sessionBody = sessionRes.json();
    sessionOk = sessionBody && sessionBody.user;

    check(sessionRes, {
      'login produced valid session': () => sessionOk,
    }) || errorRate.add(1);
  });

  if (!sessionOk) {
    sleep(1);
    return; // skip the rest if login failed, no point testing protected routes
  }

  sleep(1);

  group('Excel import (heavy DB write)', function () {
    const start = Date.now();
    const payload = JSON.stringify(buildFakeClassPayload());

    const res = http.post(`${BASE_URL}/api/classes/import`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    importDuration.add(Date.now() - start);

    check(res, {
      'import status 200': (r) => r.status === 200,
    }) || errorRate.add(1);
  });

  sleep(Math.random() * 2 + 1);

  group('Payment submission (DB write)', function () {
    const start = Date.now();

    const payload = JSON.stringify({
      method: 'BARIDIMOB',
      plan: 'yearly',
      amount: 3000,
      receiptUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      transactionNumber: `LOADTEST-${__VU}-${__ITER}`,
    });

    const res = http.post(`${BASE_URL}/api/payment/manual`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    paymentDuration.add(Date.now() - start);

    if (res.status !== 200 && res.status !== 201 && res.status !== 400) {
      console.log('UNEXPECTED payment status:', res.status, 'body:', res.body);
    }

    // 400 is expected if a pending payment already exists for this test user
    // after the first run - that's fine, it's not a server failure
    check(res, {
      'payment status 200 or 400 (already pending)': (r) =>
        r.status === 200 || r.status === 201 || r.status === 400,
    }) || errorRate.add(1);
  });

  sleep(Math.random() * 2 + 1);
}
