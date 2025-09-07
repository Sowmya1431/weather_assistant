import express from "express";
import { getCityCoordinates, getLiveWeather, getAlerts } from "../controllers/mapController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 1️⃣ Get city coordinates for map
router.post("/city-coordinates", protect, getCityCoordinates);

// 2️⃣ Get live weather updates for user location
router.post("/live-weather", protect, getLiveWeather);

// 3️⃣ Get weather alerts
router.post("/alerts", protect, getAlerts);

export default router;
