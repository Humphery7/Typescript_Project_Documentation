# Full-Stack E-Commerce Platform

A production-grade full-stack e-commerce application comprising an Express/TypeScript RESTful API backend, a PostgreSQL database, Stripe Checkout integration, and a React 19 + Vite storefront.

---

## Live Deployments

- **Storefront (Frontend)**: [https://meridianfrontend-btrjfjjyv-faradayotuoniyo-gmailcoms-projects.vercel.app/](https://meridianfrontend-btrjfjjyv-faradayotuoniyo-gmailcoms-projects.vercel.app/)
- **REST API (Backend)**: [https://meridianbackend.vercel.app/](https://meridianbackend.vercel.app/)

---

## Repository Structure

```text
EcommerceAPI/
├── ecommerce_api_backend/     # Express.js, TypeScript, PostgreSQL REST API
└── frontend/                  # React 19, Vite, TypeScript Storefront Application
```

---

## Architecture and Technical Overview

### Backend (`ecommerce_api_backend`)
- **Framework & Language**: Express 5 on Node.js using TypeScript with strict type checking and native ESM resolution.
- **Database Layer**: PostgreSQL via the native `pg` client using pooled connection management, fully compatible with serverless connection pooling (Neon).
- **Authentication**: JWT (JSON Web Tokens) with standard Bearer authorization headers and `bcrypt` password hashing.
- **E-Commerce Domain Engine**: Modular routing (`/api/v1`) handling user authentication, product catalog search, inventory checks, cart management, and atomic checkout transactions.
- **Payment Processing**: Integrated with Stripe Checkout for secure redirect payment flows and webhooks.
- **Data Seeding**: Built-in seeding script generating scalable sample catalog items with realistic categorization and pricing.

### Frontend (`frontend`)
- **Framework & Build System**: React 19 SPA powered by Vite for fast bundle builds and hot module reloading.
- **Routing & State**: React Router v7 for client-side navigation alongside Context API for cart and user state persistence.
- **Design System**: Responsive interface built with custom CSS utilities and typography from Hanken Grotesk.
- **API Client**: Asynchronous fetch handlers connecting to backend API routes configured via environment variables.

---

## Prerequisites

- **Node.js**: Version 20.x or 22.12.0+
- **npm**: Version 9.x or higher
- **PostgreSQL**: Local instance or managed provider (e.g., Neon Postgres)
- **Stripe Account**: Secret key for test mode payment processing

---

## Environment Configuration

### Backend Configuration (`ecommerce_api_backend/.env`)

Create a `.env` file inside `ecommerce_api_backend/`:

```env
PORT=3000
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
JWT_SECRET="your_secure_jwt_secret"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
```

### Frontend Configuration (`frontend/.env`)

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:3000
VITE_STORE_NAME="Meridian Store"
VITE_SHOW_ADMIN=false
VITE_STRIPE_TEST_HINT=true
```

---

## Local Development Setup

### 1. Install Dependencies

Install required packages for both subprojects:

```bash
# Backend dependencies
cd ecommerce_api_backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Seed the Database

Populate your database with sample catalog items:

```bash
cd ecommerce_api_backend
npm run seed
```

### 3. Start the Backend API

Run the development API server (default port `3000`):

```bash
cd ecommerce_api_backend
npm run dev
```

### 4. Start the Storefront Frontend

In a separate terminal window, start the Vite development server (default port `5173`):

```bash
cd frontend
npm run dev
```

Access the storefront in your browser at `http://localhost:5173`.

---

## Available Scripts

### Backend (`ecommerce_api_backend`)
- `npm run dev`: Starts the API development server with live reload via `tsx`.
- `npm start`: Runs the server in production mode.
- `npm run seed`: Executes the database product seeding procedure.
- `npm test`: Runs integration testing scripts.

### Frontend (`frontend`)
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Type-checks and compiles the production bundle in `dist/`.
- `npm run preview`: Serves the production build locally.
- `npm run test`: Executes unit tests using Vitest.

---

## Deployment

### Backend Deployment
The backend API can be deployed to Node.js hosting environments such as Vercel, Render, or AWS App Runner. Ensure all environment variables (`DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`) are set in the project configuration.

### Frontend Deployment
The storefront application can be deployed using the Vercel CLI:

```bash
cd frontend
vercel --prod
```
