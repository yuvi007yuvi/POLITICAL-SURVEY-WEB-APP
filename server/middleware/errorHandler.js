import { ZodError } from "zod";

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
};

export const errorHandler = (error, req, res, next) => {
  console.error(">>> API ERROR:", error);

  if (error.name === "ZodError") {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: error.flatten()
    });
  }

  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((err) => err.message);
    return res.status(400).json({
      success: false,
      message: "Data validation failed",
      errors: messages
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid identifier: ${error.value}`
    });
  }

  if (error.code === 11000) {
    const field = error.keyPattern ? Object.keys(error.keyPattern)[0] : "identifier";
    return res.status(400).json({
      success: false,
      message: `A project with this ${field} already exists.`
    });
  }

  if (error.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "An unexpected system anomaly occurred.";

  res.status(statusCode).json({
    success: false,
    message,
    details: error.details || null
  });
};

