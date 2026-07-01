# 🎓 EPS Management System

An enterprise-grade, high-performance School Management System built using a cutting-edge serverless architecture. The platform handles student authentication, massive data imports, financial tracking, and real-time animation pipelines with robust database integrity and heavily optimized response times.

---

🚀 Core Features

🔐 1. Authentication & Security
*   **Secure Sessions:** Implemented using Next-Auth with encrypted JWT strategy.
*   **Password Hashing:** Strict client/server separation with cryptographic salt hashing via `bcryptjs`.
*   **Validation Engine:** Native inline payload vetting powered by `validator`.

📂 2. Data Management & Heavy Imports
*   **Data Parsing:** High-capacity processing arrays utilizing `xlsx` for parsing large spreadsheets.
*   **Document Generation:** Automated server-to-client pipeline exporting custom school records to PDF (`jspdf`) and canvas states (`html2canvas`).
*   **Media Optimization:** Decentralized cloud-native storage assets mapped via `cloudinary`.

💳 3. Financial Tracking & Pipelines
*   **Payment States:** Fully isolated database transactional logic allowing processing for status `200` or safe handling of `400` states (idempotent tracking of pending transactions).

 4. High-Fidelity UI/UX
*   **Design Framework:** Built using **Tailwind CSS v4** featuring global CSS layers forcing persistent dark configuration across mobile/desktop canvases (`bg-[#0a0a0f]`).
*   **Component Architecture:** Radix UI primitives encapsulated with `shadcn` and typed through `class-variance-authority` and `tailwind-merge`.
*   **Animation Engine:** Framer Motion (`motion`) managing rendering pipelines.

---

🛠️ System Architecture & Tech Stack

### Frontend & Framework
*   **Next.js 16 (App Router)** - Leveraging React Server Components (RSC) and strict route streaming.
*   **React 19** - Utilizing modern concurrent feature mechanics.
*   **TypeScript 5** - Full type-safety guarantees across API structures.

### Backend & Database Layer
*   **MongoDB & Mongoose 9** - Strongly schematized ODM featuring high-performance indexing for rapid queries (`payment_duration` avg `< 450ms` under peak load).

---

📊 Performance Benchmarks & Load Testing

The platform is continuously load-tested against concurrent workloads using **Grafana k6** to simulate realistic server stress up to **150 Virtual Users (VUs)** at ~48 requests per second.

### 📈 Latest Load Test Metrics

| Metric | Measured Performance | System Target | Status |
| :--- | :--- | :--- | :--- |
| **Peak Concurrency** | 150 Looping VUs | 100 VUs | 🟢 Exceeded |
| **Throughput** | 47.83 http_reqs/sec | 30 reqs/sec | 🟢 Exceeded |
| **Http Req Duration (p95)** | **915.28 ms** | < 3000 ms | 🟢 Passed |
| **Payment Endpoint (Avg)** | **432.80 ms** | < 1000 ms | 🟢 Highly Optimized |
| **Import Endpoint (Avg)** | **821.28 ms** | < 1500 ms | 🟢 Highly Optimized |
| **Custom Checks Success** | **100.00%** (7854/7854) | 95.00% | 🟢 Passed |

> ℹ️ *Note: Infrastructure layer edge protection triggers rate-limiting flags under unmitigated scripted traffic over 40 reqs/sec, protecting deep database structures from synthetic thread locking.*

---

## 🔧 Getting Started

Prerequisites
*   Node.js v20 or greater
*   MongoDB Instance (Local URI or Atlas Connection)

#Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/ronney0611-dev/EPS-HighSchool.git](https://github.com/ronney0611-dev/EPS-HighSchool.git)
   cd eps-highschool
