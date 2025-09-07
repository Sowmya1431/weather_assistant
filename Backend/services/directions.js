    import axios from "axios";

    export async function getGoogleMapsETA(originLat, originLon, destLat, destLon) {
    const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLon}&destination=${destLat},${destLon}&key=${API_KEY}`;

    const response = await axios.get(url);
    const route = response.data.routes?.[0]?.legs?.[0];

    if (!route) return null;

    return {
        durationText: route.duration.text,
        durationSeconds: route.duration.value,
        distanceText: route.distance.text,
        distanceMeters: route.distance.value
    };
    }
