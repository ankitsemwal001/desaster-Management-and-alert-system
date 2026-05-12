import { useEffect, useState } from "react";

export interface EnvironmentData {
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  precipitationProb: number | null;
  uv: number | null;
  weatherCode: number | null;
  aqi: number | null;
  pm25: number | null;
  pm10: number | null;
  loading: boolean;
  error: string | null;
  hourly: { time: string[]; temperature: number[]; precipProb: number[] } | null;
}

const empty: EnvironmentData = {
  temperature: null, humidity: null, windSpeed: null, precipitationProb: null,
  uv: null, weatherCode: null, aqi: null, pm25: null, pm10: null,
  loading: true, error: null, hourly: null,
};

export function useEnvironment(lat: number | null, lng: number | null) {
  const [d, setD] = useState<EnvironmentData>(empty);

  useEffect(() => {
    if (lat == null || lng == null) return;
    let cancelled = false;
    const load = async () => {
      try {
        const wxUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,uv_index&hourly=temperature_2m,precipitation_probability&forecast_days=2`;
        const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,pm2_5,pm10`;
        const [w, a] = await Promise.all([
          fetch(wxUrl).then(r => r.json()).catch(() => null),
          fetch(aqUrl).then(r => r.json()).catch(() => null),
        ]);
        if (cancelled) return;
        setD({
          temperature: w?.current?.temperature_2m ?? null,
          humidity: w?.current?.relative_humidity_2m ?? null,
          windSpeed: w?.current?.wind_speed_10m ?? null,
          precipitationProb: w?.hourly?.precipitation_probability?.[0] ?? null,
          uv: w?.current?.uv_index ?? null,
          weatherCode: w?.current?.weather_code ?? null,
          aqi: a?.current?.us_aqi ?? null,
          pm25: a?.current?.pm2_5 ?? null,
          pm10: a?.current?.pm10 ?? null,
          hourly: w?.hourly ? {
            time: w.hourly.time?.slice(0, 24) || [],
            temperature: w.hourly.temperature_2m?.slice(0, 24) || [],
            precipProb: w.hourly.precipitation_probability?.slice(0, 24) || [],
          } : null,
          loading: false,
          error: null,
        });
      } catch (e: any) {
        if (!cancelled) setD((p) => ({ ...p, loading: false, error: e?.message ?? "env fetch failed" }));
      }
    };
    load();
    const id = setInterval(load, 5 * 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [lat, lng]);

  return d;
}

export function weatherLabel(code: number | null): string {
  if (code == null) return "—";
  if (code === 0) return "Clear";
  if (code < 3) return "Partly cloudy";
  if (code < 50) return "Cloudy";
  if (code < 60) return "Drizzle";
  if (code < 70) return "Rain";
  if (code < 80) return "Snow";
  if (code < 90) return "Showers";
  return "Thunderstorm";
}
