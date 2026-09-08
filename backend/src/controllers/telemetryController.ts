import { Request, Response } from 'express';
import { TelemetryService } from '../services/telemetry';
import { WeatherPollingJob } from '../jobs/fetchWeather';
import { MLClient } from '../services/ml-client';

export class TelemetryController {
  public static async getLive(req: Request, res: Response): Promise<void> {
    const telemetry = TelemetryService.getLatestTelemetry();
    const weather = WeatherPollingJob.getLatestWeather();
    res.json({
      status: 'success',
      data: {
        telemetry,
        weather,
        node_status: 'ONLINE_EDGE',
        timestamp: new Date().toISOString(),
      },
    });
  }

  public static async getHistory(req: Request, res: Response): Promise<void> {
    const limit = parseInt(req.query.limit as string, 10) || 24;
    const history = await TelemetryService.getRecentHistory(limit);
    res.json({
      status: 'success',
      data: history,
      count: history.length,
    });
  }

  public static async getForecasts(req: Request, res: Response): Promise<void> {
    try {
      const [demand, solar] = await Promise.all([
        MLClient.getDemandForecast(),
        MLClient.getSolarForecast(),
      ]);

      res.json({
        status: 'success',
        data: {
          demand,
          solar,
          gap_kwh: Math.max(0, demand.total_daily_kwh - solar.total_daily_kwh),
          coverage_pct: Math.min(100, Math.round((solar.total_daily_kwh / demand.total_daily_kwh) * 100)),
        },
      });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
}
