# E-Commerce Application (API & Storefront)

A modern full-stack e-commerce application built with a **Node.js/Express TypeScript REST API** backend, **PostgreSQL** database, **Stripe Checkout** payment processing, and a **React 19 + Vite** storefront frontend.

---

## 📁 Project Structure

```text
EcommerceAPI/
├── ecommerce_api_backend/     # Express.js + TypeScript + PostgreSQL REST API
└── frontend/                  # React 19 + Vite + TypeScript Storefront Web App
```

---

## 🚀 Features & Architecture

### ⚙️ Backend (`ecommerce_api_backend`)
- **Express 5 & TypeScript**: Built with strict type checking, ESM module resolution, and structured routing (`/api/v1`).
- **PostgreSQL Database**: Data persistence using native `pg` client with pooled connection support (compatible with Neon serverless Postgres).
- **Authentication**: User registration and login using `bcrypt` password hashing and `jsonwebtoken` (JWT) authorization.
- **Product Catalog**: Dynamic product listings, detailed view, inventory management, and database seeding script (1,000+ realistic products).
- **Cart & Orders**: Cart session management per user, stock overflow validation, atomic PostgreSQL transaction checkout, and order history.
- **Stripe Checkout**: Redirect-based payment flow via official Stripe API.

### 🎨 Frontend (`frontend`)
- **React 19 & Vite 8**: Lightning-fast single-page application with hot module replacement and Hanken Grotesk typography.
- **React Router v7**: Client-side navigation for catalog browsing, product details, user authentication, and shopping bag.
- **Context API**: Global state management for shopping cart persistence and user authentication tokens.
- **API Integration**: Connected to backend API routes (`/api/v1`) with configurable environment variables.

---

## 🛠️ Prerequisites

- **Node.js**: `v20.x` or `v22.12.0+`
- **npm**: `v9.x` or higher
- **PostgreSQL**: Local database or cloud provider (e.g., [Neon Postgres](https://neon.tech))
- **Stripe Account**: Test key from [Stripe Dashboard](https://dashboard.stripe.com)

---

## ⚙️ Environment Configuration

### 1. Backend (`ecommerce_api_backend/.env`)
Create a `.env` file in `ecommerce_api_backend/`:

```env
PORT=3000
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
JWT_SECRET="your_jwt_secret_key"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
```

### 2. Frontend (`frontend/.env`)
Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:3000
VITE_STORE_NAME="Meridian Store"
VITE_SHOW_ADMIN=false
VITE_STRIPE_TEST_HINT=true
```

---

## 💻 How to Run Locally

### Step 1: Install Dependencies
Install packages for both the backend and frontend:

```bash
# Install backend dependencies
cd ecommerce_api_backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Seed the Database (Optional but Recommended)
Populate your PostgreSQL database with realistic sample products:

```bash
cd ecommerce_api_backend
npm run seed
```

### Step 3: Start the Backend Server
Run the Express development server (runs on `http://localhost:3000` by default):

```bash
cd ecommerce_api_backend
npm run dev
```

### Step 4: Start the Frontend Application
In a new terminal window, start the Vite development server (runs on `http://localhost:5173` by default):

```bash
cd frontend
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 🧪 Available Scripts

### Backend (`ecommerce_api_backend`)
- `npm run dev`: Starts dev server with live auto-reload via `tsx`.
- `npm start`: Starts production server.
- `npm run seed`: Seeds the database with products.
- `npm test`: Runs integration flow test script.

### Frontend (`frontend`)
- `npm run dev`: Launches Vite development server.
- `npm run build`: Type-checks and builds production bundle in `dist/`.
- `npm run preview`: Previews local production build.
- `npm run test`: Runs unit and component tests via Vitest.

---

## ☁️ Deployment

- **Backend**: Can be deployed to platforms like Vercel, Render, or Railway with environment variables (`DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`).
- **Frontend**: Can be deployed to Vercel via CLI:
  ```bash
  cd frontend
  vercel --prod
  ```
