    import express from "express";
    import dotenv from "dotenv";
    import cors from "cors";
    import http from "http";                  // <-- Added
    import { Server } from "socket.io";       // <-- Added
    import connectDB from "./config/db.js";
    import authRoutes from "./routes/authRoutes.js";
    import searchRoutes from "./routes/search.js";
    import mapRoutes from "./routes/map.js";
    import tripRoutes from "./routes/trip.js";

    dotenv.config();
    connectDB();

    const app = express();
    app.use(cors());
    app.use(express.json());

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/search", searchRoutes);
    app.use("/api/map", mapRoutes);
    app.use("/api/trip", tripRoutes);

    // --- WebSocket Setup ---
    const server = http.createServer(app); // Wrap express with http
    const io = new Server(server, {
    cors: {
        origin: "*", // change to your frontend URL for production
        methods: ["GET", "POST"]
    }
    });

    io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("joinTrip", ({ tripId }) => {
        socket.join(tripId);
        console.log(`User joined trip room: ${tripId}`);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
    });

    // Export io for use in controllers
    export { io };

    // Start the server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
