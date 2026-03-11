/* eslint-disable */
// @ts-nocheck

// Import from built dist files
import { initializeApp } from "../dist/init.js";
import app from "../dist/app.js";

// Initialize on first request
let initialized = false;
let initError = null;

const handler = async (req, res) => {
  if (!initialized && !initError) {
    try {
      await initializeApp();
      initialized = true;
    } catch (err) {
      console.error("Initialization failed:", err);
      initError = err;
      return res.status(500).json({
        success: false,
        message: "Failed to initialize",
        error: err.message,
      });
    }
  }

  if (initError) {
    return res.status(500).json({
      success: false,
      message: "App not initialized",
      error: initError.message,
    });
  }

  try {
    // Pass to Express app
    app(req, res);
  } catch (err) {
    console.error("Handler error:", err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message,
      });
    }
  }
};

export default handler;
