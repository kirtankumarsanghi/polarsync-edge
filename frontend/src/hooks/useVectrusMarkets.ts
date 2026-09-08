import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

interface VectrusMarketData {
  prices: Record<string, number>;
  batterySoC: number;
  gridLoad: number;
  solarGen: number;
  timestamp: string;
}

export function useVectrusMarkets() {
  const [marketData, setMarketData] = useState<VectrusMarketData | null>(null);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('[Vectrus Markets] Connected to backend');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('[Vectrus Markets] Disconnected');
      setConnected(false);
    });

    socketInstance.on('vectrus:tick', (data: VectrusMarketData) => {
      setMarketData(data);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const executeTrade = async (type: 'BUY' | 'SELL', amount: number) => {
    try {
      const response = await fetch(`${API_BASE}/vectrus/trade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, amount }),
      });

      if (!response.ok) throw new Error('Trade failed');
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  return { marketData, connected, executeTrade };
}
