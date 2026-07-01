/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuditLog } from '../types';
import { Check, ShieldAlert, Clock, RefreshCw, Landmark, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExpenseApprovalStepsCardProps {
  logs: AuditLog[];
  currentStatus: string;
}

export default function ExpenseApprovalStepsCard({ logs, currentStatus }: ExpenseApprovalStepsCardProps) {
  const [selectedLogForModal, setSelectedLogForModal] = useState<AuditLog | null>(null);
  
  // Format dates cleanly
  const formatTime = (timeStr: string) => {
    const d = new Date(timeStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Map action name to a clean display
  const getActionName = (action: string) => {
    switch (action) {
      case 'submitted': return 'Submitted';
      case 'approved': return 'Approved';
      case 'correction': return 'Correction Sent';
      case 'settle': return 'Settled & Paid';
      case 'rejected': return 'Rejected';
      default: return action;
    }
  };

  // Sequential steps visual representation
  const steps = [
    { label: 'Submit', role: 'employee', statusKey: 'awaiting_manager' },
    { label: 'Line Manager', role: 'manager', statusKey: 'pending' },
    { label: 'Finance Audit', role: 'finance_desk', statusKey: 'hr_approved' },
    { label: 'HR Compliance', role: 'human_resources_desk', statusKey: 'hr_approved_final' },
    { label: 'Accounts Settle', role: 'accounts_desk', statusKey: 'settled' }
  ];

  // Map step index status
  const getStepStatus = (index: number) => {
    // Determine active stage
    if (currentStatus === 'settled') return 'completed';
    
    if (currentStatus.startsWith('rejected')) {
      // Find where it was rejected
      const rejectAt = currentStatus.split('_').pop();
      if (rejectAt === 'manager' && index === 1) return 'failed';
      if (rejectAt === 'finance' && index === 2) return 'failed';
      if (rejectAt === 'hr' && index === 3) return 'failed';
      if (rejectAt === 'accounts' && index === 4) return 'failed';
    }

    if (currentStatus === 'correction_required' && index === 2) {
      return 'correction';
    }

    // Standard progression mappings
    const mappings: Record<string, number> = {
      'awaiting_manager': 1,
      'pending': 2,
      'hr_approved': 3,
      'settled': 5
    };

    const currentStepIdx = mappings[currentStatus] || 1;
    if (index < currentStepIdx) return 'completed';
    if (index === currentStepIdx) return 'active';
    return 'upcoming';
  };

  return (
    <div className="bg-white border border-slate-200/85 rounded-2xl p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-slate-500" />
          Audit Tracking Steps
        </h3>
        <span className="text-[10px] font-semibold text-slate-500 uppercase">
          Desk Flow Status
        </span>
      </div>

      {/* Steps Horizontal visualization */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2">
        {steps.map((st, idx) => {
          const stepState = getStepStatus(idx);
          
          return (
            <div
              key={idx}
              className={`relative flex flex-col justify-between p-3.5 rounded-xl border transition-all ${
                stepState === 'completed'
                  ? 'border-emerald-150 bg-emerald-50/20 text-emerald-800'
                  : stepState === 'active'
                  ? 'border-indigo-200 bg-indigo-50/30 text-indigo-900 ring-2 ring-indigo-100'
                  : stepState === 'correction'
                  ? 'border-amber-200 bg-amber-50/30 text-amber-900 ring-2 ring-amber-100'
                  : stepState === 'failed'
                  ? 'border-rose-250 bg-rose-50/20 text-rose-900'
                  : 'border-slate-150 bg-slate-50/50 text-slate-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">
                    Step 0{idx + 1}
                  </span>

                  {/* Icon indicators */}
                  {stepState === 'completed' && <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />}
                  {stepState === 'active' && <Clock className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />}
                  {stepState === 'correction' && <RefreshCw className="h-3.5 w-3.5 text-amber-600 animate-spin-slow" />}
                  {stepState === 'failed' && <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />}
                </div>

                <p className="text-xs font-bold mt-2 text-slate-900">
                  {st.label}
                </p>
                <p className="text-[9px] text-slate-500 leading-3 font-medium mt-0.5">
                  {idx === 0 ? 'Employee Submission' : `Role: ${st.role.replace('_', ' ')}`}
                </p>
              </div>

              {/* Display latest action matching this role if exists */}
              {logs.length > 0 && (
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 text-[10px] space-y-1">
                  {(() => {
                    // Find latest log matching this step's role
                    const matchingLog = [...logs]
                      .reverse()
                      .find(l => l.actor_role === st.role || (idx === 0 && l.actor_role === 'employee'));

                    if (matchingLog) {
                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 truncate max-w-[80px]">
                              {matchingLog.actor.name}
                            </span>
                            <span className={`px-1 rounded text-[8px] font-bold uppercase ${
                              matchingLog.action === 'approved' || matchingLog.action === 'submitted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : matchingLog.action === 'correction'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {getActionName(matchingLog.action)}
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-600 italic leading-snug line-clamp-2 mt-1 break-words" title={matchingLog.remarks}>
                            &quot;{matchingLog.remarks || 'No notes'}&quot;
                          </p>
                          {matchingLog.remarks && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLogForModal(matchingLog);
                              }}
                              className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline mt-0.5 block cursor-pointer bg-indigo-50/50 hover:bg-indigo-100/50 px-1.5 py-0.5 rounded transition-all w-fit"
                            >
                              Show more
                            </button>
                          )}
                          {matchingLog.payment_ref && (
                            <div className="flex items-center gap-1 text-[9px] text-indigo-700 font-bold mt-1 bg-indigo-50 px-1 py-0.5 rounded">
                              <Landmark className="h-2.5 w-2.5" />
                              <span className="truncate max-w-[100px]">{matchingLog.payment_ref}</span>
                            </div>
                          )}
                          <p className="text-[8px] text-slate-400 font-medium mt-1">
                            {formatTime(matchingLog.acted_at)}
                          </p>
                        </>
                      );
                    } else {
                      return (
                        <p className="text-slate-400 italic">No logs logged yet</p>
                      );
                    }
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Audit Note Modal */}
      <AnimatePresence>
        {selectedLogForModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLogForModal(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative z-50 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100">
                    <Clock className="text-indigo-600 h-4.5 w-4.5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Audit Step Log Note
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">Detailed tracking history and remarks</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLogForModal(null)}
                  className="rounded-lg border border-slate-250 hover:bg-slate-50 p-1.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <XCircle className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Actioned By</span>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedLogForModal.actor.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Role: {selectedLogForModal.actor_role.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Action Taken</span>
                    <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                      selectedLogForModal.action === 'approved' || selectedLogForModal.action === 'submitted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedLogForModal.action === 'correction'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {getActionName(selectedLogForModal.action)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 bg-indigo-50/20 border border-indigo-50 rounded-xl p-4">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block mb-1">Remarks & Audit Notes</span>
                  <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                    &quot;{selectedLogForModal.remarks || "No comments log"}&quot;
                  </p>
                </div>

                {selectedLogForModal.payment_ref && (
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50/70 border border-indigo-100 px-3.5 py-2.5 rounded-xl">
                    <Landmark className="h-4 w-4 shrink-0" />
                    <div>
                      <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Payment Reference / Txn ID</span>
                      <span className="text-xs text-indigo-800 font-mono select-all">{selectedLogForModal.payment_ref}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1">
                  <span>Log Timestamp</span>
                  <span>{formatTime(selectedLogForModal.acted_at)}</span>
                </div>
              </div>

              {/* Close Footer Action */}
              <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedLogForModal(null)}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4.5 py-2 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Close Log Note
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
