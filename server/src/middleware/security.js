import helmet from "helmet";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import { config } from "../config.js";

export function applySecurity(app) {
  app.use(helmet({ contentSecurityPolicy: false }));

  const allowed = config.corsOrigin
    ? [config.corsOrigin]
    : ["http://localhost:5173", "http://localhost:5174"];

  app.use(cors({ origin: allowed, credentials: true }));
  app.use(cookieParser());
  app.use(mongoSanitize());
}
