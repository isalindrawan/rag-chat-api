const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const config = require("./config/config");
const routes = require("./routes");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

// Trust proxy for Vercel
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// CORS middleware - Updated for Vercel deployment
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [
            process.env.FRONTEND_URL,
            /\.vercel\.app$/,
            /\.vercel\.dev$/,
            config.corsOrigin,
          ].filter(Boolean)
        : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Rate limiting - Adjusted for serverless
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max:
    process.env.NODE_ENV === "production" ? 100 : config.rateLimitMaxRequests,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Logging middleware - Reduced for production
if (process.env.NODE_ENV !== "production") {
  app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Conditional static file serving (not needed in Vercel serverless)
if (!process.env.VERCEL) {
  app.use(
    "/uploads",
    express.static(path.join(__dirname, "../public/uploads")),
  );
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    platform: process.env.VERCEL ? "vercel" : "local",
  });
});

// API routes
app.use("/api", routes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Only start server if this file is run directly (not in Vercel)
if (require.main === module && !process.env.VERCEL) {
  const PORT = config.port || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${config.nodeEnv} mode`);
  });
}

module.exports = app;
