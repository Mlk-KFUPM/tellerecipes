require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./db");
const authRoutes = require("./routes/auth.route");
const userRoutes = require("./routes/user.route");
const chefRoutes = require("./routes/chef.route");
const adminRoutes = require("./routes/admin.route");

const app = express();

const expandOrigin = (origin) => {
  const trimmed = origin.trim();
  if (!trimmed) return [];
  if (trimmed === "*") return ["*"];
  if (trimmed.includes("://")) return [trimmed];
  // Accept bare host[:port] entries by adding http/https
  return [`http://${trimmed}`, `https://${trimmed}`];
};

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];
const isDev = process.env.NODE_ENV !== "production";
const configuredOrigins = (process.env.CLIENT_ORIGINS || "")
  .split(",")
  .flatMap(expandOrigin);

const allowedOriginSet = new Set(isDev ? [...configuredOrigins, ...defaultOrigins] : configuredOrigins);
const allowAllOrigins = allowedOriginSet.has("*");
const effectiveOrigins = allowAllOrigins
  ? []
  : Array.from(allowedOriginSet).filter((origin) => origin !== "*");

const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow requests with no origin (like Postman or server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // 2. Check if the origin matches our allowed list
    if (allowedOriginSet.has(origin) || allowAllOrigins) {
      return callback(null, true);
    }

    // 3. Block otherwise
    console.warn(`BLOCKED BY CORS: ${origin}`); 
    console.warn(`Allowed Origins are:`, Array.from(allowedOriginSet));
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/chef", chefRoutes);
app.use("/admin", adminRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
