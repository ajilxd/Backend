import mongoose from "mongoose";
import config from "../config";

import { logger } from "./logger";

export const connectMongodb = async () => {
  try {
    if (!config.MONGODB_URI) {
      logger.error("Provide mongodb connection uri");
      process.exit(1);
    }
    await mongoose.connect(config.MONGODB_URI);
    logger.info("mongodb connection went succesfull");
  } catch (err) {
    logger.error({
      message: "mongodb connection error",
      error: err,
    });
    process.exit(1);
  }
};

export const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-User-Role"],
  credentials: true,
};
