import { create } from 'zustand';

interface VectrusState {
  prices: Record<string, number>;
  batterySoC: number;
  gridLoad: number;
  solarGen: number;
  pnl: number;
  isConnected: boolean;
  history: { time: string; price: number; soc: number }[];

  setSimulationData: (data: any) => void;
  setConnected: (status: boolean) => void;
  addTrade: (amount: number, type: 'BUY' | 'SELL', price: number) => void;
}

const GRID_NODES = ['HB_NORTH', 'HB_SOUTH', 'HB_WEST', 'HB_HOUSTON', 'LZ_AEN', 'LZ_CPS', 'LZ_LCRA', 'LZ_RAYBN'];
const initialPrices: Record<string, number> = {};
GRID_NODES.forEach(n => initialPrices[n] = 25.50);

export const useVectrusStore = create<VectrusState>((set) => ({
  prices: initialPrices,
  batterySoC: 84.2,
  gridLoad: 342.1,
  solarGen: 14.2,
  pnl: 12450,
  isConnected: false,
  history: [
    { time: '00:00', price: 20, soc: 40 },
    { time: '04:00', price: 15, soc: 80 },
    { time: '08:00', price: 45, soc: 70 },
  ],

  setSimulationData: (data) => set((state) => {
    const timeStr = new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Add to history (keep last 20)
    const newHistory = [...state.history, { 
      time: timeStr, 
      price: data.prices['HB_NORTH'] || 25, 
      soc: data.batterySoC 
    }].slice(-20);

    return {
      prices: data.prices,
      batterySoC: data.batterySoC,
      gridLoad: data.gridLoad,
      solarGen: data.solarGen,
      history: newHistory
    };
  }),

  setConnected: (isConnected) => set({ isConnected }),
  
  addTrade: (amount, type, price) => set((state) => {
    // Basic PnL calculation simulation
    const impact = type === 'BUY' ? -(amount * price) : (amount * price);
    return { pnl: state.pnl + impact };
  })
}));
