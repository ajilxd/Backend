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

const app = express();
const S3 = new AWS.S3({
  endpoint: new AWS.Endpoint("s3.eu-north-1.amazonaws.com"),
});

export const generatePresignedUrl = (key: string) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    Expires: 60 * 5, // 5 minutes
    ContentType: "image/*", // optional
  };

  return S3.getSignedUrlPromise("putObject", params);
};
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

const userSocketMap: { [key: string]: string } = {};

interface CustomSocket extends Socket {
  userId?: string;
}

io.on("connection", (socket) => {
  socket.on("user-connected", (data) => {
    const customSocket = socket as CustomSocket;
    userSocketMap[data.userId] = socket.id;
    customSocket.userId = data.userId;
    console.log(` User ${data.userId} registered with socket ${socket.id}`);
    io.emit("online-users", Object.keys(userSocketMap));
  });

  socket.on("join-room", (data) => {
    console.log("data", data);
    socket.join(data.room);
    console.log(` User ${socket.id} joined room: ${data.room}`);
  });

  socket.on("send-message", (data) => {
    socket.to(data.room).emit("receive-message", data);
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    for (const [userId, sockid] of Object.entries(userSocketMap)) {
      if (sockid === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
    io.emit("online-users", Object.keys(userSocketMap));
  });
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

app.post("/api/v1/refresh-token", refreshTokenHandler);
app.post("/api/v1/stripe/webhooks", handleWebhook);

console.log(typeof generatePresignedUrl);
app.get("/api/v1/s3/presign", getPresignedUploadUrl);

app.use(errorHandler);

connectMongodb();

server.listen(config.PORT, () => {
  logger.info(` Server running at http://localhost:${config.PORT}`);
});
