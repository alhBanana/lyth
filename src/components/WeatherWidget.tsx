import { useEffect, useState } from "react";
import { fetchWeather, type WeatherData } from "../services/weather";

/**
 * Displays current local weather to support daily Story planning.
 */
export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        setLoading(true);
        const data = await fetchWeather();
        setWeather(data);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load weather";
        setError(errorMessage);
        console.error("Weather error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(loadWeather, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="rounded-[1.75rem] border border-[#E8E4DD] bg-[#F8F5EF] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Today</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">—°C</h3>
          </div>
          <div className="rounded-3xl bg-[#2F5D50] px-4 py-3 text-sm font-semibold text-white">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="rounded-[1.75rem] border border-[#E8E4DD] bg-[#F8F5EF] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Today</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">N/A</h3>
          </div>
          <div className="rounded-3xl bg-[#2F5D50] px-4 py-3 text-sm font-semibold text-white">
            {error ? "Error" : "Unavailable"}
          </div>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-[#E8E4DD] bg-[#F8F5EF] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{weather.location}</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">
            {weather.temperature}°C
          </h3>
        </div>
        <div className="rounded-3xl bg-[#2F5D50] px-4 py-3 text-sm font-semibold text-white">
          {weather.condition}
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        {weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}.
        Humidity {weather.humidity}%.
      </p>
    </div>
  );
}
