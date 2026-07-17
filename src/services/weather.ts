/**
 * Weather snapshot displayed on the Dashboard weather card.
 */
export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  lat: number;
  lon: number;
}

interface OpenWeatherResponse {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  wind: {
    speed: number;
  };
}

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const DEFAULT_LOCATION = import.meta.env.VITE_DEFAULT_LOCATION || "Hebden Bridge";

/**
 * Resolves user coordinates through the browser geolocation API.
 *
 * @returns Latitude and longitude pair for weather lookup.
 */
const getCoordinates = (): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

/**
 * Fetches weather using geographic coordinates or geolocation.
 *
 * Falls back to a configured default location when geolocation is denied.
 *
 * @param lat - Optional latitude override.
 * @param lon - Optional longitude override.
 * @returns Weather snapshot for the resolved location.
 */
export const fetchWeather = async (lat?: number, lon?: number): Promise<WeatherData> => {
  if (!API_KEY) {
    throw new Error(
      "Weather API key not configured. Add VITE_OPENWEATHER_API_KEY to .env"
    );
  }

  let coords: { lat: number; lon: number } = {
    lat: lat ?? 0,
    lon: lon ?? 0,
  }

  // If coordinates not provided, try to get them from geolocation
  if (lat === undefined || lon === undefined) {
    try {
      coords = await getCoordinates();
    } catch (error) {
      console.warn("Geolocation failed, using default location:", error);
      // Fall back to geocoding by location name
      return fetchWeatherByLocation(DEFAULT_LOCATION);
    }
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data: OpenWeatherResponse = await response.json();

    return {
      location: data.name,
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 10) / 10, // Round to 1 decimal
      lat: coords.lat,
      lon: coords.lon,
    };
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    throw error;
  }
};

/**
 * Fetches weather data directly by location name.
 *
 * @param location - Human-readable location query.
 * @returns Weather snapshot for the requested location.
 */
export const fetchWeatherByLocation = async (
  location: string
): Promise<WeatherData> => {
  if (!API_KEY) {
    throw new Error(
      "Weather API key not configured. Add VITE_OPENWEATHER_API_KEY to .env"
    );
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data: OpenWeatherResponse = await response.json();

    return {
      location: data.name,
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 10) / 10,
      lat: 0,
      lon: 0,
    };
  } catch (error) {
    console.error("Failed to fetch weather for location:", error);
    throw error;
  }
};
