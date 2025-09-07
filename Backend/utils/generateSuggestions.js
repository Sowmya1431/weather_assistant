    export const generateSuggestions = (weatherData) => {
    const suggestions = [];

    const temp = weatherData.main.temp; // in Celsius
    const condition = weatherData.weather[0].main.toLowerCase();
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;

    // 🌡 Temperature based suggestions
    if (temp < 10) suggestions.push("It's very cold ❄️ — Wear warm clothes 🧥");
    else if (temp >= 10 && temp < 20) suggestions.push("Cool weather — Light jacket recommended 🧥");
    else if (temp >= 30) suggestions.push("Hot day ☀️ — Stay hydrated 💧");

    // ☁️ Weather condition based suggestions
    if (condition.includes("rain")) suggestions.push("Carry an umbrella ☔");
    if (condition.includes("snow")) suggestions.push("Wear snow boots 🥾");
    if (condition.includes("clear")) suggestions.push("Wear sunglasses 🕶");
    if (condition.includes("storm")) suggestions.push("Avoid travel if possible ⛈");

    // 💧 Humidity suggestions
    if (humidity > 80) suggestions.push("Humidity is high 🌫 — Drink extra water");
    if (humidity < 30) suggestions.push("Dry weather 🌵 — Use moisturizer");

    // 💨 Wind speed suggestions
    if (windSpeed > 10) suggestions.push("Strong winds 💨 — Secure loose items");

    return suggestions;
    };
