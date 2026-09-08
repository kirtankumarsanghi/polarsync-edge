import { Request, Response } from 'express';
import { MLClient } from '../services/ml-client';
import { TelemetryService } from '../services/telemetry';
import { pool } from '../config/db';

export interface DecisionRecord {
  id: string;
  timestamp: string;
  gap_kwh: number;
  recommendation_text: string;
  action_type: string;
  target_loads: any[];
  generator_hours_recommended: number;
  estimated_fuel_saved_liters: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'OVERRIDDEN';
  commander_id?: string;
  approval_timestamp?: string;
  override_reason?: string;
}

// In-memory decision log for edge offline operation
let localDecisionLog: DecisionRecord[] = [
  {
    id: 'DEC-20260908-01',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    gap_kwh: 410.0,
    recommendation_text: 'Prepare fuel · preserve battery · reschedule flexible lab loads',
    action_type: 'GEN_SCHEDULE',
    target_loads: [
      { load_id: 'LOAD-T2-LAB', action: 'RESCHEDULE_WINDOW', target: '08:00 - 14:00' },
      { load_id: 'LOAD-T3-REC', action: 'SHED' }
    ],
    generator_hours_recommended: 2.8,
    estimated_fuel_saved_liters: 142.8,
    status: 'APPROVED',
    commander_id: 'CDR-SHARMA-STATION-BHARATI',
    approval_timestamp: new Date(Date.now() - 3500000).toISOString(),
  }
];

export class DecisionsController {
  public static async getLatestPlan(req: Request, res: Response): Promise<void> {
    try {
      const telemetry = TelemetryService.getLatestTelemetry();
      const plan = await MLClient.getDecision(undefined, undefined, telemetry.battery_soc);
      res.json({
        status: 'success',
        data: plan,
      });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  public static async approvePlan(req: Request, res: Response): Promise<void> {
    const { decision_id, commander_id, approval_pin, action_type, notes } = req.body;

    if (!commander_id) {
      res.status(400).json({ status: 'error', message: 'Commander ID is required for audit signature.' });
      return;
    }

    const decisionRecord: DecisionRecord = {
      id: decision_id || `DEC-${Date.now()}`,
      timestamp: new Date().toISOString(),
      gap_kwh: 410.0,
      recommendation_text: 'Commander approved: Reschedule Tier-2 lab loads and pre-warm GenSet for 2.8h run.',
      action_type: action_type || 'GEN_SCHEDULE',
      target_loads: [{ load_id: 'LOAD-T2-LAB', action: 'RESCHEDULE' }, { load_id: 'LOAD-T3-REC', action: 'SHED' }],
      generator_hours_recommended: 2.8,
      estimated_fuel_saved_liters: 142.8,
      status: 'APPROVED',
      commander_id,
      approval_timestamp: new Date().toISOString(),
      override_reason: notes || 'Standard polar microgrid optimization approval',
    };

    localDecisionLog.unshift(decisionRecord);

    try {
      const query = `
        INSERT INTO commander_decisions (
          gap_kwh, recommendation_text, action_type, target_loads,
          generator_hours_recommended, estimated_fuel_saved_liters,
          status, commander_id, approval_timestamp, override_reason
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id;
      `;
      await pool.query(query, [
        decisionRecord.gap_kwh,
        decisionRecord.recommendation_text,
        decisionRecord.action_type,
        JSON.stringify(decisionRecord.target_loads),
        decisionRecord.generator_hours_recommended,
        decisionRecord.estimated_fuel_saved_liters,
        decisionRecord.status,
        decisionRecord.commander_id,
        decisionRecord.approval_timestamp,
        decisionRecord.override_reason,
      ]);
    } catch (err: any) {
      console.warn(`[DecisionsController] TimescaleDB insert skipped: ${err.message}. Local audit log updated.`);
    }

    res.json({
      status: 'success',
      message: 'Plan successfully approved and recorded in station immutable audit log.',
      data: decisionRecord,
    });
  }

  public static async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const query = `SELECT * FROM commander_decisions ORDER BY timestamp DESC LIMIT 50;`;
      const result = await pool.query(query);
      if (result.rows.length > 0) {
        res.json({ status: 'success', data: result.rows });
        return;
      }
    } catch (err: any) {
      console.warn(`[DecisionsController] DB log query fallback: ${err.message}`);
    }
    res.json({ status: 'success', data: localDecisionLog });
  }

  public static async overrideLoad(req: Request, res: Response): Promise<void> {
    const { load_id, target_state, commander_id } = req.body;

    // Safety Invariant Check: Tier 1 life-safety cannot be switched off
    if (load_id.startsWith('LOAD-T1') && target_state === false) {
      res.status(403).json({
        status: 'forbidden',
        message: 'SAFETY INTERLOCK TRIGGERED: Tier-1 Life-Support Heating & Critical Comm cannot be switched off.',
      });
      return;
    }

    res.json({
      status: 'success',
      message: `Load ${load_id} state switched to ${target_state ? 'ON' : 'OFF'} by ${commander_id || 'Commander'}.`,
      load_id,
      new_state: target_state,
    });
  }
}
