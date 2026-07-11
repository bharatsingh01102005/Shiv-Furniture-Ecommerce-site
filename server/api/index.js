/**
 * api/index.js — Vercel Serverless Function entry point
 *
 * Vercel looks for a default export (or module.exports) that is a Node.js
 * http.IncomingMessage handler.  An Express app satisfies this interface
 * directly, so we can export `app` as-is.
 *
 * DB connection + seeding run once per container cold-start.  On subsequent
 * warm invocations the cached connection in db.js is reused automatically.
 */

import app from "../src/app.js";
import { connectDB } from "../src/db.js";
import {
  seedProductsIfEmpty,
  ensureSettings,
  ensureAdminUser,
} from "../src/seed/seed.js";

// Run initialisation exactly once per cold-start.
// We do NOT await here at module level because top-level await is not
// supported in all Vercel runtimes.  Instead we attach the promise and
// handle errors inside the wrapper below.
let initialised = false;
let initPromise = null;

async function initialise() {
  await connectDB();
  await seedProductsIfEmpty();
  await ensureSettings();
  await ensureAdminUser();
  initialised = true;
}

/**
 * Vercel calls this function for every incoming request.
 * We wrap the Express app to guarantee the DB is ready before the first
 * request is processed, without blocking subsequent warm-start requests.
 */
export default async function handler(req, res) {
  if (!initialised) {
    if (!initPromise) {
      initPromise = initialise().catch((err) => {
        // Reset so the next invocation retries
        initPromise = null;
        throw err;
      });
    }
    await initPromise;
  }

  // Delegate to the Express app
  return app(req, res);
}
