import { Router, Request, Response } from 'express';
import { MLService } from '../services/mlService';

const router = Router();

// GET or POST /api/forecast/demand
router.all('/demand', async (req: Request, res: Response) => {
  try {
    const ambientTemp = req.body?.ambient_temp_c ? Number(req.body.ambient_temp_c) : undefined;
    const occupancy = req.body?.occupancy_count ? Number(req.body.occupancy_count) : undefined;
    const history = Array.isArray(req.body?.history_24h_kw) ? req.body.history_24h_kw : undefined;

    const forecast = await MLService.predictDemand({
      ambientTemp,
      occupancy,
      history,
    });
    res.json(forecast);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET or POST /api/forecast/solar
router.all('/solar', async (req: Request, res: Response) => {
  try {
    const cloudCover = req.body?.cloud_cover_pct ? Number(req.body.cloud_cover_pct) : undefined;
    const snowAlbedo = req.body?.snow_albedo_factor ? Number(req.body.snow_albedo_factor) : undefined;
    const polarSeason = req.body?.polar_season;

    const forecast = await MLService.predictSolar({
      cloudCover,
      snowAlbedo,
      polarSeason,
    });
    res.json(forecast);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
