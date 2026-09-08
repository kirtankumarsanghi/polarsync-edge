import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

interface TelemetryUpdate {
  solar_kw: number;
  demand_kw: number;
  battery_soc: number;
  battery_charge_rate: number;
  genset_kw: number;
  temperature: number;
  wind_speed: number;
  renewable_pct: number;
  timestamp: string;
}

export function useWebSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [telemetryUpdate, setTelemetryUpdate] = useState<TelemetryUpdate | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('[WebSocket] Connected to PolarSync Backend');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
      setConnected(false);
    });

    socketInstance.on('telemetry:update', (data: TelemetryUpdate) => {
      setTelemetryUpdate(data);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, telemetryUpdate, connected };
}
