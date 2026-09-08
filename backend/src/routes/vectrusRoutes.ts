import { Router } from 'express';
import { MarketSimulation } from '../services/marketSimulation';

export function createVectrusRouter(marketSim: MarketSimulation) {
  const router = Router();

  router.post('/trade', (req, res) => {
    const { type, amount } = req.body;
    
    if (!type || !amount) {
      return res.status(400).json({ error: 'Missing type or amount' });
    }

    if (type !== 'BUY' && type !== 'SELL') {
      return res.status(400).json({ error: 'Invalid trade type' });
    }

    const result = marketSim.executeTrade(type, amount);
    res.json(result);
  });

  return router;
}
