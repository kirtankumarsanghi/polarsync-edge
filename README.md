# PolarSync Edge — Polar Station Energy Command Center

🏆 **A Smart India Hackathon (SIH) Project**

PolarSync Edge is an offline-first, air-gapped microgrid energy management and forecasting system tailored for extreme polar environments (such as the Indian Antarctic Research Stations **Bharati** and **Maitri**, operated by the National Centre for Polar and Ocean Research — NCPOR).

---

## Architecture Overview

```
                          ┌───────────────────────────┐
                          │   Nginx Reverse Proxy     │
                          │        (Port 80)          │
                          └─────────────┬─────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 │                                             │
                 ▼                                             ▼
        ┌──────────────────┐                         ┌──────────────────┐
        │  Next.js 14 PWA  │                         │  Unified Backend │
        │  Commander UI    │                         │  Node.js + ONNX  │
        │   (Port 3000)    │                         │   (Port 4000)    │
        └──────────────────┘                         └─────────┬────────┘
                                                               │
                                                               ▼
                                                     ┌──────────────────┐
                                                     │   TimescaleDB    │
                                                     │  (Hypertables)   │
                                                     └──────────────────┘
```

1. **01. Unified Edge Backend & ML Engine (`/backend`)**:
   - **Native ONNX ML Execution**: Runs PyTorch LSTM (~900 kWh/day) and XGBoost Solar forecasters (~520 kWh/day) directly inside Node.js in `<20ms` via `onnxruntime-node`.
   - **Antarctic Explainable Rules Engine**: Evaluates Tier-1 life support invariants (never shed), Tier-2 science load shifting, Tier-3 curtailment, 30% battery reserve ring-fence, and diesel generator scheduling.
   - **Continuous Edge Telemetry**: 5-second WebSocket broadcasts to Commander UI tablet.
   - **Industrial Sensor Logging**: 15-minute CRON Modbus/TCP sensor snapshot recording to TimescaleDB.
   - **Python Training Pipeline (`/backend/ml`)**: Contains offline model training code, exporters, and a standalone `predict.py` CLI tool.

3. **03. Commander User Portal (`/frontend`)**:
   - Next.js 14 App Router + React 18 PWA.
   - Offline installable on rugged tablets via Web App Manifest.
   - Live energy grid visualizer, interactive 24-hour forecast curves, gap analysis, and immutable decision audit ledger.
   - **Strict Human-in-the-Loop Interlock**: Tier-1 life-safety circuits are locked against automated shedding.

---

## Project Structure

```
polarsync-edge/
│
├── docker-compose.yml           # Orchestrates offline deployment (UI + Node + Python + DB)
├── README.md                    # Project documentation & setup instructions
│
├── /frontend                    # 03. COMMANDER USER PORTAL (Next.js 14 + React 18 PWA)
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── next.config.mjs          # PWA config setup (next-pwa)
│   ├── /public                  
│   │   ├── manifest.json        # PWA manifest for offline capability
│   │   └── /icons/               # App icons for tablet installation
│   └── /src
│       ├── /app                 # Next.js App Router
│       │   ├── layout.tsx       # Root layout + WebSocket provider
│       │   ├── page.tsx         # Main Dashboard (Live Grid)
│       │   └── /history         # Audit logs & past decisions
│       ├── /components
│       │   ├── /ui              # Reusable Tailwind components (buttons, cards)
│       │   └── /dashboard       # Grid visualizer, approval modals, alerts
│       ├── /lib
│       │   ├── socket.ts        # WebSocket client (receives 5s updates)
│       │   └── api.ts           # REST API client
│       └── /store
│           └── useStore.ts      # Zustand state (holds live battery/solar metrics)
│
├── /backend                     # UNIFIED EDGE BACKEND & ML (Node.js + TS + ONNX)
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── /src
│   │   ├── server.ts            # Entry point (Express + Socket.io + REST API)
│   │   ├── /config
│   │   │   └── db.ts            # PostgreSQL + TimescaleDB connection pool
│   │   ├── /controllers         # Route handlers for UI requests
│   │   ├── /routes              # REST endpoints (/api/telemetry, /api/decisions, /api/forecast)
│   │   ├── /sockets             # WebSocket server (pushes data every 5s to UI)
│   │   ├── /jobs
│   │   │   ├── pollSensors.ts   # 15-minute CRON to poll BMS/Inverters via Modbus/TCP
│   │   │   └── fetchWeather.ts  # Fetches 3-hr NCPOR forecast when connection exists
│   │   └── /services
│   │       ├── mlService.ts     # Native ONNX Runtime inference engine (<20ms)
│   │       ├── rulesEngine.ts   # Antarctic human-in-the-loop decision & explainability engine
│   │       ├── ml-client.ts     # Fast in-process ML orchestrator
│   │       └── telemetry.ts     # Writes sensor data to TimescaleDB
│   │
│   └── /ml                      # Python ML Pipeline & Artifacts
│       ├── predict.py           # Standalone CLI inference verification tool
│       ├── requirements.txt     # Python packages for ML training & compilation
│       ├── /models_bin          # Compiled edge model artifacts
│       │   ├── demand_lstm.onnx # 900 kWh/day forecaster
│       │   ├── solar_xgb.onnx   # 520 kWh/day forecaster
│       │   ├── scalers.json     # Station envelope & scaler definitions
│       │   └── scalers.pkl      # Pickled scalers
│       └── /training            # Python scripts to train and export ONNX models
│           └── generate_onnx_models.py
│
└── /infrastructure              # Edge Deployment Configs
    ├── /postgres
    │   └── init.sql             # Creates TimescaleDB hypertables on first boot
    └── /nginx
        └── default.conf         # Local reverse proxy (routes port 80 to UI/API)
```

---

## Quick Start (Single-Command Edge Deployment)

To cold-start the entire air-gapped stack on station edge hardware or local Docker:

```bash
cd polarsync-edge
docker compose up -d --build
```

Access the edge portal:
- **Station Commander Portal**: `http://localhost` (or station edge tablet IP)
- **Unified Backend API & Sockets**: `http://localhost:4000`
- **Forecast Endpoints**: `http://localhost:4000/api/forecast/demand` & `http://localhost:4000/api/forecast/solar`
- **TimescaleDB Cluster**: `localhost:5432` (`polarsync` / `polarpass123`)

---

## Local Development (Without Docker)

### 1. Unified Backend Service (Node.js 18+)
```bash
cd polarsync-edge/backend
npm install
npm run dev
```

### 2. (Optional) Python ML Pipeline & CLI Test
```bash
cd polarsync-edge/backend/ml
python predict.py '{"ambient_temp_c": -28.4, "cloud_cover_pct": 20}'
```

### 3. Frontend PWA (Next.js 14)
```bash
cd polarsync-edge/frontend
npm install
npm run dev
```

---

## Circuit Criticality Tiers

| Tier | Classification | Description | Sheddable? |
|---|---|---|---|
| **Tier 1** | **Critical Life-Safety** | Habitat heating, medical oxygen, satellite comms | ❌ **NEVER** (Hardware Interlocked) |
| **Tier 2** | **Schedulable Science** | Atmospheric spectrometers, snow melt tanks | 🔄 **Flexible** (Shifted to solar peak) |
| **Tier 3** | **Non-Critical** | Field rover recharge, living quarters recreation | ✂️ **Sheddable** (First candidates for load reduction) |

---

## License & Operational Note
Developed for **Smart India Hackathon 2026**. Designed for air-gapped edge microgrids with zero external cloud dependencies.
