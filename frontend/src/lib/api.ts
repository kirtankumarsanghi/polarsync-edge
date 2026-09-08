export interface ApprovalPayload {
  decision_id?: string;
  commander_id: string;
  approval_pin?: string;
  action_type?: string;
  notes?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export const api = {
  async getLiveTelemetry() {
    const res = await fetch(`${API_BASE}/api/telemetry/live`);
    if (!res.ok) throw new Error('Failed to fetch live telemetry');
    return res.json();
  },

  async getForecasts() {
    const res = await fetch(`${API_BASE}/api/telemetry/forecasts`);
    if (!res.ok) throw new Error('Failed to fetch forecast curves');
    return res.json();
  },

  async getLatestPlan() {
    const res = await fetch(`${API_BASE}/api/decisions/plan`);
    if (!res.ok) throw new Error('Failed to fetch decision plan');
    return res.json();
  },

  async approvePlan(payload: ApprovalPayload) {
    const res = await fetch(`${API_BASE}/api/decisions/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to approve plan');
    }
    return res.json();
  },

  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/api/decisions/audit`);
    if (!res.ok) throw new Error('Failed to fetch decision audit trail');
    return res.json();
  },

  async overrideLoad(loadId: string, targetState: boolean, commanderId: string) {
    const res = await fetch(`${API_BASE}/api/decisions/override-load`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        load_id: loadId,
        target_state: targetState,
        commander_id: commanderId,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Safety interlock denied override');
    }
    return res.json();
  },
};
