import express, { Express, Request, Response, NextFunction } from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger";
import { initializeSocket } from "./config/socket";
import dogRoutes from "./routes/dogRoutes";
import matchRoutes from "./routes/matchRoutes";
import messageRoutes from "./routes/messageRoutes";
import userRoutes from "./routes/userRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import logger from "./utils/logger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

dotenv.config();

const app: Express = express();
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
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
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes); // Fixed the path here (was missing a slash)

// Handle 404 errors
app.use(notFoundHandler);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(
    `API Documentation available at http://localhost:${PORT}/api-docs`
  );
});
