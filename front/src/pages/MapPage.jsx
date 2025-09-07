    import React, { useEffect, useState } from "react";

    const API_MAP_BASE = "http://localhost:5000/api/map/city-coordinates";
    const API_TRIP_START = "http://localhost:5000/api/trip/start";

    export default function MapPage({ city, token, onTripStart, onBack, onLogout, username }) {
    const [coords, setCoords] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchCoordinates() {
        try {
            const res = await fetch(API_MAP_BASE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ city }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setCoords(data.data.coordinates);
        } catch (err) {
            setError(err.message);
        }
        }
        fetchCoordinates();
    }, [city, token]);

    async function startTrip() {
        try {
        const res = await fetch(API_TRIP_START, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ city, destLat: coords.lat, destLon: coords.lon }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        onTripStart(data.data);
        } catch (err) {
        setError(err.message);
        }
    }

    return (
        <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
        <h2>Welcome, {username}</h2>
        <button onClick={onLogout} style={{ marginBottom: 10 }}>
            Logout
        </button>
        <button onClick={onBack} style={{ marginBottom: 10 }}>
            Back to Search
        </button>
        <h3>Map for {city}</h3>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {coords ? (
            <div>
            <iframe
                title="City Map"
                width="100%"
                height="400px"
                src={`https://maps.google.com/maps?q=${coords.lat},${coords.lon}&z=12&output=embed`}
                style={{ border: "1px solid #ccc" }}
            />
            <button onClick={startTrip} style={{ marginTop: 10 }}>
                Start Trip
            </button>
            </div>
        ) : (
            <p>Loading map...</p>
        )}
        </div>
    );
    }
