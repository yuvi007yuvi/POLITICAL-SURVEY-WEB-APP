import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import coreRoutes from "./routes/coreRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import surveyRoutes from "./routes/surveyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { connectDatabase } from "./config/db.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import seedRolesAndAdmin from "./utils/seed.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use("/api/roles", roleRoutes);
app.use("/api/uploads", uploadRoutes);

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(notFoundHandler);
app.use(errorHandler);

const port = process.env.PORT || 5000;

connectDatabase()
  .then(async () => {
    await seedRolesAndAdmin();
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Server startup failed", error);
    process.exit(1);
  });

