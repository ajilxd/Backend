import mongoose from "mongoose";
import dotenv from "dotenv";
import { Admin } from "./schemas/adminSchema";
import bcrypt from "bcryptjs";
import path from "path";
import { logger } from "./utils/logger";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const seedAdmin = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, MONGODB_URI } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !MONGODB_URI) {
    logger.fatal("Missing required environment variables");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);

  const adminAccount = await Admin.findOne({ email: ADMIN_EMAIL });
  if (adminAccount) {
    logger.fatal("Admin already exists . ");
    return process.exit();
  }
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await Admin.create({
    email: ADMIN_EMAIL,
    password: hashedPassword,
  });

  logger.info("Admin seeded successfully");
  process.exit();
};

seedAdmin().catch((err) => {
  logger.info(`Error happen while seeding`, err);
  process.exit(1);
});
