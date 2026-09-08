import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface TelemetryData {
  solar_kw: number;
  demand_kw: number;
  battery_soc: number;
  battery_charge_rate: number;
  genset_kw: number;
  temperature: number;
  wind_speed: number;
  renewable_pct: number;
}

interface WeatherData {
  temp_c: number;
  wind_kph: number;
  condition: string;
  solar_irradiance: number;
}

interface LiveResponse {
  status: string;
  data: {
    telemetry: TelemetryData;
    weather: WeatherData;
    node_status: string;
    timestamp: string;
  };
}

export function useTelemetry(refreshInterval: number = 5000) {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE}/telemetry/live`);
        if (!response.ok) throw new Error('Failed to fetch telemetry');
        
        const data: LiveResponse = await response.json();
        setTelemetry(data.data.telemetry);
        setWeather(data.data.weather);
        setConnected(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setConnected(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { telemetry, weather, loading, error, connected };
}
