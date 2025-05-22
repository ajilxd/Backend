import AWS from "aws-sdk";
import { Server } from "socket.io";
import http from "http";
import express from "express";
import { errorHandler } from "./errors/errorHandler";
import { connectMongodb, corsOptions } from "./utils";
import config from "./config";
import { ownerRouter } from "./routes/ownerRoute";
import { adminRouter } from "./routes/adminRoute";
import { Socket } from "socket.io";

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
import { taskRouter } from "./routes/taskRoute";
import { documentRouter } from "./routes/docRoute";
import { getPresignedUploadUrl } from "./controllers/s3Controller";
import { registerSocketHandlers } from "./controllers/socketController";
import { chatRouter } from "./routes/chatRoute";
import { meetingRouter } from "./routes/meetingRoute";
import { createWorker } from "./controllers/mediasoupHandler";
import { registerPeerSocketHandlers } from "./controllers/registerPeerSocketHandlers";

const app = express();

const server = http.createServer(app);

app.use(
  express.json({
    limit: "5mb",
    verify: (req: any, res: any, buf: any) => {
      req.rawBody = buf.toString();
    },
  })
);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const peerNamespace = io.of("/peers");

peerNamespace.on("connection", (socket) => {
  console.log("Peer connected:", socket.id);
  registerPeerSocketHandlers(peerNamespace, socket);
});

io.on("connection", (socket) => {
  registerSocketHandlers(io, socket);
});

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
app.use("/api/v1/task", taskRouter);
app.use("/api/v1/document", documentRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/meeting", meetingRouter);

app.post("/api/v1/refresh-token", refreshTokenHandler);
app.post("/api/v1/stripe/webhooks", handleWebhook);

app.get("/api/v1/s3/presign", getPresignedUploadUrl);

app.use(errorHandler);

async function init() {
  try {
    await connectMongodb();
    await createWorker();

    server.listen(config.PORT, () => {
      logger.info(`🚀 Server running at http://localhost:${config.PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
}

init();
