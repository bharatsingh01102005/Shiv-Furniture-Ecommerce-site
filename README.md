# 🪑 Shiv Furniture House

A full-stack furniture e-commerce application built with **React + Vite** (frontend) and **Node.js / Express + MongoDB** (backend).

## ✨ Features

- 🛋️ Product listing with search & category filter
- 🛒 Cart management with quantity control
- 📦 Order placement with UPI payment flow
- 📍 Delivery fee calculation by PIN code
- 🔐 Authentication: Email/Password + Google Sign-In
- 🔑 Forgot password via OTP email
- 👑 Admin panel: manage products, orders, delivery settings
- 🔒 Security: Helmet, CORS, rate limiting, Mongo sanitization

---

## 🛠️ Tech Stack

| Layer    | Tech                            |
|----------|---------------------------------|
| Frontend | React 18, Vite, React Router v6 |
| Backend  | Node.js, Express 4              |
| Database | MongoDB + Mongoose              |
| Auth     | JWT (httpOnly cookie), Google OAuth |
| Email    | Nodemailer (SMTP)               |
| Payments | UPI deep-link + Transaction ID  |

---

## 🚀 Local Setup (Windows)

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/Shiv-Furniture-House.git
cd Shiv-Furniture-House
```

### 2. Set up the Server

```bash
cd server
npm install
copy .env.example .env
```

Edit `server/.env` and fill in:
- `JWT_SECRET` — any random secret string
- `MONGO_URI` — your MongoDB connection string
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — admin login credentials
- `SMTP_*` — Gmail SMTP settings for OTP emails (optional)
- `GOOGLE_CLIENT_ID` — from Google Cloud Console (optional)
- `UPI_ID` — your UPI ID for payments

```bash
npm run dev
```

Server runs at: `http://localhost:3000`

### 3. Set up the Client

```bash
cd ../client
npm install
copy .env.example .env
```

Edit `client/.env` and fill in:
- `VITE_API_BASE` — `http://localhost:3000` for local dev
- `VITE_UPI_ID` — your UPI ID
- `VITE_GOOGLE_CLIENT_ID` — same as server (optional)

```bash
npm run dev
```

Client runs at: `http://localhost:5173`

---

## 👑 Admin Access

The admin account is auto-created on server start using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `server/.env`.

1. Open `http://localhost:5173/login`
2. Sign in with your admin credentials
3. Navigate to `http://localhost:5173/admin`

---

## 📁 Project Structure

```
Shiv-Furniture-House/
├── client/           # React frontend
│   ├── src/
│   │   ├── api/      # API call functions
│   │   ├── pages/    # Page components
│   │   ├── state/    # Context providers (Auth, Cart)
│   │   ├── styles/   # Global CSS
│   │   └── ui/       # Shared UI components
│   └── vite.config.js
│
└── server/           # Node/Express backend
    └── src/
        ├── middleware/   # Auth, rate limiting, validation
        ├── models/       # Mongoose models
        ├── routes/       # API route handlers
        ├── seed/         # DB seed data
        └── utils/        # Helpers (JWT, mailer, pincode)
```

---

## ⚙️ Environment Variables

### Server (`server/.env`)
| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `ADMIN_EMAIL` | Admin account email |
| `ADMIN_PASSWORD` | Admin account password |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `UPI_ID` | UPI ID for payment |
| `SMTP_HOST/PORT/USER/PASS` | SMTP for email OTP |
| `SHOP_PINCODE` | Your shop's PIN code (for delivery calc) |

### Client (`client/.env`)
| Variable | Description |
|---|---|
| `VITE_API_BASE` | Backend URL |
| `VITE_UPI_ID` | UPI ID shown in checkout |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |

---

## ☁️ Deployment

### Frontend – Vercel
1. Connect the GitHub repo to Vercel.
2. Root directory: `client`
3. Build command: `npm install && npm run build`
4. Output directory: `dist`
5. Set env vars in Vercel:
   - `VITE_API_BASE`
   - `VITE_UPI_ID`
   - `VITE_GOOGLE_CLIENT_ID`

### Backend – Render
1. Connect the GitHub repo to Render.
2. Create a Web Service with root directory `server`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Set env vars in Render:
   - `PORT`
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `SMTP_FROM`
   - `BRAND_NAME`, `UPI_ID`, `MERCHANT_NAME` (optional)

## 📄 License

MIT — free to use and modify.
