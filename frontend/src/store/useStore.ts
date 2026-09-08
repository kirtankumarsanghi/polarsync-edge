import { create } from 'zustand';

export interface TelemetryData {
  solar_kw: number;
  demand_kw: number;
  battery_soc: number;
  battery_temp_c: number;
  battery_voltage: number;
  fuel_reserve_liters: number;
  generator_status: string;
  generator_output_kw: number;
  ambient_temp_c: number;
  wind_speed_ms: number;
  time?: string;
}

export interface HourlyPoint {
  hour: number;
  value_kw: number;
  confidence_interval?: [number, number];
}

export interface StationLoad {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  nominal_kw: number;
  is_active: boolean;
  is_sheddable: boolean;
  description: string;
}

export interface DecisionPlan {
  generated_at: string;
  total_demand_kwh: number;
  total_solar_kwh: number;
  net_gap_kwh: number;
  renewable_coverage_pct: number;
  recommended_action: string;
  summary_text: string;
  action_type: string;
  generator_needed: boolean;
  generator_recommended_hours: number;
  estimated_fuel_saved_liters: number;
  risk_level: string;
  explainability: string[];
}

interface PolarState {
  telemetry: TelemetryData;
  demandForecast: HourlyPoint[];
  solarForecast: HourlyPoint[];
  gap_kwh: number;
  coverage_pct: number;
  plan: DecisionPlan | null;
  loads: StationLoad[];
  isConnected: boolean;
  isOfflineMode: boolean;
  lastUpdated: string;
  approvalModalOpen: boolean;

  // Actions
  setTelemetry: (data: Partial<TelemetryData>) => void;
  setForecasts: (demand: HourlyPoint[], solar: HourlyPoint[], gap: number, coverage: number) => void;
  setPlan: (plan: DecisionPlan) => void;
  setConnected: (connected: boolean) => void;
  setApprovalModalOpen: (open: boolean) => void;
  toggleLoad: (id: string) => void;
}

export const useStore = create<PolarState>((set) => ({
  telemetry: {
    solar_kw: 68.4,
    demand_kw: 61.2,
    battery_soc: 74.0,
    battery_temp_c: 18.5,
    battery_voltage: 412.0,
    fuel_reserve_liters: 14200.0,
    generator_status: 'STANDBY',
    generator_output_kw: 0.0,
    ambient_temp_c: -28.4,
    wind_speed_ms: 14.2,
  },
  demandForecast: [
    { hour: 0, value_kw: 48 }, { hour: 1, value_kw: 44 }, { hour: 2, value_kw: 52 }, { hour: 3, value_kw: 55 },
    { hour: 4, value_kw: 60 }, { hour: 5, value_kw: 68 }, { hour: 6, value_kw: 72 }, { hour: 7, value_kw: 76 },
    { hour: 8, value_kw: 80 }, { hour: 9, value_kw: 72 }, { hour: 10, value_kw: 68 }, { hour: 11, value_kw: 64 },
    { hour: 12, value_kw: 58 }, { hour: 13, value_kw: 54 }, { hour: 14, value_kw: 52 }, { hour: 15, value_kw: 55 },
    { hour: 16, value_kw: 60 }, { hour: 17, value_kw: 66 }, { hour: 18, value_kw: 72 }, { hour: 19, value_kw: 68 },
    { hour: 20, value_kw: 62 }, { hour: 21, value_kw: 58 }, { hour: 22, value_kw: 52 }, { hour: 23, value_kw: 50 },
  ],
  solarForecast: [
    { hour: 0, value_kw: 0 }, { hour: 1, value_kw: 0 }, { hour: 2, value_kw: 0 }, { hour: 3, value_kw: 0 },
    { hour: 4, value_kw: 4 }, { hour: 5, value_kw: 18 }, { hour: 6, value_kw: 30 }, { hour: 7, value_kw: 55 },
    { hour: 8, value_kw: 82 }, { hour: 9, value_kw: 90 }, { hour: 10, value_kw: 85 }, { hour: 11, value_kw: 72 },
    { hour: 12, value_kw: 65 }, { hour: 13, value_kw: 48 }, { hour: 14, value_kw: 30 }, { hour: 15, value_kw: 18 },
    { hour: 16, value_kw: 8 }, { hour: 17, value_kw: 0 }, { hour: 18, value_kw: 0 }, { hour: 19, value_kw: 0 },
    { hour: 20, value_kw: 0 }, { hour: 21, value_kw: 0 }, { hour: 22, value_kw: 0 }, { hour: 23, value_kw: 0 },
  ],
  gap_kwh: 410.0,
  coverage_pct: 55.4,
  plan: {
    generated_at: new Date().toISOString(),
    total_demand_kwh: 920,
    total_solar_kwh: 510,
    net_gap_kwh: 410,
    renewable_coverage_pct: 55.4,
    recommended_action: 'Prepare fuel · preserve battery',
    summary_text: 'Expected gap is 410 kWh. Reschedule flexible laboratory loads into the strongest solar window.',
    action_type: 'GEN_SCHEDULE',
    generator_needed: true,
    generator_recommended_hours: 2.8,
    estimated_fuel_saved_liters: 142.8,
    risk_level: 'MODERATE',
    explainability: [
      'Predicted demand: 920 kWh, predicted solar: 510 kWh.',
      'Usable battery reserve above 30% safe threshold: 264 kWh.',
      'Rescheduling Tier-2 lab loads closes daytime gap without generator.',
      'Controlled 2.8h diesel run scheduled for evening deficit.',
    ],
  },
  loads: [
    {
      id: 'LOAD-T1-HEAT',
      name: 'Heating & Life-Safety',
      tier: 1,
      nominal_kw: 28.5,
      is_active: true,
      is_sheddable: false,
      description: 'Emergency redundant habitat heating and air circulation. NEVER auto-switched off.',
    },
    {
      id: 'LOAD-T2-LAB',
      name: 'Laboratory Equipment & Spectrometry',
      tier: 2,
      nominal_kw: 12.0,
      is_active: true,
      is_sheddable: true,
      description: 'Schedulable science workloads and melt water boiler.',
    },
    {
      id: 'LOAD-T3-REC',
      name: 'Charging & Recreation',
      tier: 3,
      nominal_kw: 12.5,
      is_active: true,
      is_sheddable: true,
      description: 'Field rover battery charging and non-essential domestic appliances.',
    },
  ],
  isConnected: false,
  isOfflineMode: true,
  lastUpdated: 'Just now',
  approvalModalOpen: false,

  setTelemetry: (data) =>
    set((state) => ({
      telemetry: { ...state.telemetry, ...data },
      lastUpdated: new Date().toLocaleTimeString(),
    })),

  setForecasts: (demandForecast, solarForecast, gap_kwh, coverage_pct) =>
    set({ demandForecast, solarForecast, gap_kwh, coverage_pct }),

  setPlan: (plan) => set({ plan }),
  setConnected: (isConnected) => set({ isConnected, isOfflineMode: !isConnected }),
  setApprovalModalOpen: (approvalModalOpen) => set({ approvalModalOpen }),

  toggleLoad: (id) =>
    set((state) => ({
      loads: state.loads.map((load) => {
        if (load.id === id) {
          if (load.tier === 1) return load; // Locked
          return { ...load, is_active: !load.is_active };
        }
        return load;
      }),
    })),
}));
