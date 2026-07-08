Development setup

Prerequisites:
- Node.js 18+ and npm
- MongoDB running locally (or set `MONGO_URI` to a hosted instance)

Quick start (server):

```powershell
cd server
# copy .env.example to .env and edit values
npm install
npm run dev
```

Quick start (client):

```powershell
cd client
npm install
npm run dev
```

Notes:
- Server default development DB: `mongodb://127.0.0.1:27017/shiv-furniture`
- Default JWT secret is set in `server/src/config.js` for convenience in development only. Replace it in production using `JWT_SECRET`.
- To enable email OTP delivery configure SMTP env vars in `server/.env`.
- Vite dev server runs on port 5174 by default (if 5173 is busy).

Recommended next steps:
- Review `server/.env.example` and set secure production secrets.
- Run `npm audit` and update dependencies before production deployment.
- Add integration tests for checkout and auth flows.
