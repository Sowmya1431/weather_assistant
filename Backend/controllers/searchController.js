    import Search from "../models/Search.js";
    import axios from "axios";
    import { generateSuggestions } from "../utils/generateSuggestions.js";

    export const searchCity = async (req, res) => {
    try {
        const { city } = req.body;
        if (!city) {
        return res.status(400).json({ message: "City name is required" });
        }

        // 1️⃣ Call weather API
        const API_KEY = process.env.OPENWEATHER_API_KEY;
        const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        const weatherData = weatherResponse.data;

        // 🆕  Add unit and format temperature
        if (weatherData.main) {
        weatherData.main.unit = "°C";
        weatherData.main.temp = parseFloat(weatherData.main.temp.toFixed(1));
        weatherData.main.temp_min = parseFloat(weatherData.main.temp_min.toFixed(1));
        weatherData.main.temp_max = parseFloat(weatherData.main.temp_max.toFixed(1));
        weatherData.main.feels_like = parseFloat(weatherData.main.feels_like.toFixed(1));
        }

        // 🆕  Add timestamp
        const updatedAt = new Date().toISOString();

        // 2️⃣ Generate suggestions dynamically
        const suggestions = generateSuggestions(weatherData);

        // 3️⃣ Store in database
        const search = await Search.create({
        user: req.user.id,
        city,
        weather: weatherData,
        suggestions,
        updated_at: updatedAt,
        });

        // 4️⃣ Send response
        res.status(201).json({
        success: true,
        message: "Weather fetched successfully",
        data: { 
            city, 
            weather: weatherData, 
            suggestions, 
            updated_at: updatedAt 
        },
        });
    } catch (error) {
        console.error("Error fetching weather:", error.message);
        res.status(500).json({ message: "Failed to fetch weather data" });
    }
    };

    // Get all searches for the logged-in user
    export const getSearchHistory = async (req, res) => {
    try {
        // Find all searches for the user, sorted by most recent first
        const searches = await Search.find({ user: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({
        success: true,
        message: "Search history fetched successfully",
        data: searches,
        });
    } catch (error) {
        console.error("Error fetching search history:", error.message);
        res.status(500).json({ message: "Failed to fetch search history" });
    }
    };
