import AppError from "../errors/appError";
import ejs from "ejs";
import path from "path";
import nodemailer from "nodemailer";
const fs = require("fs").promises;
import dotenv from "dotenv";
import { logger } from "./logger";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.NODEMAILER_MAILID,
    pass: process.env.NODEMAILER_MAILPASS,
  },
});

const sendEmail = async (
  to: any,
  subject: any,
  template: any,
  context: any
) => {
  try {
    const templatePath = path.join(__dirname, "templates", `${template}.ejs`);

    const templateString = await fs.readFile(templatePath, "utf8");

    const html = ejs.render(templateString, context);

    const mailOptions = {
      from: process.env.NodeMAILER_USER,
      to: to,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(`${new Date().toLocaleString()} :Email sent ...`);
  } catch (error) {
    logger.error(`${new Date().toLocaleString()} : error sending email`);
    throw new AppError("failed sending email", 500, "error");
  }
};

export default sendEmail;
