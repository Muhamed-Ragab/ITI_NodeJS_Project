/* eslint-disable */
// @ts-nocheck
import app from "../dist/app.js";
import connectDB from "../dist/config/db.js";
import { registerEmailEventListeners } from "../dist/services/notifications/email-events.js";
import * as emailService from "../dist/services/notifications/email-provider.js";

// Initialize database and email listeners
let initialized = false;

const initialize = async () => {
  if (initialized) {
    return;
  }

  try {
    await connectDB();
    registerEmailEventListeners(emailService);
    initialized = true;
  } catch (err) {
    console.error("Initialization error:", err);
    throw err;
  }
};

// Initialize on import
initialize().catch((err) => {
  console.error("Failed to initialize:", err);
});

export default app;
