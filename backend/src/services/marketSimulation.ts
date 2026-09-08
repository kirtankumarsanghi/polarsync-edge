import { Server } from 'socket.io';

const GRID_NODES = ['HB_NORTH', 'HB_SOUTH', 'HB_WEST', 'HB_HOUSTON', 'LZ_AEN', 'LZ_CPS', 'LZ_LCRA', 'LZ_RAYBN'];

export class MarketSimulation {
  private io: Server;
  private prices: Record<string, number> = {};
  private batterySoC: number = 84.2;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(io: Server) {
    this.io = io;
    GRID_NODES.forEach(n => this.prices[n] = 25.50);
  }

  public start() {
    console.log('Starting Market Simulation engine for Vectrus...');
    this.intervalId = setInterval(() => this.tick(), 2000);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private tick() {
    // Fluctuate prices
    GRID_NODES.forEach(node => {
      const change = (Math.random() - 0.5) * 8; // higher volatility
      this.prices[node] = Math.max(1.0, this.prices[node] + change);
    });

    // Simulate grid load changes
    const load = 300 + Math.random() * 100;
    const solar = Math.max(0, 15 + Math.random() * 5 - (load > 380 ? 10 : 0)); // Drop solar if load peaks to simulate late afternoon

    this.io.emit('vectrus:tick', {
      prices: this.prices,
      batterySoC: this.batterySoC,
      gridLoad: load,
      solarGen: solar,
      timestamp: new Date().toISOString()
    });
  }

  public executeTrade(type: 'BUY' | 'SELL', amountMWh: number) {
    // 1 MWh = roughly 1% SoC change for a 100MWh battery
    const socImpact = amountMWh; 
    if (type === 'BUY') {
      this.batterySoC = Math.min(100, this.batterySoC + socImpact);
    } else {
      this.batterySoC = Math.max(0, this.batterySoC - socImpact);
    }
    // Instantly broadcast the SoC update
    this.tick();
    return { success: true, newSoC: this.batterySoC };
  }
}
