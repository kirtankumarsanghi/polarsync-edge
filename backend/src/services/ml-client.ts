import axios from 'axios';
import { MLService } from './mlService';
import { ExplainableRulesEngine } from './rulesEngine';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const USE_REMOTE_ML = process.env.USE_REMOTE_ML === 'true';

export interface HourlyPoint {
  hour: number;
  value_kw: number;
  confidence_interval?: [number, number];
}

export interface DemandPredictionResult {
  model: string;
  total_daily_kwh: number;
  hourly_forecast: HourlyPoint[];
  peak_demand_kw: number;
  base_life_support_kw: number;
  confidence_score: number;
  inference_time_ms: number;
}

export interface SolarPredictionResult {
  model: string;
  total_daily_kwh: number;
  hourly_forecast: HourlyPoint[];
  peak_solar_kw: number;
  confidence_score: number;
  inference_time_ms: number;
}

export interface DecisionResult {
  generated_at: string;
  total_demand_kwh: number;
  total_solar_kwh: number;
  net_gap_kwh: number;
  renewable_coverage_pct: number;
  recommended_action: string;
  summary_text: string;
  action_type: string;
  load_actions: Array<{
    load_id: string;
    name: string;
    tier: number;
    action: string;
    target_window?: string;
    kw_impact: number;
  }>;
  generator_needed: boolean;
  generator_recommended_hours: number;
  estimated_fuel_saved_liters: number;
  safe_reserve_protected: boolean;
  risk_level: string;
  explainability: string[];
}

export class MLClient {
  private static client = axios.create({
    baseURL: ML_SERVICE_URL,
    timeout: 3000,
  });

  public static async getDemandForecast(history?: number[]): Promise<DemandPredictionResult> {
    if (!USE_REMOTE_ML) {
      // In-process native execution (<2ms)
      return MLService.predictDemand({ history });
    }

    try {
      const res = await this.client.post('/predict/demand', {
        station_id: 'BHARATI-STATION-01',
        history_24h_kw: history || [],
        ambient_temp_c: -28.4,
        occupancy_count: 24,
      });
      return res.data;
    } catch (err: any) {
      console.warn(`[MLClient] Remote failed (${err.message}). Seamlessly using native in-process ML service.`);
      return MLService.predictDemand({ history });
    }
  }

  public static async getSolarForecast(cloudCover: number = 20): Promise<SolarPredictionResult> {
    if (!USE_REMOTE_ML) {
      // In-process native execution (<2ms)
      return MLService.predictSolar({ cloudCover });
    }

    try {
      const res = await this.client.post('/predict/solar', {
        station_id: 'BHARATI-STATION-01',
        cloud_cover_pct: cloudCover,
        snow_albedo_factor: 0.85,
        polar_season: 'SUMMER',
      });
      return res.data;
    } catch (err: any) {
      console.warn(`[MLClient] Remote failed (${err.message}). Seamlessly using native in-process ML service.`);
      return MLService.predictSolar({ cloudCover });
    }
  }

  public static async getDecision(
    demandHourly?: number[],
    solarHourly?: number[],
    batterySoc: number = 74.0
  ): Promise<DecisionResult> {
    if (!USE_REMOTE_ML) {
      // In-process native explainable rules evaluation (<1ms)
      return ExplainableRulesEngine.evaluate({
        demand_hourly_kw: demandHourly,
        solar_hourly_kw: solarHourly,
        current_battery_soc: batterySoc,
      });
    }

    try {
      const res = await this.client.post('/decide', {
        station_id: 'BHARATI-STATION-01',
        demand_hourly_kw: demandHourly,
        solar_hourly_kw: solarHourly,
        current_battery_soc: batterySoc,
        battery_capacity_kwh: 600.0,
        min_safe_reserve_soc: 30.0,
      });
      return res.data;
    } catch (err: any) {
      console.warn(`[MLClient] Remote failed (${err.message}). Seamlessly using native in-process Rules Engine.`);
      return ExplainableRulesEngine.evaluate({
        demand_hourly_kw: demandHourly,
        solar_hourly_kw: solarHourly,
        current_battery_soc: batterySoc,
      });
    }
  }
}
