import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import coreRoutes from "./routes/coreRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import surveyRoutes from "./routes/surveyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { connectDatabase } from "./config/db.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(",") || "*"
  })
);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300
  })
);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Political Soch API is running"
  });
});

app.use("/api", coreRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboardStats", dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const port = process.env.PORT || 5000;

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Server startup failed", error);
    process.exit(1);
  });

