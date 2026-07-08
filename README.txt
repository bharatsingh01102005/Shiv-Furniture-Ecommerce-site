✅ Shiv Furniture House — FULL STACK (React + Node/Express + MongoDB)
✅ Admin Panel + Product CRUD + Order Management
✅ Payments: Razorpay REMOVED (as requested)
✅ UPI Checkout link + Transaction ID capture (PENDING -> Admin marks PAID)

RUN (Windows)
1) Start MongoDB
2) Server:
   cd server
   npm install
   copy .env.example .env
   Edit .env (JWT_SECRET + UPI_ID + Admin credentials)
   npm run dev

3) Client (React):
   cd ../client
   npm install
   copy .env.example .env
   Edit client .env (VITE_API_BASE + VITE_UPI_ID)
   npm run dev

Open: http://localhost:5173 (or 5174)

Admin account auto-created (if not exists):
- ADMIN_EMAIL, ADMIN_PASSWORD from server/.env
Login from normal Login page, then open /admin
