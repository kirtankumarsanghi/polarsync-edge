import { Router } from 'express';
import { TelemetryController } from '../controllers/telemetryController';

const router = Router();

router.get('/live', TelemetryController.getLive);
router.get('/history', TelemetryController.getHistory);
router.get('/forecasts', TelemetryController.getForecasts);

export default router;
