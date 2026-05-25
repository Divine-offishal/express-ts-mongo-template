import winston, { format } from "winston";

const { combine, printf, timestamp, label } = format;

const myFormat = printf(({ timestamp, level, message, label }) => {
  return `${timestamp} ${label} ${level}: ${message}`;
});

const logger = winston.createLogger({
  format: combine(
    label({ label: "ERROR" }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    myFormat
  ),
  transports: [
    new winston.transports.File({ filename: "log/error.log", level: "error" }),
    new winston.transports.File({ filename: "log/all.log" }),

    new winston.transports.Console({
      level: "error",
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
});

// Ensure unhandled exceptions and rejections are also logged
logger.exceptions.handle(
  new winston.transports.File({ filename: "log/all.log" }),
  new winston.transports.Console()
);
logger.rejections.handle(
  new winston.transports.File({ filename: "log/all.log" }),
  new winston.transports.Console()
);

export default logger;
