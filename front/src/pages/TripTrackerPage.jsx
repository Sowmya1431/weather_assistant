    import React, { useEffect, useState, useRef } from "react";
    import io from "socket.io-client";
    import {
    GoogleMap,
    Marker,
    Polyline,
    useJsApiLoader,
    } from "@react-google-maps/api";

    const API_TRIP_BASE = "http://localhost:5000/api/trip";
    const API_MAP_BASE = "http://localhost:5000/api/map";
    const SOCKET_URL = "http://localhost:5000";

    const containerStyle = {
    width: "100%",
    height: "400px",
    };

    const mapOptions = {
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    };

    export default function TripTrackerPage({
    trip,
    token,
    onTripEnd,
    onLogout,
    username,
    googleMapsApiKey,
    }) {
    const [status, setStatus] = useState(trip.status);
    const [eta, setETA] = useState("Loading...");
    const [distance, setDistance] = useState(null);
    const [weather, setWeather] = useState(null);
    const [alerts, setAlerts] = useState([]);

    const [userPosition, setUserPosition] = useState(null);
    const [locationAllowed, setLocationAllowed] = useState(null); // null = unknown, true or false
    const [locationError, setLocationError] = useState(null);

    const socket = useRef(null);
    const watchIdRef = useRef(null);

    // Load Google Maps JS API
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey,
    });

    // Setup WebSocket connection and listeners
    useEffect(() => {
        socket.current = io(SOCKET_URL, { transports: ["websocket"] });

        socket.current.emit("joinTrip", { tripId: trip._id });

        socket.current.on("tripUpdate", (data) => {
        setETA(data.eta?.text || "N/A");
        setDistance((data.remainingDistance / 1000).toFixed(2)); // meters to km
        setStatus(data.status);
        });

        socket.current.on("arrival", (data) => {
        setStatus("completed");
        alert(data.message);
        if (onTripEnd) onTripEnd();
        });

        return () => {
        socket.current.disconnect();
        };
    }, [trip._id, onTripEnd]);

    // Request location permission and start watching position
    useEffect(() => {
        if (!navigator.geolocation) {
        setLocationAllowed(false);
        setLocationError("Geolocation is not supported by your browser.");
        return;
        }

        // Use Permissions API if available
        if (navigator.permissions) {
        navigator.permissions.query({ name: "geolocation" }).then((result) => {
            if (result.state === "granted") {
            setLocationAllowed(true);
            startWatchingLocation();
            } else if (result.state === "prompt") {
            requestCurrentPosition();
            } else if (result.state === "denied") {
            setLocationAllowed(false);
            setLocationError(
                "Location permission denied. Please enable location to continue."
            );
            }
            result.onchange = () => {
            if (result.state === "granted") {
                setLocationAllowed(true);
                startWatchingLocation();
            } else if (result.state === "denied") {
                setLocationAllowed(false);
                setLocationError(
                "Location permission denied. Please enable location to continue."
                );
                stopWatchingLocation();
            }
            };
        });
        } else {
        requestCurrentPosition();
        }

        function requestCurrentPosition() {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
            setLocationAllowed(true);
            setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            startWatchingLocation();
            },
            (err) => {
            setLocationAllowed(false);
            setLocationError("Location permission denied or unavailable.");
            }
        );
        }

        function startWatchingLocation() {
        watchIdRef.current = navigator.geolocation.watchPosition(
            async (pos) => {
            const { latitude, longitude } = pos.coords;
            setUserPosition({ lat: latitude, lng: longitude });
            try {
                const res = await fetch(`${API_TRIP_BASE}/${trip._id}/location`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ lat: latitude, lon: longitude }),
                });
                if (!res.ok) {
                const errData = await res.json();
                console.error("Error sending location:", errData.message);
                }
            } catch (error) {
                console.error("Network error sending location:", error);
            }
            },
            (error) => {
            setLocationError(error.message);
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
        }

        function stopWatchingLocation() {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        }

        return () => {
        stopWatchingLocation();
        };
    }, [trip._id, token]);

    // Fetch weather and alerts every 2 minutes
    useEffect(() => {
        async function fetchWeatherAndAlerts() {
        try {
            const weatherRes = await fetch(`${API_MAP_BASE}/live-weather`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ lat: trip.destination.lat, lon: trip.destination.lon }),
            });
            const weatherData = await weatherRes.json();
            if (weatherData.data) setWeather(weatherData.data.weather);

            const alertsRes = await fetch(`${API_MAP_BASE}/alerts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ lat: trip.destination.lat, lon: trip.destination.lon }),
            });
            const alertsData = await alertsRes.json();
            setAlerts(alertsData.data?.alerts || []);
        } catch (err) {
            console.error("Error fetching weather or alerts:", err);
        }
        }

        fetchWeatherAndAlerts();
        const interval = setInterval(fetchWeatherAndAlerts, 2 * 60 * 1000);
        return () => clearInterval(interval);
    }, [trip.destination, token]);

    if (!isLoaded) {
        return <div>Loading map...</div>;
    }

    const markers = [];
    if (userPosition) {
        markers.push({ position: userPosition, label: "You" });
    }
    markers.push({
        position: { lat: trip.destination.lat, lng: trip.destination.lon },
        label: "Destination",
    });

    const polylinePath =
        userPosition !== null
        ? [userPosition, { lat: trip.destination.lat, lng: trip.destination.lon }]
        : [];

    return (
        <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
        <h2>Welcome, {username}</h2>
        <button onClick={onLogout} style={{ marginBottom: 10 }}>
            Logout
        </button>
        <h3>Tracking Trip to {trip.city}</h3>

        {!locationAllowed && (
            <div style={{ color: "red", marginBottom: 10 }}>
            <p>{locationError || "Please enable location to start live tracking."}</p>
            <button onClick={() => window.location.reload()}>Retry Location</button>
            </div>
        )}

        <GoogleMap
            mapContainerStyle={containerStyle}
            center={userPosition || { lat: trip.destination.lat, lng: trip.destination.lon }}
            zoom={13}
            options={mapOptions}
        >
            {markers.map((marker, idx) => (
            <Marker key={idx} position={marker.position} label={marker.label} />
            ))}
            {polylinePath.length === 2 &&
            polylinePath.every(
                (p) => p && typeof p.lat === "number" && typeof p.lng === "number"
            ) && <Polyline path={polylinePath} options={{ strokeColor: "#1976d2" }} />}
        </GoogleMap>

        <p>Status: {status}</p>
        <p>ETA: {eta}</p>
        <p>Remaining distance: {distance ? `${distance} km` : "Calculating..."}</p>

        {weather && (
            <p>
            Current Weather: {weather.weather[0].description}, Temp: {weather.main.temp}°C
            </p>
        )}

        {alerts.length > 0 && (
            <div style={{ color: "red" }}>
            <strong>Alerts:</strong>
            <ul>
                {alerts.map((alertMsg, i) => (
                <li key={i}>{alertMsg}</li>
                ))}
            </ul>
            </div>
        )}
        </div>
    );
    }
