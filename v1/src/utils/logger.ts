import pino, { destination, Logger } from "pino";
import PinoHttp, { Options } from "pino-http";

export const logger: Logger = pino({
  level: "info",
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  base: { app: "Fluentwork" },
  formatters: {
    bindings(bindings) {
      return {
        pid: process.env.NODE_ENV === "production" ? "REDACTED" : bindings.pid,
        hostname:
          process.env.NODE_ENV === "production"
            ? "REDACTED"
            : bindings.hostname,
      };
    },
  },
  transport: {
    targets: [
      {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
      {
        target: "pino/file",
        level: "error",
        options: {
          destination: "logs/error.log",
          sync: false,
        },
      },
    ],
  },
});

export const pinoLogger = (
  route: string,
  service: string,
  controller: string
) => {
  return logger.child({
    route,
    service,
    controller,
  });
};

const options: Options = {
  logger,
  customLogLevel(req, res, err) {
    if (req.method === "OPTIONS") return "silent";
    if ((res.statusCode && res.statusCode >= 500) || err) return "error";
    if (res.statusCode && res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage(req, res) {
    return `Request handled: ${res.statusCode}`;
  },
  customErrorMessage(req, res, err) {
    return `Request failed: ${res.statusCode} - ${err.message && err.message}`;
  },
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
        ip: req.ip,
        body: req.body,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
    err(err) {
      return {
        message: err.message,
        stack: err.stack,
      };
    },
  },
};

export const httpLoggerMiddleware = PinoHttp(options);
