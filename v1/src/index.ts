import express from "express";
import { errorHandler } from "./errors/errorHandler";
import { connectMongodb, corsOptions } from "./utils";
import config from "./config";
import { ownerRouter } from "./routes/ownerRoute";
import { adminRouter } from "./routes/adminRoute";

import { managerRouter } from "./routes/managerRoute";
import cookieParser from "cookie-parser";
import { initializeStripe } from "./middleware/stripe";
import { handleWebhook } from "./controllers/webhook";
import { paymentRouter } from "./routes/paymentRoute";

import cors from "cors";
import { refreshTokenHandler } from "./controllers/refreshTokenHandler";

import { httpLoggerMiddleware, logger } from "./utils/logger";
import { authRouter } from "./routes/authRoute";
import { userRouter } from "./routes/userRoute";
import { spaceRouter } from "./routes/spaceRoute";

const app = express();

app.use(
  express.json({
    limit: "5mb",
    verify: (req: any, res: any, buf: any) => {
      req.rawBody = buf.toString();
    },
  })
);

app.use(httpLoggerMiddleware);

app.use(cookieParser());
app.use(cors(corsOptions));

export const stripeInstance = initializeStripe();

app.use("/api/v1/owner", ownerRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/manager", managerRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/space", spaceRouter);
app.use("/api/v1/task", managerRouter);

app.post("/api/v1/refresh-token", refreshTokenHandler);

app.post(
  "/api/v1/stripe/webhooks",

  handleWebhook
);

app.use(errorHandler);

connectMongodb();

app.listen(config.PORT, () => {
  logger.info(`server started running at ${config.PORT}`);
});
