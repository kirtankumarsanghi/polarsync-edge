import { Router } from 'express';
import { DecisionsController } from '../controllers/decisionsController';

const router = Router();

router.get('/plan', DecisionsController.getLatestPlan);
router.post('/approve', DecisionsController.approvePlan);
router.get('/audit', DecisionsController.getAuditLogs);
router.post('/override-load', DecisionsController.overrideLoad);

export default router;
