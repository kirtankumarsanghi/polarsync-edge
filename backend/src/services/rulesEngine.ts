/**
 * PolarSync Antarctic Edge Decision & Explainability Engine
 *
 * Implements safety invariants:
 * 1. Tier-1 life-safety loads are NEVER shed under any condition.
 * 2. 30% battery SOC is permanently ring-fenced for emergency survival buffer.
 * 3. Tier-2 science loads are dynamically shifted into peak solar windows.
 * 4. Tier-3 auxiliary loads are proactively curtailed when solar drops.
 * 5. Diesel generator runtimes are minimized to preserve scarce Antarctic fuel.
 */

export interface LoadItem {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  nominal_kw: number;
}

export interface LoadActionRecommendation {
  load_id: string;
  name: string;
  tier: number;
  action: 'PROTECT' | 'RESCHEDULE_WINDOW' | 'SHED';
  target_window?: string;
  kw_impact: number;
}

export interface DecisionRequest {
  station_id?: string;
  demand_hourly_kw?: number[];
  solar_hourly_kw?: number[];
  current_battery_soc?: number;
  battery_capacity_kwh?: number;
  min_safe_reserve_soc?: number;
  available_loads?: LoadItem[];
}

export interface DecisionResponse {
  generated_at: string;
  total_demand_kwh: number;
  total_solar_kwh: number;
  net_gap_kwh: number;
  renewable_coverage_pct: number;
  recommended_action: string;
  summary_text: string;
  action_type: 'SOLAR_AUTONOMOUS' | 'BATTERY_SUPPORT' | 'LOAD_SHED_RECOMMENDED' | 'GEN_SCHEDULE';
  load_actions: LoadActionRecommendation[];
  generator_needed: boolean;
  generator_recommended_hours: number;
  estimated_fuel_saved_liters: number;
  safe_reserve_protected: boolean;
  risk_level: 'NOMINAL' | 'MODERATE' | 'CRITICAL';
  explainability: string[];
}

export class ExplainableRulesEngine {
  private static readonly DEFAULT_LOADS: LoadItem[] = [
    { id: 'LOAD-T1-HEAT', name: 'Habitat Radiant Heating', tier: 1, nominal_kw: 28.5 },
    { id: 'LOAD-T1-LIFE', name: 'Medical & Oxygen Life Support', tier: 1, nominal_kw: 14.0 },
    { id: 'LOAD-T1-COMM', name: 'Satellite & Emergency Comm Bus', tier: 1, nominal_kw: 4.5 },
    { id: 'LOAD-T2-LAB',  name: 'Spectrometry & Science Labs', tier: 2, nominal_kw: 12.0 },
    { id: 'LOAD-T2-SNOW', name: 'Snow Melt Fresh Water Tank', tier: 2, nominal_kw: 8.5 },
    { id: 'LOAD-T3-DRONE',name: 'Field Rover & Drone Charging', tier: 3, nominal_kw: 7.0 },
    { id: 'LOAD-T3-REC',  name: 'Crew Living Quarters Recreation', tier: 3, nominal_kw: 5.5 },
  ];

  public static evaluate(req: DecisionRequest = {}): DecisionResponse {
    const nowStr = new Date().toISOString();

    const demandCurve = req.demand_hourly_kw || [
      48.2, 44.5, 52.0, 55.1, 60.3, 68.0, 72.4, 76.5,
      80.1, 72.0, 68.2, 64.0, 58.3, 54.1, 52.0, 55.4,
      60.2, 66.8, 72.1, 68.5, 62.0, 58.3, 52.4, 50.1,
    ];

    const solarCurve = req.solar_hourly_kw || [
      0.0,  0.0,  0.0,  0.0,  4.2, 18.5, 30.2, 55.0,
      82.4, 90.5, 85.1, 72.0, 65.0, 48.2, 30.5, 18.0,
      8.1,  0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,
    ];

    const totalDemand = Math.round(demandCurve.reduce((a, b) => a + b, 0) * 10) / 10;
    const totalSolar = Math.round(solarCurve.reduce((a, b) => a + b, 0) * 10) / 10;
    const netGapKwh = Math.round(Math.max(0.0, totalDemand - totalSolar) * 10) / 10;
    const renewableCoverage = Math.min(100.0, Math.round(((totalSolar / Math.max(1.0, totalDemand)) * 100.0) * 10) / 10);

    const batterySoc = req.current_battery_soc ?? 74.0;
    const batteryCapacity = req.battery_capacity_kwh ?? 600.0;
    const minSafeReserveSoc = req.min_safe_reserve_soc ?? 30.0;

    const currentBatteryKwh = (batterySoc / 100.0) * batteryCapacity;
    const safeReserveKwh = (minSafeReserveSoc / 100.0) * batteryCapacity;
    const usableBatteryKwh = Math.max(0.0, currentBatteryKwh - safeReserveKwh);

    const deficitAfterBattery = Math.max(0.0, netGapKwh - usableBatteryKwh);

    const loads = req.available_loads && req.available_loads.length > 0 ? req.available_loads : this.DEFAULT_LOADS;
    const loadActions: LoadActionRecommendation[] = [];
    const explainability: string[] = [];
    let shedCapacityKw = 0.0;

    for (const load of loads) {
      if (load.tier === 1) {
        // STRICT INVARIANT: Tier 1 is NEVER shed
        loadActions.push({
          load_id: load.id,
          name: load.name,
          tier: 1,
          action: 'PROTECT',
          kw_impact: 0.0,
        });
      } else if (load.tier === 2) {
        // Tier 2: Reschedule into peak solar window (08:00 - 14:00)
        loadActions.push({
          load_id: load.id,
          name: load.name,
          tier: 2,
          action: 'RESCHEDULE_WINDOW',
          target_window: '08:00 - 14:00 UTC',
          kw_impact: load.nominal_kw,
        });
        explainability.push(`Tier-2 ${load.name} shifted to 08:00-14:00 solar window, shaving ${load.nominal_kw} kW peak load.`);
      } else if (load.tier === 3) {
        if (deficitAfterBattery > 50.0 || batterySoc < 40.0) {
          loadActions.push({
            load_id: load.id,
            name: load.name,
            tier: 3,
            action: 'SHED',
            kw_impact: load.nominal_kw,
          });
          shedCapacityKw += load.nominal_kw;
          explainability.push(`Tier-3 ${load.name} curtailed: conserving ${load.nominal_kw} kW while battery buffer is thin.`);
        } else {
          loadActions.push({
            load_id: load.id,
            name: load.name,
            tier: 3,
            action: 'PROTECT',
            kw_impact: 0.0,
          });
        }
      }
    }

    let actionType: 'SOLAR_AUTONOMOUS' | 'BATTERY_SUPPORT' | 'LOAD_SHED_RECOMMENDED' | 'GEN_SCHEDULE';
    let recommendedAction: string;
    let summaryText: string;
    let generatorNeeded = false;
    let genHours = 0.0;
    let fuelSaved = 142.8;
    let riskLevel: 'NOMINAL' | 'MODERATE' | 'CRITICAL' = 'NOMINAL';

    if (netGapKwh <= 0.0) {
      actionType = 'SOLAR_AUTONOMOUS';
      recommendedAction = 'Full Autonomous Solar Operation';
      summaryText = 'Predicted solar production fully covers Bharati base demand. Zero diesel generator runtime required.';
      generatorNeeded = false;
      genHours = 0.0;
      fuelSaved = Math.round(totalDemand * 0.35 * 10) / 10;
      riskLevel = 'NOMINAL';
      explainability.unshift(`100% solar self-sufficiency forecast: total generation (${totalSolar} kWh) exceeds load (${totalDemand} kWh).`);
    } else if (usableBatteryKwh >= netGapKwh) {
      actionType = 'BATTERY_SUPPORT';
      recommendedAction = 'Battery Reserve Support Active';
      summaryText = `Net deficit of ${netGapKwh} kWh successfully covered by usable battery storage (${Math.round(usableBatteryKwh)} kWh available above 30% reserve).`;
      generatorNeeded = false;
      genHours = 0.0;
      fuelSaved = Math.round(netGapKwh * 0.35 * 10) / 10;
      riskLevel = 'NOMINAL';
      explainability.unshift(`Battery covers entire ${netGapKwh} kWh deficit. Station remains in zero-emission silent run.`);
    } else {
      generatorNeeded = true;
      const unservedKwh = deficitAfterBattery - (shedCapacityKw * 4.0);
      genHours = Math.round(Math.min(12.0, Math.max(1.0, unservedKwh / 80.0)) * 10) / 10;
      fuelSaved = Math.round(((usableBatteryKwh + shedCapacityKw * 4.0) * 0.35) * 10) / 10;

      if (batterySoc < 35.0 || deficitAfterBattery > 200.0) {
        actionType = 'LOAD_SHED_RECOMMENDED';
        recommendedAction = 'Emergency Load Shedding & Diesel Run';
        summaryText = `Substantial deficit (${Math.round(deficitAfterBattery)} kWh after battery). Prioritize Life Support (Tier-1) and engage diesel generator for ${genHours}h.`;
        riskLevel = 'CRITICAL';
        explainability.unshift(`CRITICAL: Battery SOC at ${batterySoc}%. Invariant safety reserve protected. Tier-3 loads shed.`);
      } else {
        actionType = 'GEN_SCHEDULE';
        recommendedAction = 'Prepare fuel · preserve battery';
        summaryText = `Expected gap is ${netGapKwh} kWh. Reschedule flexible laboratory loads into the strongest solar window. Controlled ${genHours}h diesel run recommended.`;
        riskLevel = 'MODERATE';
        explainability.unshift(`Predictive dispatch: ${genHours}h diesel top-up scheduled to preserve the mandatory 30% (${safeReserveKwh} kWh) reserve.`);
      }
    }

    return {
      generated_at: nowStr,
      total_demand_kwh: totalDemand,
      total_solar_kwh: totalSolar,
      net_gap_kwh: netGapKwh,
      renewable_coverage_pct: renewableCoverage,
      recommended_action: recommendedAction,
      summary_text: summaryText,
      action_type: actionType,
      load_actions: loadActions,
      generator_needed: generatorNeeded,
      generator_recommended_hours: genHours,
      estimated_fuel_saved_liters: fuelSaved,
      safe_reserve_protected: true,
      risk_level: riskLevel,
      explainability: explainability,
    };
  }
}
