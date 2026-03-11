/* eslint-disable */
// @ts-nocheck

// For Vercel, we need to use the source files directly
// The build process will handle transpilation
import { initializeApp } from "../src/init.js";
import app from "../src/app.js";

// Initialize on first request
let initialized = false;

const handler = async (req, res) => {
  if (!initialized) {
    try {
      await initializeApp();
      initialized = true;
    } catch (err) {
      console.error("Initialization failed:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to initialize",
        error: err.message,
      });
    }
  }

  // Pass to Express app
  app(req, res);
};

export default handler;
