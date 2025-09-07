    import axios from "axios";
    import Trip from "../models/Trip.js";
    import { io } from "../server.js"; // Ensure io is exported from server/index.js

    // ---------------------
    // Constants
    // ---------------------
    const EARTH_RADIUS = 6371e3; // meters
    const AUTO_COMPLETE_DISTANCE = 50; // meters (configurable)

    // ---------------------
    // Haversine formula
    // ---------------------
    const haversineDistance = (coords1, coords2) => {
    const toRad = (x) => (x * Math.PI) / 180;

    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lon - coords1.lon);

    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS * c; // distance in meters
    };

    // ---------------------
    // Start a new trip
    // ---------------------
    export const startTrip = async (req, res) => {
    try {
        const { city, destLat, destLon, destAddress } = req.body;

        if (!city || !destLat || !destLon) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const trip = await Trip.create({
        user: req.user._id,
        city,
        destination: { lat: destLat, lon: destLon, address: destAddress || "" },
        status: "active",
        startedAt: new Date(),
        });

        return res.status(201).json({ success: true, trip });
    } catch (error) {
        console.error("Error starting trip:", error);
        return res.status(500).json({ success: false, message: "Failed to start trip" });
    }
    };

    // ---------------------
    // Update location
    // ---------------------
    export const updateLocation = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { lat, lon } = req.body;

        if (!tripId || lat == null || lon == null) {
        return res.status(400).json({ success: false, message: "Invalid tripId or coordinates" });
        }

        const trip = await Trip.findOne({ _id: tripId, status: "active" });
        if (!trip) return res.status(404).json({ success: false, message: "Trip not found or completed" });

        // Store location
        trip.locations.push({ lat, lon, timestamp: new Date() });
        await trip.save();

        // Distance calculation
        const distance = haversineDistance(
        { lat, lon },
        { lat: trip.destination.lat, lon: trip.destination.lon }
        );

        // ETA via Google Maps
        let eta = null;
        try {
        const googleRes = await axios.get(
            `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${lat},${lon}&destinations=${trip.destination.lat},${trip.destination.lon}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );

        const element = googleRes.data.rows?.[0]?.elements?.[0];
        if (element?.status === "OK") {
            eta = element.duration.text;
        }
        } catch (err) {
        console.warn("Google Maps ETA fetch failed:", err.response?.data || err.message);
        }

        // Weather fetch
        let weather = null;
        let alerts = [];
        try {
        const weatherRes = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
        );

        weather = weatherRes.data;
        const condition = weather.weather[0].main.toLowerCase();

        if (condition.includes("rain")) alerts.push("⚠ Rain ahead – drive carefully!");
        if (condition.includes("snow")) alerts.push("❄ Snow ahead – roads might be slippery!");
        if (condition.includes("storm")) alerts.push("🌩 Storm alert – stay cautious!");
        } catch (err) {
        console.warn("Weather fetch failed:", err.response?.data || err.message);
        }

        // Emit real-time updates
        io.to(tripId).emit("tripUpdate", {
        tripId,
        currentLocation: { lat, lon },
        distance,
        eta,
        weather,
        alerts,
        });

        // Auto-complete trip if within threshold
        if (distance < AUTO_COMPLETE_DISTANCE) {
        trip.status = "completed";
        trip.endedAt = new Date();
        await trip.save();
        io.to(tripId).emit("arrival", { tripId, message: "Arrived at destination" });
        }

        return res.status(200).json({ success: true, distance, eta, weather, alerts });
    } catch (error) {
        console.error("Error updating location:", error);
        return res.status(500).json({ success: false, message: "Failed to update location" });
    }
    };

    // ---------------------
    // Complete trip manually
    // ---------------------
    export const completeTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const trip = await Trip.findOne({ _id: tripId, status: "active" });
        if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });

        trip.status = "completed";
        trip.endedAt = new Date();
        await trip.save();

        io.to(tripId).emit("tripCompleted", { tripId });

        return res.status(200).json({ success: true, message: "Trip completed" });
    } catch (error) {
        console.error("Error completing trip:", error);
        return res.status(500).json({ success: false, message: "Failed to complete trip" });
    }
    };

    // ---------------------
    // Cancel trip
    // ---------------------
    export const cancelTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const trip = await Trip.findOne({ _id: tripId, status: "active" });
        if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });

        trip.status = "canceled";
        trip.endedAt = new Date();
        await trip.save();

        io.to(tripId).emit("tripCancelled", { tripId });

        return res.status(200).json({ success: true, message: "Trip cancelled" });
    } catch (error) {
        console.error("Error cancelling trip:", error);
        return res.status(500).json({ success: false, message: "Failed to cancel trip" });
    }
    };
