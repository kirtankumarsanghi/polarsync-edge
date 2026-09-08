import { Server as SocketIOServer, Socket } from 'socket.io';
import { TelemetryService } from '../services/telemetry';
import { WeatherPollingJob } from '../jobs/fetchWeather';

export class TelemetrySocketServer {
  private static io: SocketIOServer | null = null;
  private static broadcastInterval: NodeJS.Timeout | null = null;

  public static initialize(io: SocketIOServer): void {
    this.io = io;

    io.on('connection', (socket: Socket) => {
      console.log(`[WebSocket] Commander UI client connected: ${socket.id}`);

      // Send initial snapshot immediately upon handshake
      socket.emit('telemetry_update', {
        telemetry: TelemetryService.getLatestTelemetry(),
        weather: WeatherPollingJob.getLatestWeather(),
        station_status: 'AIR_GAPPED_READY',
      });

      socket.on('request_refresh', () => {
        socket.emit('telemetry_update', {
          telemetry: TelemetryService.getLatestTelemetry(),
          weather: WeatherPollingJob.getLatestWeather(),
          station_status: 'AIR_GAPPED_READY',
        });
      });

      socket.on('disconnect', () => {
        console.log(`[WebSocket] Client disconnected: ${socket.id}`);
      });
    });

    // 5-second periodic broadcast loop to all connected UI clients
    this.broadcastInterval = setInterval(() => {
      if (this.io) {
        const payload = {
          telemetry: TelemetryService.getLatestTelemetry(),
          weather: WeatherPollingJob.getLatestWeather(),
          timestamp: new Date().toISOString(),
        };
        this.io.emit('telemetry_update', payload);
      }
    }, 5000);

    console.log('[WebSocket] 5-second telemetry broadcast loop active.');
  }

  public static stop(): void {
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
    }
  }
}
