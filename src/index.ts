import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import http from "http";
import path from "path";

import CONFIG from "./config/config";
import routes from "./routes/index";
import dbConfig from "./config/dbConfig";
import { errorMiddleware } from "./exceptions/errors";
import { initSocket } from "./sockets/socketSetup";

const app = express();
const server = http.createServer(app);
const PORT = CONFIG.ENV.PORT;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.get("/", (_req, res) => {
  res.send("API is running...");
});
app.use("/api/v1", routes);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// MongoDB connection
const env = process.env.NODE_ENV === "production" ? "production" : "development";
const { uri, options } = dbConfig[env];

mongoose
  .connect(uri, options)
  .then(() => {
    console.log("Connected to MongoDB successfully.");
  })
  .catch((err: unknown) => {
    console.error("Unable to connect to MongoDB:", err);
  });

// Socket.io
initSocket(server);

// Error middleware (must be last)
app.use(errorMiddleware);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
