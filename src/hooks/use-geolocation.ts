import { useEffect, useState } from "react";

export interface GeoState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

const FALLBACK = { lat: 28.6139, lng: 77.2090 }; // New Delhi default

export function useGeolocation(watch = true): GeoState & { fallback: boolean } {
  const [state, setState] = useState<GeoState>({
    lat: null, lng: null, accuracy: null, error: null, loading: true,
  });
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ ...FALLBACK, accuracy: null, error: "geolocation unsupported", loading: false });
      setFallback(true);
      return;
    }
    let id: number | null = null;
    const timeout = setTimeout(() => {
      setState((s) => s.lat == null ? { ...FALLBACK, accuracy: null, error: "permission timeout", loading: false } : s);
      setFallback(true);
    }, 8000);

    const onPos = (p: GeolocationPosition) => {
      clearTimeout(timeout);
      setFallback(false);
      setState({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy, error: null, loading: false });
    };
    const onErr = (e: GeolocationPositionError) => {
      clearTimeout(timeout);
      setState({ ...FALLBACK, accuracy: null, error: e.message, loading: false });
      setFallback(true);
    };

    if (watch) {
      id = navigator.geolocation.watchPosition(onPos, onErr, { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 });
    } else {
      navigator.geolocation.getCurrentPosition(onPos, onErr, { enableHighAccuracy: true });
    }
    return () => {
      clearTimeout(timeout);
      if (id != null) navigator.geolocation.clearWatch(id);
    };
  }, [watch]);

  return { ...state, fallback };
}
