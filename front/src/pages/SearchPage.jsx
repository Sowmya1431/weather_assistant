    import React, { useState } from "react";

    const API_BASE = "http://localhost:5000/api/search";

    export default function SearchPage({ token, onSearchConfirm, onLogout, username }) {
    const [city, setCity] = useState("");
    const [result, setResult] = useState(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [error, setError] = useState("");

    async function searchCity() {
        if (!city) return;
        setError("");
        setResult(null);
        try {
        const res = await fetch(API_BASE, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ city }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setResult(data.data);
        setDialogVisible(true);
        } catch (err) {
        setError(err.message);
        }
    }

    function cancel() {
        setDialogVisible(false);
        setResult(null);
        setCity("");
    }

    function ok() {
        if (result) onSearchConfirm(result.city);
    }

    return (
        <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
        <h2>Welcome, {username}</h2>
        <button onClick={onLogout} style={{ marginBottom: 10 }}>
            Logout
        </button>
        <h3>Search Weather by City</h3>
        <input
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchCity()}
        />
        <button onClick={searchCity}>Search</button>
        {error && <p style={{ color: "red" }}>{error}</p>}

        {dialogVisible && result && (
            <div
            style={{
                border: "1px solid #ccc",
                padding: 20,
                marginTop: 20,
                borderRadius: 8,
                backgroundColor: "#f9f9f9",
            }}
            >
            <h4>Weather in {result.city}</h4>
            <p>
                Temperature: {result.weather.main.temp} °C (Feels like:{" "}
                {result.weather.main.feels_like} °C)
            </p>
            <p>Condition: {result.weather.weather[0].description}</p>
            <ul>
                {result.suggestions.map((s, idx) => (
                <li key={idx}>{s}</li>
                ))}
            </ul>
            <button onClick={ok} style={{ marginRight: 10 }}>
                OK
            </button>
            <button onClick={cancel}>Cancel</button>
            </div>
        )}
        </div>
    );
    }
