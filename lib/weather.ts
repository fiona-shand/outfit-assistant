import type { Season, Weather } from "./types";

/** Meteorological season for a date, flipped for the southern hemisphere. */
export function seasonFor(date: string, lat: number): Season {
  const month = Number(date.slice(5, 7));
  const north: Season =
    month <= 2 || month === 12
      ? "winter"
      : month <= 5
        ? "spring"
        : month <= 8
          ? "summer"
          : "autumn";
  if (lat >= 0) return north;
  return ({ winter: "summer", summer: "winter", spring: "autumn", autumn: "spring" } as const)[north];
}

// WMO weather codes used by Open-Meteo.
export function describeCode(code: number): { summary: string; emoji: string } {
  if (code === 0) return { summary: "Clear", emoji: "☀️" };
  if (code <= 2) return { summary: "Partly cloudy", emoji: "⛅" };
  if (code === 3) return { summary: "Overcast", emoji: "☁️" };
  if (code <= 48) return { summary: "Fog", emoji: "🌫️" };
  if (code <= 57) return { summary: "Drizzle", emoji: "🌦️" };
  if (code <= 67) return { summary: "Rain", emoji: "🌧️" };
  if (code <= 77) return { summary: "Snow", emoji: "❄️" };
  if (code <= 82) return { summary: "Showers", emoji: "🌧️" };
  if (code <= 86) return { summary: "Snow showers", emoji: "🌨️" };
  return { summary: "Thunderstorm", emoji: "⛈️" };
}

export async function fetchWeather(
  lat: number,
  lon: number,
  timezone: string,
  date: string,
): Promise<Weather> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone,
    start_date: date,
    end_date: date,
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "apparent_temperature_max",
      "apparent_temperature_min",
      "precipitation_probability_max",
      "precipitation_sum",
      "wind_speed_10m_max",
    ].join(","),
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Weather request failed: ${res.status}`);
  const d = (await res.json()).daily;
  const code = d.weather_code[0] ?? 0;
  return {
    date,
    tempMax: d.temperature_2m_max[0],
    tempMin: d.temperature_2m_min[0],
    feelsMax: d.apparent_temperature_max[0],
    feelsMin: d.apparent_temperature_min[0],
    precipProbability: d.precipitation_probability_max[0] ?? 0,
    precipSum: d.precipitation_sum[0] ?? 0,
    windMax: d.wind_speed_10m_max[0] ?? 0,
    code,
    ...describeCode(code),
    season: seasonFor(date, lat),
  };
}

export function isWet(w: Weather): boolean {
  return w.precipProbability >= 50 || w.precipSum >= 2;
}

/** Short one-liner for notifications, e.g. "☀️ 18°C, clear". */
export function weatherLine(w: Weather): string {
  return `${w.emoji} ${Math.round(w.tempMax)}°/${Math.round(w.tempMin)}°C, ${w.summary.toLowerCase()}`;
}
