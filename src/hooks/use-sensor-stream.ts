import { useEffect, useState } from "react";

export interface SensorReading {
  t: number;
  rainfall: number;     // mm/h
  riverLevel: number;   // m
  seismic: number;      // mag
  temperature: number;  // C
  humidity: number;     // %
  aqi: number;          // 0-500
}

const HISTORY = 30;

function next(prev: SensorReading): SensorReading {
  const drift = (v: number, step: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v + (Math.random() - 0.5) * step));
  return {
    t: prev.t + 1,
    rainfall:    drift(prev.rainfall,    8,   0, 180),
    riverLevel:  drift(prev.riverLevel,  0.3, 1, 12),
    seismic:     drift(prev.seismic,     0.4, 0, 7.5),
    temperature: drift(prev.temperature, 0.5, 18, 44),
    humidity:    drift(prev.humidity,    3,   30, 99),
    aqi:         drift(prev.aqi,         15,  20, 480),
  };
}

const seed: SensorReading = { t: 0, rainfall: 60, riverLevel: 6.4, seismic: 2.1, temperature: 31, humidity: 78, aqi: 180 };

export function useSensorStream() {
  const [data, setData] = useState<SensorReading[]>(() => {
    const arr = [seed];
    for (let i = 1; i < HISTORY; i++) arr.push(next(arr[i - 1]));
    return arr;
  });

  useEffect(() => {
    const id = setInterval(() => {
      setData((d) => [...d.slice(-HISTORY + 1), next(d[d.length - 1])]);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  const latest = data[data.length - 1];
  return { data, latest };
}
