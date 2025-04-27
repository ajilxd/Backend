import dotenv from "dotenv";
import { iconfig } from "../types";
dotenv.config();
const config: iconfig<string> = {
  PORT: Number(process.env.PORT),
  JWT_SECRET_KEY: process.env.JWT_SECRET,
  MONGODB_URI: process.env.MONGODB_URI,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_PORT: Number(process.env.CLIENT_PORT),
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLISH_KEY,
  STRIPE_WEBHOOK_SECRET_KEY: process.env.STRIPE_WEBHOOK_SECRET_KEY,
  ADMIN_ACCESS_SECRET: process.env.ADMIN_ACCESS_SECRET,
  ADMIN_REFRESH_SECRET: process.env.ADMIN_REFRESH_SECRET,
  GENERAL_ACCESS_SECRET: process.env.GENERAL_ACCESS_SECRET,
  GENERAL_REFRESH_SECRET: process.env.GENERAL_REFRESH_SECRET,
};

export default config;
