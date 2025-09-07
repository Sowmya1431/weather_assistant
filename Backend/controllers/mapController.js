    import axios from "axios";
    import { generateSuggestions } from "../utils/generateSuggestions.js";

    // 1️⃣ Get city coordinates
    export const getCityCoordinates = async (req, res) => {
    try {
        const { city } = req.body;
        if (!city) return res.status(400).json({ message: "City name is required" });

        const API_KEY = process.env.OPENWEATHER_API_KEY;
        const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        const weatherData = weatherResponse.data;
        const coordinates = {
        lat: weatherData.coord.lat,
        lon: weatherData.coord.lon,
        };

        res.status(200).json({
        success: true,
        message: "Coordinates fetched successfully",
        data: { city, coordinates },
        });
    } catch (error) {
        console.error("Error fetching city coordinates:", error.message);
        res.status(500).json({ message: "Failed to fetch city coordinates" });
    }
    };

    // 2️⃣ Get live weather for tracking
    export const getLiveWeather = async (req, res) => {
    try {
        const { lat, lon } = req.body;
        if (!lat || !lon) return res.status(400).json({ message: "Coordinates required" });

        const API_KEY = process.env.OPENWEATHER_API_KEY;
        const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        const weatherData = weatherResponse.data;

        // Generate dynamic suggestions based on current weather
        

        const suggestions = generateSuggestions(weatherData);

        res.status(200).json({
        success: true,
        message: "Live weather fetched successfully",
        data: { weather: weatherData, suggestions },
        });
    } catch (error) {
        console.error("Error fetching live weather:", error.message);
        res.status(500).json({ message: "Failed to fetch live weather" });
    }
    };

    // 3️⃣ Optional: alerts for critical weather
    export const getAlerts = async (req, res) => {
    try {
        const { lat, lon } = req.body;
        if (!lat || !lon) return res.status(400).json({ message: "Coordinates required" });

        const API_KEY = process.env.OPENWEATHER_API_KEY;
        const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        const weatherData = weatherResponse.data;
        const alerts = [];

        const condition = weatherData.weather[0].main.toLowerCase();
        const windSpeed = weatherData.wind.speed;
        const temp = weatherData.main.temp;

        if (condition.includes("rain")) alerts.push("It's raining ☔ — Drive carefully");
        if (condition.includes("storm")) alerts.push("Storm alert ⛈ — Avoid travel if possible");
        if (temp > 40) alerts.push("Extreme heat 🌡 — Stay hydrated");
        if (windSpeed > 15) alerts.push("Strong winds 💨 — Secure loose items");

        res.status(200).json({
        success: true,
        message: "Weather alerts fetched successfully",
        data: { alerts },
        });
    } catch (error) {
        console.error("Error fetching alerts:", error.message);
        res.status(500).json({ message: "Failed to fetch alerts" });
    }
    };
