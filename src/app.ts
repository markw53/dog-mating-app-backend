import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import dogRoutes from "./routes/dogRoutes";
// Import other routes as needed

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/dogs", dogRoutes);
// Add other routes as needed

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
