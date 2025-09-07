import React, { useState } from "react";
import AuthPage from "./pages/AuthPage";
import SearchPage from "./pages/SearchPage";
import MapPage from "./pages/MapPage";
import TripTrackerPage from "./pages/TripTrackerPage";

const GOOGLE_MAPS_API_KEY = "AIzaSyCGhL6SeLkvT6Jw2mJM7oeS7JBpaZ45hZk"; // add your real key

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [stage, setStage] = useState(token ? "search" : "auth");
  const [city, setCity] = useState("");
  const [trip, setTrip] = useState(null);

  // Auth success handler
  function onAuth(tokenValue, userName) {
    setToken(tokenValue);
    setUsername(userName);
    localStorage.setItem("token", tokenValue);
    localStorage.setItem("username", userName);
    setStage("search");
  }

  // Logout handler
  function onLogout() {
    setToken(null);
    setUsername(null);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setStage("auth");
    setCity("");
    setTrip(null);
  }

  // Search confirm handler
  function onSearchConfirm(cityName) {
    setCity(cityName);
    setStage("map");
  }

  // Trip start handler
  function onTripStart(newTrip) {
    setTrip(newTrip);
    setStage("track");
  }

  // Trip end handler
  function onTripEnd() {
    setTrip(null);
    setStage("search");
  }

  if (stage === "auth") {
    return <AuthPage onAuth={onAuth} />;
  }

  if (stage === "search") {
    return (
      <SearchPage
        token={token}
        onSearchConfirm={onSearchConfirm}
        onLogout={onLogout}
        username={username}
      />
    );
  }

  if (stage === "map") {
    return (
      <MapPage
        city={city}
        token={token}
        onTripStart={onTripStart}
        onBack={() => setStage("search")}
        onLogout={onLogout}
        username={username}
      />
    );
  }

  if (stage === "track" && trip) {
    return (
      <TripTrackerPage
        trip={trip}
        token={token}
        onTripEnd={onTripEnd}
        onLogout={onLogout}
        username={username}
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
      />
    );
  }

  return <div>Loading...</div>;
}
