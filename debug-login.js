import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://eps-high-school.vercel.app';

export const options = {
  vus: 1,
  iterations: 1,
};

export default function () {
  console.log('--- Step 1: get CSRF token ---');
  const csrfRes = http.get(`${BASE_URL}/api/auth/csrf`);
  console.log('CSRF status:', csrfRes.status);
  console.log('CSRF body:', csrfRes.body);

  const csrfToken = csrfRes.json('csrfToken');
  console.log('CSRF token:', csrfToken);

  sleep(1);

  console.log('--- Step 2: login ---');
  const loginRes = http.post(
    `${BASE_URL}/api/auth/callback/credentials`,
    {
      email: 'loadtest1@epshigh.dz',
      password: 'Test1234!',
      csrfToken: csrfToken,
      json: 'true',
    },
    { redirects: 0 }
  );
  console.log('Login status:', loginRes.status);
  console.log('Login headers:', JSON.stringify(loginRes.headers));
  console.log('Login body:', loginRes.body);

  sleep(1);

  console.log('--- Step 3: check session ---');
  const sessionRes = http.get(`${BASE_URL}/api/auth/session`);
  console.log('Session status:', sessionRes.status);
  console.log('Session body:', sessionRes.body);
}