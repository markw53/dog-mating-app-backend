import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { initializeSocket } from "./config/socket";
import dogRoutes from "./routes/dogRoutes";
import matchRoutes from "./routes/matchRoutes";
import messageRoutes from "./routes/messageRoutes";
import logger from "./utils/logger";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get("user-agent")
  });
  next();
});

// Routes
app.use("/api/dogs", dogRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  }
);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
