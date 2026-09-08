'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';
import { api } from '../../lib/api';
import { ShieldCheck, AlertTriangle, Fuel, CheckCircle2 } from 'lucide-react';

export const ApprovalModal: React.FC = () => {
  const { approvalModalOpen, setApprovalModalOpen, plan } = useStore();
  const [commanderId, setCommanderId] = useState('CDR-BHARATI-CHIEF');
  const [notes, setNotes] = useState('Approved optimal solar rescheduling and 2.8h evening GenSet run.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await api.approvePlan({
        commander_id: commanderId,
        action_type: plan?.action_type || 'GEN_SCHEDULE',
        notes,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setApprovalModalOpen(false);
      }, 1500);
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={approvalModalOpen}
      onClose={() => setApprovalModalOpen(false)}
      title="Station Commander Plan Authorization"
    >
      {isSuccess ? (
        <div className="py-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-polar-green mx-auto mb-3 animate-bounce" />
          <h3 className="text-lg font-bold text-polar-text">Authorization Confirmed</h3>
          <p className="text-xs text-polar-muted mt-1">
            Decision cryptographically logged in station TimescaleDB audit ledger.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-polar-amber shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-polar-amber">Commander Action Required:</span>
              <p className="text-polar-muted mt-0.5">
                PolarSync AI recommends a scheduled <b>{plan?.generator_recommended_hours}h</b> diesel generator cycle and rescheduling Tier-2 laboratory loads to cover tomorrow&apos;s <b>{plan?.net_gap_kwh} kWh</b> gap.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-polar-panel rounded-lg border border-polar-line">
              <span className="text-polar-muted block">Expected Diesel Saved</span>
              <span className="text-lg font-bold text-polar-green flex items-center gap-1.5 mt-1">
                <Fuel className="w-4 h-4" />
                ~{plan?.estimated_fuel_saved_liters} Liters
              </span>
            </div>
            <div className="p-3 bg-polar-panel rounded-lg border border-polar-line">
              <span className="text-polar-muted block">Life-Safety Status</span>
              <span className="text-lg font-bold text-polar-cyan flex items-center gap-1.5 mt-1">
                <ShieldCheck className="w-4 h-4" />
                100% Protected
              </span>
            </div>
          </div>

          <div className="text-xs text-polar-muted space-y-1 bg-polar-bg/60 p-3 rounded-lg border border-polar-line">
            <div className="font-semibold text-polar-text mb-1">Explainable AI Audit Log:</div>
            {plan?.explainability.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-polar-cyan">›</span>
                <span>{point}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-polar-muted block">Commander Digital Call-Sign / ID</label>
            <input
              type="text"
              value={commanderId}
              onChange={(e) => setCommanderId(e.target.value)}
              className="w-full bg-polar-bg border border-polar-line rounded-lg px-3 py-2 text-sm text-polar-text focus:outline-none focus:border-polar-cyan"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-polar-line">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setApprovalModalOpen(false)}
            >
              Cancel / Hold
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={isSubmitting}
              onClick={handleApprove}
            >
              {isSubmitting ? 'Signing...' : 'Authorize & Execute Plan'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
