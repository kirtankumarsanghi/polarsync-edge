import { pool } from '../config/db';

export interface TelemetryReading {
  time: Date;
  station_id: string;
  solar_kw: number;
  demand_kw: number;
  battery_soc: number;
  battery_temp_c: number;
  battery_voltage: number;
  fuel_reserve_liters: number;
  generator_status: 'OFF' | 'STANDBY' | 'RUNNING' | 'MAINTENANCE';
  generator_output_kw: number;
  active_tier_shedding: number;
  ambient_temp_c: number;
  wind_speed_ms: number;
}

// In-memory sliding buffer for air-gapped zero-latency WebSocket broadcasts
let latestReading: TelemetryReading = {
  time: new Date(),
  station_id: 'BHARATI-STATION-01',
  solar_kw: 68.4,
  demand_kw: 61.2,
  battery_soc: 74.0,
  battery_temp_c: 18.5,
  battery_voltage: 412.0,
  fuel_reserve_liters: 14200.0,
  generator_status: 'STANDBY',
  generator_output_kw: 0.0,
  active_tier_shedding: 0,
  ambient_temp_c: -28.4,
  wind_speed_ms: 14.2,
};

const recentHistoryBuffer: TelemetryReading[] = [latestReading];

export class TelemetryService {
  public static async recordTelemetry(reading: TelemetryReading): Promise<void> {
    latestReading = reading;
    recentHistoryBuffer.unshift(reading);
    if (recentHistoryBuffer.length > 500) {
      recentHistoryBuffer.pop();
    }

    try {
      const query = `
        INSERT INTO station_telemetry (
          time, station_id, solar_kw, demand_kw, battery_soc, battery_temp_c,
          battery_voltage, fuel_reserve_liters, generator_status,
          generator_output_kw, active_tier_shedding, ambient_temp_c, wind_speed_ms
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
      `;
      const values = [
        reading.time,
        reading.station_id,
        reading.solar_kw,
        reading.demand_kw,
        reading.battery_soc,
        reading.battery_temp_c,
        reading.battery_voltage,
        reading.fuel_reserve_liters,
        reading.generator_status,
        reading.generator_output_kw,
        reading.active_tier_shedding,
        reading.ambient_temp_c,
        reading.wind_speed_ms,
      ];
      await pool.query(query, values);
    } catch (err: any) {
      // Non-blocking in air-gapped mode: warning logged, sliding buffer still serves UI
      console.warn(`[TelemetryService] TimescaleDB write skipped (${err.message}). In-memory buffer active.`);
    }
  }

  public static getLatestTelemetry(): TelemetryReading {
    return latestReading;
  }

  public static async getRecentHistory(limit: number = 24): Promise<TelemetryReading[]> {
    try {
      const query = `
        SELECT * FROM station_telemetry 
        ORDER BY time DESC 
        LIMIT $1;
      `;
      const res = await pool.query(query, [limit]);
      if (res.rows.length > 0) {
        return res.rows;
      }
    } catch (err: any) {
      console.warn(`[TelemetryService] TimescaleDB read fallback: ${err.message}`);
    }
    return recentHistoryBuffer.slice(0, limit);
  }
}
