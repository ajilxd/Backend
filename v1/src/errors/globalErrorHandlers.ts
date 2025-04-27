import { logger } from "../utils/logger";

export const handleGlobalErrors = () => {
  process.on("uncaughtException", (err) => {
    logger.error("UNCAUGHT EXCEPTION! shutting down...");
    logger.error(err);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    logger.error("UNHANDLED REJECTION! shutting down...");
    logger.error(reason);
    process.exit(1);
  });
};
