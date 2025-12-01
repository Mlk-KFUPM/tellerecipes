const { app } = require("./server");
const { connectDB } = require("./db");

module.exports = async (req, res) => {
  try {
    console.log("Function invoked. Attempting DB connection...");
    await connectDB();
    console.log("DB connected successfully.");
  } catch (error) {
    console.error("CRITICAL: Failed to connect to database:", error);
    // We might want to return a 500 here if DB is critical, 
    // but letting it proceed might allow /health to work if it doesn't use DB.
    // However, for auth routes, it will fail later.
    // Let's return 500 to be explicit.
    return res.status(500).json({ error: "Database connection failed", details: error.message });
  }
  
  return app(req, res);
};
