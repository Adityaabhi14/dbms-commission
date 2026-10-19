# 🎶 APD MUSIC CLASS — Enterprise Music Academy Management Platform

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-336791?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![Tests](https://img.shields.io/badge/Tests-57%20Passed-success)
![Brand Color](https://img.shields.io/badge/Brand-%23C654C3-ff69b4)

An enterprise multi-branch music academy operations platform supporting student admissions, faculty mentor scheduling, multi-tier memberships, automated conflict-free class booking, authoritative payment reconciliation, and real-time executive financial analytics.

---

## 📋 Table of Contents

1. [Features & Capabilities](#-features--capabilities)
2. [Prerequisites & System Setup](#-prerequisites--system-setup)
   - [How to Install Node.js & npm (Windows, macOS, Linux)](#1-how-to-install-nodejs--npm)
   - [How to Install Git](#2-how-to-install-git)
   - [PostgreSQL Database Setup (Optional / Production)](#3-postgresql-database-setup-optional--production)
3. [Step-by-Step Installation & Setup](#-step-by-step-installation--setup)
   - [Clone the Repository](#step-1-clone-the-repository)
   - [Install Dependencies](#step-2-install-dependencies)
   - [Configure Environment Variables](#step-3-configure-environment-variables)
   - [Initialize & Seed the Database](#step-4-initialize--seed-the-database)
   - [Provision the Initial Owner Account](#step-5-provision-the-initial-owner-account)
4. [Running the Application](#-running-the-application)
   - [Development Mode (Backend + Frontend)](#1-development-mode)
   - [Accessing the Application](#2-accessing-the-application)
   - [Default Test Credentials](#3-default-test-credentials)
5. [Automated Testing Suite](#-automated-testing-suite)
6. [Building for Production](#-building-for-production)
7. [API Documentation & Health Check](#-api-documentation--health-check)
8. [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
9. [Troubleshooting & Common Issues](#-troubleshooting--common-issues)
10. [License](#-license)

---

## 🌟 Features & Capabilities

- **Multi-Branch Operations**: Native multi-campus support across **Madhapur**, **Kokila**, and **Himayatnagar**.
- **Comprehensive Instrument Catalogue**: 7 instruments across classical and contemporary disciplines (*Guitar, Piano, Drums, Sitar, Violin, Ukulele, Trumpet*).
- **Flexible Membership Plans**: 1-month, 3-months, 6-months, and 12-months tiers with automated duration and calendar expiry calculations.
- **Conflict-Free Booking Engine**: 10 daily one-hour class slots (**08:00–09:00** through **17:00–18:00**) with strict ACID database locking preventing:
  - Student double-booking
  - Faculty mentor scheduling collisions
  - Studio room capacity exceedance
- **Hardened Authentication & RBAC**:
  - Secure bcrypt password hashing with cryptographic salt rounds.
  - Case-insensitive email uniqueness preventing account collisions.
  - Generic authentication failure responses preventing username enumeration.
  - Cryptographic token-based password reset workflow with 1-hour TTL.
  - Strict role isolation (`CLIENT` vs `OWNER`) enforced on every protected backend route.
  - Zero public owner self-registration; owner accounts must be provisioned via admin scripts.
- **Authoritative Payment Processing**:
  - Server-side checkout session creation with 15-minute slot reservation holds.
  - Idempotent webhook processing with event deduplication preventing replay attacks.
  - Audited refund workflow with ledger tracking.
- **Executive Financial Reporting**:
  - Net operating profit formula: `Recognized Revenue (Collected − Refunds) − Recorded Expenses`.
  - Outstanding pending payments are never counted as recognized revenue.
  - Multi-dimensional revenue breakdown by instrument, branch, and category.

---

## 💻 Prerequisites & System Setup

Before cloning and running the application, make sure you have installed **Node.js** (v20.x or higher recommended) and **Git**.

### 1. How to Install Node.js & npm

Node.js is the JavaScript runtime that powers the development server, build tools, and backend API. `npm` (Node Package Manager) comes bundled with Node.js.

#### On Windows:
1. **Option A: Official Installer (Recommended for beginners)**
   - Visit the official download page: [https://nodejs.org/](https://nodejs.org/)
   - Download the **LTS (Long Term Support)** Windows Installer (`.msi`).
   - Run the installer and click **Next** through the setup wizard.
   - Ensure the checkbox **"Automatically install the necessary tools"** is selected.
   - Click **Finish** and restart your terminal or PowerShell.
2. **Option B: Windows Package Manager (Winget)**
   - Open PowerShell as Administrator and run:
     ```powershell
     winget install OpenJS.NodeJS.LTS
     ```
   - Close and reopen PowerShell.
3. **Option C: Node Version Manager (`nvm-windows`)**
   - Download `nvm-setup.exe` from [nvm-windows releases](https://github.com/coreybutler/nvm-windows/releases).
   - Run:
     ```powershell
     nvm install 20
     nvm use 20
     ```

#### On macOS:
1. **Option A: Homebrew (Recommended)**
   - Open Terminal and run:
     ```bash
     brew install node@20
     brew link node@20
     ```
2. **Option B: Official Installer**
   - Download the macOS `.pkg` installer from [https://nodejs.org/](https://nodejs.org/) and run it.
3. **Option C: NVM (Node Version Manager)**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   nvm install 20
   nvm use 20
   ```

#### On Linux (Ubuntu / Debian):
```bash
# Using NodeSource repository for Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### ✅ Verify Node.js and npm Installation
Open your terminal (or PowerShell on Windows) and run:
```bash
node -v
# Output should be: v20.x.x or higher

npm -v
# Output should be: 10.x.x or higher
```

---

### 2. How to Install Git

Git is required to clone and version-control the project.

- **Windows**: Download and install from [https://git-scm.com/download/win](https://git-scm.com/download/win) (or run `winget install Git.Git`).
- **macOS**: Run `xcode-select --install` or `brew install git`.
- **Linux**: Run `sudo apt install git` (Ubuntu/Debian) or `sudo dnf install git` (Fedora).

Verify your Git installation:
```bash
git --version
# Output should be: git version 2.x.x
```

---

### 3. PostgreSQL Database Setup (Optional / Production)

The project includes an in-memory transactional database engine that runs out-of-the-box for instant local development and test execution. For production deployment or full relational schema testing with PostgreSQL:

1. **Install PostgreSQL**:
   - **Windows**: Download installer from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/).
   - **macOS**: `brew install postgresql@16 && brew services start postgresql@16`.
   - **Docker (Instant container)**:
     ```bash
     docker run --name apd-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=apd_music_academy -p 5432:5432 -d postgres:16
     ```
2. The schema definitions, migrations, and seed scripts are located in `server/prisma/`.

---

## 🚀 Step-by-Step Installation & Setup

### Step 1: Clone the Repository

Open your terminal or PowerShell and clone the codebase:
```bash
git clone https://github.com/Adityaabhi14/dbms-commission.git
cd dbms-commission
```
*(If working directly in the project folder `c:\ayan`, open terminal inside that folder).*

---

### Step 2: Install Dependencies

Run `npm install` to download and install all frontend and backend dependencies:
```bash
npm install
```
This installs:
- **Frontend**: React 19, Lucide React icons, Vite 8 build engine.
- **Backend**: Express 5, Prisma ORM, bcryptjs, jsonwebtoken, zod, cors, helmet, rate-limiters.
- **Testing & Tools**: Vitest 5, Supertest, TypeScript, Oxlint.

---

### Step 3: Configure Environment Variables

1. Copy the provided `.env.example` file to create your local `.env`:
   - **On Windows (PowerShell)**:
     ```powershell
     Copy-Item .env.example .env
     ```
   - **On macOS / Linux**:
     ```bash
     cp .env.example .env
     ```
2. Open `.env` and verify the settings. Default development values work out of the box:
   ```env
   NODE_ENV=development
   PORT=4000
   VITE_PORT=5173
   ACADEMY_TIMEZONE=Asia/Kolkata
   JWT_SECRET=super_secret_jwt_academy_key_2026_dev_env
   CORS_ORIGIN=http://localhost:5173
   ```

---

### Step 4: Initialize & Seed the Database

To run Prisma migrations against your PostgreSQL instance (if using PostgreSQL):
```bash
npx prisma migrate dev --name init
```
To run the automated TypeScript seed script:
```bash
npx tsx server/prisma/seed.ts
```

---

### Step 5: Provision the Initial Owner Account

Owner accounts cannot be created through public self-registration. Use the secure administrative setup script to provision the initial academy director:
```bash
npm run setup:owner
```
*Output:*
```text
🔒 Initializing Protected Owner Account Provisioning...
✅ Owner account 'director@apdmusicclass.com' created successfully.
```

---

## 🏃 Running the Application

### 1. Development Mode

You can run both the Express backend and the Vite frontend simultaneously. Open two terminal tabs:

#### Terminal 1 — Backend API Server (Port 4000):
```bash
npm run server
```
*Output:*
```text
====================================================
🎶 APD MUSIC CLASS — Enterprise Backend Server
📡 Server running on http://localhost:4000
📖 Swagger API Docs: http://localhost:4000/api/docs
❤️  Health Check:    http://localhost:4000/api/health
🕒 Academy Timezone: Asia/Kolkata
====================================================
```

#### Terminal 2 — Frontend Dev Server (Port 5173):
```bash
npm run dev
```
*Output:*
```text
  VITE v8.3.4  ready in 250 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### 2. Accessing the Application

Open your browser and navigate to:
- **Client & Public Portal**: [http://localhost:5173](http://localhost:5173)
- **Backend API & Health**: [http://localhost:4000/api/health](http://localhost:4000/api/health)
- **API Swagger Documentation**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

### 3. Default Test Credentials

For quick evaluation and reviewer demonstration:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Director / Owner** | `director@apdmusicclass.com` | `directorSecure2026` | Full Academy Executive, Financials, Faculty CRUD, Schedule Overrides |
| **Enrolled Student** | `aarav.patel@example.com` | `password123` | Book Classes, View Memberships, Attendance, Payment History |
| **New Student** | Self-service registration | Min 6 characters | Registers via `/register` with strict client role isolation |

---

## 🧪 Automated Testing Suite

The repository contains an enterprise testing suite powered by **Vitest** and **Supertest** covering:
- Case-insensitive email uniqueness and registration validation.
- Account enumeration attack prevention.
- Role-based privilege boundary enforcement (`CLIENT` forbidden from owner routes).
- Concurrency conflict detection (simultaneous double-booking race condition prevention).
- Faculty mentor conflict and studio room capacity checks.
- Payment webhook idempotency and duplicate replay rejection.
- Ledger-verified mathematical financial consistency.

Run all 57 backend tests:
```bash
npm run test:backend
```

*Sample Test Output:*
```text
 ✓ server/tests/database-integrity.test.ts (10 tests)
 ✓ server/tests/calendar-expiry.test.ts (10 tests)
 ✓ server/tests/finance.test.ts (5 tests)
 ✓ server/tests/booking-engine.test.ts (6 tests)
 ✓ server/tests/auth-guards.test.ts (7 tests)
 ✓ server/tests/security-auth-concurrency.test.ts (19 tests)

 Test Files  6 passed (6)
      Tests  57 passed (57)
   Duration  3.8s
```

---

## 📦 Building for Production

To create an optimized production build:
```bash
npm run build
```
This command runs:
1. `tsc -b`: Type-checks the entire TypeScript codebase.
2. `vite build`: Minifies CSS/JS assets, bundles code splits, and outputs to the `dist/` folder.

To preview the production build locally:
```bash
npm run preview
```

To run code quality linting:
```bash
npm run lint
```

---

## 📡 API Documentation & Health Check

### Health Check Endpoint
```http
GET /api/health
```
**Response:**
```json
{
  "success": true,
  "status": "ONLINE",
  "service": "APD MUSIC CLASS Backend API",
  "version": "2.0.0",
  "timezone": "Asia/Kolkata",
  "academyLocalTime": "Monday, 19 October 2026 at 8:30:00 pm IST",
  "uptimeSeconds": 3412
}
```

### Core API Routes

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Client registration (forces `CLIENT` role) |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `POST` | `/api/auth/logout` | Authenticated | Terminate session & clear cookies |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |
| `POST` | `/api/auth/change-password` | Authenticated | Update user password |
| `POST` | `/api/auth/forgot-password` | Public | Enumeration-safe reset link generator |
| `POST` | `/api/auth/reset-password` | Public | Reset password using valid token |
| `GET` | `/api/branches` | Public | List all academy branches |
| `GET` | `/api/instruments` | Public | List all 7 instruments |
| `GET` | `/api/plans` | Public | List membership duration plans |
| `GET` | `/api/members` | Authenticated | List members (filtered to self for clients) |
| `GET` | `/api/teachers` | Authenticated | List faculty mentors & schedules |
| `POST` | `/api/teachers` | **Owner Only** | Create faculty mentor record |
| `GET` | `/api/bookings` | Authenticated | Retrieve bookings |
| `POST` | `/api/bookings` | Authenticated | Create class booking with collision check |
| `PATCH`| `/api/bookings/:id/reschedule` | Authenticated | Reschedule booking (requires 24h notice) |
| `POST` | `/api/payments/checkout-session`| Authenticated | Initialize 15-min held checkout session |
| `POST` | `/api/payments/webhook` | Webhook Provider | Authoritative idempotent payment callback |
| `POST` | `/api/payments/:id/refund` | **Owner Only** | Issue verified refund & update ledger |
| `GET` | `/api/reports/overview` | **Owner Only** | Executive financial dashboard summary |
| `GET` | `/api/reports/revenue-expenses` | **Owner Only** | Revenue vs expense breakdown |

---

## 📂 Project Architecture & Directory Structure

```text
ayan/
├── .env.example                     # Documented environment variable template
├── .gitignore                       # Git ignore rules (excludes .env and node_modules)
├── README.md                        # Master GitHub documentation & setup guide
├── index.html                       # HTML5 entry point with metadata and branding
├── package.json                     # NPM dependency manifest & build scripts
├── vite.config.ts                   # Vite configuration with API proxy to port 4000
│
├── docs/
│   └── database_architecture.md     # Relational schema specification & ER documentation
│
├── server/                          # Backend Express Application
│   ├── prisma/
│   │   ├── schema.prisma            # 23-Entity normalized relational schema
│   │   ├── seed.ts                  # Deterministic TypeScript seed script
│   │   ├── seed.sql                 # SQL seed statements
│   │   ├── analytical_queries.sql   # SQL reporting queries with DENSE_RANK()
│   │   └── migrations/              # Version-controlled PostgreSQL DDL migrations
│   │
│   ├── src/
│   │   ├── app.ts                   # Express application setup, security middleware, CORS
│   │   ├── server.ts                # Server bootstrapper & listener on port 4000
│   │   ├── config/                  # Constants, time slots, instrument definitions
│   │   ├── database/                # Enterprise in-memory & transactional repository engine
│   │   ├── middleware/              # JWT auth guards, rate limiters, Zod validators
│   │   ├── modules/                 # Modular feature controllers & services
│   │   │   ├── auth/                # Register, login, password reset, token lifecycle
│   │   │   ├── bookings/            # Class reservations, conflict checks, rescheduling
│   │   │   ├── branches/            # Campus information & address updates
│   │   │   ├── expenses/            # Operating cost & payroll accounting
│   │   │   ├── instruments/         # Curriculum catalogue
│   │   │   ├── members/             # Student roster & expiry tracking
│   │   │   ├── memberships/         # Enrollment tiers & duration logic
│   │   │   ├── payments/            # Checkout sessions, idempotency, webhook receiver
│   │   │   ├── plans/               # 1, 3, 6, 12-month tier calculations
│   │   │   ├── reports/             # Executive analytical reports & metrics
│   │   │   └── teachers/            # Faculty mentor management
│   │   ├── scripts/
│   │   │   └── setup-initial-owner.ts # Protected director bootstrap script
│   │   └── utils/                   # Date calculations, finance utilities, errors
│   │
│   └── tests/                       # Automated Test Suite (57 Vitest Tests)
│       ├── auth-guards.test.ts      # RBAC & client isolation tests
│       ├── booking-engine.test.ts   # Double-booking & slot capacity tests
│       ├── calendar-expiry.test.ts  # Add calendar months & leap year tests
│       ├── database-integrity.test.ts # Entity relationship tests
│       ├── finance.test.ts          # Ledger & profit/loss tests
│       └── security-auth-concurrency.test.ts # Phase 4 security & race condition tests
│
└── src/                             # Frontend React 19 Application
    ├── components/
    │   ├── common/                  # Buttons, Badges, Modals, Cards, Drawers
    │   └── navigation/              # Client Navbar, Owner Sidebar, Public Navbar
    ├── context/
    │   ├── AuthContext.tsx          # Real session management, login, logout, reset
    │   ├── BookingContext.tsx       # 6-Step booking wizard state
    │   └── ToastContext.tsx         # Notification feedback system
    ├── features/
    │   └── booking/                 # Interactive class booking flow
    ├── pages/
    │   ├── auth/                    # Client Login/Register, Owner Login, Forgot Password
    │   ├── client/                  # Client Portal (attendance, schedule, bookings)
    │   ├── owner/                   # Executive Dashboard, Faculty CRUD, Finances
    │   └── public/                  # Landing Page, Catalogue, Pricing, Branches
    ├── services/
    │   └── apiClient.ts             # Typed enterprise API client interfacing with /api
    ├── types/                       # Shared domain TypeScript interfaces
    └── utils/                       # Currency formatters, date helpers, validators
```

---

## 🔧 Troubleshooting & Common Issues

### 1. `EADDRINUSE: address already in use :::4000` or `:::5173`
- **Cause**: Another instance of the server or another program is occupying port 4000 or 5173.
- **Resolution**:
  - **On Windows (PowerShell)**:
    ```powershell
    # Find process on port 4000
    netstat -ano | findstr :4000
    # Kill the process by PID
    Stop-Process -Id <PID> -Force
    ```
  - **On macOS / Linux**:
    ```bash
    kill -9 $(lsof -t -i:4000)
    ```

### 2. PowerShell Script Execution Policy Error on Windows
- **Cause**: Windows default policy restricts running npm/tsx scripts.
- **Resolution**:
  - Open PowerShell as Administrator and run:
    ```powershell
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    ```

### 3. Node Version Compatibility Warning
- **Cause**: Running on Node.js versions older than v18.
- **Resolution**: Install Node.js v20+ LTS following the [Prerequisites section](#1-how-to-install-nodejs--npm).

---

## 📄 License

This project is licensed under the MIT License — feel free to customize and deploy for educational academy operations.
