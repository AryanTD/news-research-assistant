require("dotenv").config();
const axios = require("axios");

async function getWeather(location) {
  try {
    const apiKey = process.env.WEATHER_API_KEY;

    // Get coordinates for the location
    const geoResponse = await axios.get(
      "http://api.openweathermap.org/geo/1.0/direct",
      {
        params: {
          q: location,
          limit: 1,
          appid: apiKey,
        },
      }
    );

    if (geoResponse.data.length === 0) {
      throw new Error(`Location "${location}" not found`);
    }

    const { lat, lon, name, country } = geoResponse.data[0];

    // Get weather data
    const weatherResponse = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          lat: lat,
          lon: lon,
          appid: apiKey,
          units: "metric", // Celsius
        },
      }
    );

    const weather = weatherResponse.data;

    return {
      location: `${name}, ${country}`,
      temperature: weather.main.temp,
      feelsLike: weather.main.feels_like,
      description: weather.weather[0].description,
      humidity: weather.main.humidity,
      windSpeed: weather.wind.speed,
    };
  } catch (error) {
    if (error.message.includes("not found")) {
      throw error;
    }
    throw new Error(`Failed to fetch weather: ${error.message}`);
  }
}

module.exports = { getWeather };
