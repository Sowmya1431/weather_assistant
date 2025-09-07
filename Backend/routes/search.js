import express from "express";
import { searchCity,getSearchHistory } from "../controllers/searchController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, searchCity);
router.get("/history", protect, getSearchHistory);

export default router;
