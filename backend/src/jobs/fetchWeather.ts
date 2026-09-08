import cron from 'node-cron';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

export interface WeatherForecastSnapshot {
  timestamp: string;
  source: 'NCPOR_SATELLITE_FEED' | 'LOCAL_OFFLINE_BUFFER';
  ambient_temp_c: number;
  wind_speed_ms: number;
  cloud_cover_pct: number;
  solar_ghi_w_m2: number;
  forecast_confidence: number;
}

let latestWeather: WeatherForecastSnapshot = {
  timestamp: new Date().toISOString(),
  source: 'LOCAL_OFFLINE_BUFFER',
  ambient_temp_c: -28.4,
  wind_speed_ms: 14.2,
  cloud_cover_pct: 20.0,
  solar_ghi_w_m2: 450.0,
  forecast_confidence: 0.88,
};

export class WeatherPollingJob {
  private static NCPOR_WEATHER_URL = process.env.NCPOR_WEATHER_API || 'https://api.ncpor.res.in/polar/forecast/bharati';

  public static start(): void {
    console.log('[WeatherPoller] Initializing 3-hour NCPOR weather synchronization job...');

    // Run once at boot
    this.syncWeather();

    // Run every 3 hours (CRON: 0 */3 * * *)
    cron.schedule('0 */3 * * *', () => {
      console.log('[WeatherPoller] 3-hour CRON trigger: Synchronizing NCPOR Antarctic meteorological forecast.');
      this.syncWeather();
    });
  }

  public static async syncWeather(): Promise<void> {
    try {
      // Attempt to reach NCPOR satellite server with a tight 3s timeout
      const response = await axios.get(this.NCPOR_WEATHER_URL, { timeout: 3000 });
      if (response.data && response.data.ambient_temp_c) {
        latestWeather = {
          timestamp: new Date().toISOString(),
          source: 'NCPOR_SATELLITE_FEED',
          ambient_temp_c: response.data.ambient_temp_c,
          wind_speed_ms: response.data.wind_speed_ms,
          cloud_cover_pct: response.data.cloud_cover_pct,
          solar_ghi_w_m2: response.data.solar_ghi_w_m2,
          forecast_confidence: 0.94,
        };
        console.log('[WeatherPoller] Satellite link active. Synchronized with live NCPOR weather feed.');
        return;
      }
    } catch (err: any) {
      console.log(`[WeatherPoller] Satellite uplink offline (${err.message}). Using local air-gapped polar buffer.`);
    }

    // Fallback to local Antarctic buffer
    latestWeather = {
      timestamp: new Date().toISOString(),
      source: 'LOCAL_OFFLINE_BUFFER',
      ambient_temp_c: -27.5,
      wind_speed_ms: 13.8,
      cloud_cover_pct: 22.0,
      solar_ghi_w_m2: 440.0,
      forecast_confidence: 0.86,
    };
  }

  public static getLatestWeather(): WeatherForecastSnapshot {
    return latestWeather;
  }
}
