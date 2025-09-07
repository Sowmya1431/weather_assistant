    import React, { useState } from "react";

    const API_BASE = "http://localhost:5000/api/auth";

    export default function AuthPage({ onAuth }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        try {
        const url = isRegistering ? "/register" : "/login";
        const body = isRegistering
            ? form
            : { email: form.email, password: form.password };
        const res = await fetch(API_BASE + url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        onAuth(data.token, data.name || data.email);
        } catch (err) {
        setError(err.message);
        }
    }

    return (
        <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
        <h2>{isRegistering ? "Register" : "Login"}</h2>
        <form onSubmit={handleSubmit}>
            {isRegistering && (
            <input
                required
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            )}
            <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
            required
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="submit" style={{ marginTop: 10 }}>
            {isRegistering ? "Register" : "Login"}
            </button>
        </form>
        <button
            onClick={() => {
            setIsRegistering(!isRegistering);
            setError("");
            }}
            style={{ marginTop: 10 }}
        >
            {isRegistering
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
    }
