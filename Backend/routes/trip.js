import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  startTrip,
  updateLocation,
  completeTrip,
  cancelTrip
} from "../controllers/tripController.js";

const router = express.Router();

// Start a new trip
router.post("/start", protect, startTrip);

// Update current location
router.post("/:tripId/location", protect, updateLocation);

// Mark trip as completed
router.post("/:tripId/complete", protect, completeTrip);

// Cancel a trip
router.post("/:tripId/cancel", protect, cancelTrip);

export default router;
