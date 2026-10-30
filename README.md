# SplitSmart AI — Complete Fintech Platform
### PayPal AI Hackathon | Intelligent Group Expense Management & Smart Settlement

SplitSmart AI is an AI-powered group expense management and settlement platform built for the **PayPal AI Hackathon**. It features a Claymorphic fintech design system, persistent database storage, deterministic debt simplification, interactive 3D card payment animation, PayPal developer sandbox checkout, and natural language expense extraction.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Complete Application
To start both the **Vite frontend** (`http://localhost:5173`) and the **Express backend** (`http://localhost:5000`) simultaneously with proxy integration:

```bash
npm run dev
```

Alternatively, you can run them in separate terminals:
- **Terminal 1 (Frontend):**
  ```bash
  npm run client:dev
  ```
- **Terminal 2 (Backend API):**
  ```bash
  npm run server:dev
  ```

---

## 🔑 Environment Configuration (`.env`)

A comprehensive `.env.example` file is included in the project root:

```env
# Server Port & Core Security
PORT=5000
JWT_SECRET=splitsmart_hackathon_super_secret_jwt_2026
NODE_ENV=development

# Database Configuration (Optional PostgreSQL connection URL)
# By default, SplitSmart AI uses a high-performance persistent store in `server/data/splitsmart_db.json`.
# For PostgreSQL via Prisma ORM:
DATABASE_URL="postgresql://username:password@localhost:5432/splitsmart_db?schema=public"

# PayPal Developer Sandbox Credentials
# Get your credentials at https://developer.paypal.com/dashboard/applications/sandbox
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret_here
PAYPAL_SANDBOX=true

# AI Provider API Key (Google Gemini 1.5)
# Get a free Gemini API Key at https://aistudio.google.com/
# If left blank, SplitSmart AI runs in high-precision Local Financial NLP Engine mode.
GEMINI_API_KEY=your_google_gemini_api_key_here

# Email Delivery Configuration (SMTP or Resend)
# If left blank, SplitSmart AI operates in Development Console Mailbox mode,
# printing OTP verification codes cleanly into the server console.
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=your_smtp_or_resend_api_key_here
SMTP_FROM="SplitSmart AI <no-reply@splitsmart.ai>"
```

---

## 🎨 Visual Identity & Claymorphism

SplitSmart AI faithfully adheres to the visual reference specifications:
- **Primary Blue:** `#1685F8`
- **Light Blue:** `#BFE9FF`
- **Dark Navy:** `#10274A`
- **Background:** `#F1F9FF`
- **White:** `#FFFFFF`
- **Mint Green:** `#DDF8EE`
- **Accent Green:** `#16B890`
- **Soft Red:** `#FFE9EC`
- **Secondary Slate:** `#64748B`
- **Border:** `#D8E9FA`
- **Corner Radii:** 18–28px Claymorphic cards with soft blue ambient drop shadows and highlights.

---

## 💳 3D Card Payment Animation & PayPal Sandbox

- **3D Animated Card (`src/components/payment/Card3D.tsx`):**
  - Synchronized in real time with form inputs (cardholder name, card number, expiry, CVV).
  - Automatically executes realistic CSS 3D card flips (`rotateY(180deg)`) when the CVV security field receives focus, and flips back to the front upon exiting.
  - Dynamically detects card networks (Visa, Mastercard, Amex).
  - Complete state machine: `IDLE` ➔ `VALIDATING` ➔ `PROCESSING` (pulsing ambient waves and 3D floating tilt) ➔ `SUCCESS` (confetti celebration, cryptographic reference receipt, settlement mark).
- **PayPal Sandbox Checkout:**
  - Full server-side order creation (`/api/payments/paypal/create-order`) and capture endpoint (`/api/payments/paypal/capture-order`).
  - Stores verified transaction references and prevents duplicate payments.

---

## 🧠 AI Expense Assistant

- **Natural Language Parsing:**
  - User can type prompts like: `"Yesterday Rahul paid ₹2,400 for dinner with Priya and Aman"`.
  - Automatically identifies title, amount, payer, participants, and category.
  - Displays a preview proposal card with **Edit Details** and **Confirm Expense** buttons.
  - Never automatically saves without user confirmation.
- **Financial Q&A:**
  - Answers questions like `"Who owes me money?"`, `"How much did we spend on food?"`, `"Summarize Goa Trip 2026"`.
  - Computes exact figures from live authorized database records rather than hallucinating numbers.

---

## ⚖️ Smart Settlement Engine

- Calculates exact balances for all group members: `totalPaid - totalOwed + completedSettlements`.
- Enforces mathematical debt conservation: `Σ(netBalances) = 0`.
- Executes a greedy debt-netting algorithm that minimizes the number of transfers required to clear all group debts (e.g. 10 cross-debts reduced to 2 direct transfers).

---

## 🧪 Automated Verification Suite

Run the full end-to-end test suite:
```bash
npx tsx server/test-suite.ts
```
**Verification results: 29 PASSED | 0 FAILED**
- ✅ Database & Persistence
- ✅ Email & 6-Digit OTP Verification Flow
- ✅ Password Reset Challenge & Single-Use Tokens
- ✅ Mathematical Debt Conservation Invariant
- ✅ Natural Language AI Expense Extraction
- ✅ Real Database Financial Querying
- ✅ PayPal Sandbox Order Creation & Capture
- ✅ 3D Card Payment State Transitions & Storage

---

## 🏆 Hackathon Evaluation Quick Start
- Click **"Demo Tour"** in the navigation bar or **"One-Click Demo Login"** on the Login screen to instantly sign in as **Rahul Sharma**.
- Explore preloaded groups: **Goa Trip 2026**, **College Friends**, and **Roommates Flat 402**.
- Open **Settlements** to test debt netting or launch the **Checkout** to trigger the **3D card flip animation** and **PayPal Sandbox** payment!
