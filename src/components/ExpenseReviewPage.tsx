/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ExpenseClaim, UserProfile, ExpenseItem } from '../types';
import ExpenseApprovalStepsCard from './ExpenseApprovalStepsCard';
import {
  ArrowLeft,
  ChevronRight,
  Shield,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Landmark,
  XCircle,
  RefreshCw,
  Info,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExpenseReviewPageProps {
  claim: ExpenseClaim;
  currentUser: UserProfile;
  onCancel: () => void;
  onSubmitDecision: (payload: {
    overallStatus: 'approved' | 'rejected' | 'correction_required' | 'settled';
    remarks: string;
    paymentRef?: string;
    lineDecisions: Array<{ id: number; status: string; remarks: string }>;
  }) => void;
}

export default function ExpenseReviewPage({
  claim,
  currentUser,
  onCancel,
  onSubmitDecision
}: ExpenseReviewPageProps) {
  
  // Decisions state per item line: maps lineId to status (approved / rejected / correction_required)
  const [lineDecisions, setLineDecisions] = useState<Record<number, { status: string; remarks: string }>>({});
  
  // Overall confirmation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [overallRemarks, setOverallRemarks] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [modalError, setModalError] = useState('');

  // Setup initial default decisions for each line based on current role
  useEffect(() => {
    const initial: Record<number, { status: string; remarks: string }> = {};
    claim.items.forEach(item => {
      // Default to "approved" (or settled) if not previously acted, or keep previous status if any
      let defaultStatus = 'approved';
      if (currentUser.role === 'accounts_desk') {
        defaultStatus = 'settled';
      }

      // Check lock rules (if previously rejected by a previous desk)
      const isPreRejected = item.desk_manager_status === 'rejected' || item.desk_finance_status === 'rejected' || item.desk_hr_status === 'rejected';
      if (isPreRejected) {
        defaultStatus = 'rejected';
      }

      initial[item.id] = {
        status: defaultStatus,
        remarks: ''
      };
    });
    setLineDecisions(initial);
  }, [claim, currentUser]);

  const handleLineStatusChange = (lineId: number, status: string) => {
    setLineDecisions(prev => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
        status
      }
    }));
  };

  const handleLineRemarksChange = (lineId: number, remarks: string) => {
    setLineDecisions(prev => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
        remarks
      }
    }));
  };

  // Helper to bulk toggle all eligible lines
  const handleBulkToggle = (status: string) => {
    setLineDecisions(prev => {
      const next = { ...prev };
      claim.items.forEach(item => {
        // Only toggle lines that aren't locked on pre-rejected
        const isPreRejected = item.desk_manager_status === 'rejected' || item.desk_finance_status === 'rejected' || item.desk_hr_status === 'rejected';
        if (!isPreRejected) {
          next[item.id] = {
            ...next[item.id],
            status
          };
        }
      });
      return next;
    });
  };

  // Format currency
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Compute final action intent based on line-by-line choices
  const calculatedOverallStatus = () => {
    const decisions = Object.values(lineDecisions) as Array<{ status: string; remarks: string }>;
    if (decisions.length === 0) return 'approved';

    // Check if Accounts desk is settling
    if (currentUser.role === 'accounts_desk') {
      const hasAnySettled = decisions.some(d => d.status === 'settled');
      return hasAnySettled ? 'settled' : 'rejected';
    }

    // Check if any is rejected
    const hasAnyRejected = decisions.some(d => d.status === 'rejected');
    // Check if any is correction
    const hasAnyCorrection = decisions.some(d => d.status === 'correction_required');

    if (hasAnyCorrection) {
      return 'correction_required';
    }
    if (hasAnyRejected && decisions.every(d => d.status === 'rejected')) {
      return 'rejected'; // All rejected
    }
    return 'approved'; // Otherwise partial/full approved
  };

  const handlePreSubmitCheck = () => {
    // Basic verification: Ensure all lines have a decision
    const decisionsKeys = Object.keys(lineDecisions);
    if (decisionsKeys.length < claim.items.length) {
      alert("Please ensure decisions are filled for all line items.");
      return;
    }
    setModalError('');
    setIsModalOpen(true);
  };

  const handleModalSubmit = () => {
    if (!overallRemarks.trim()) {
      setModalError("Audit remarks are mandatory to complete review logging.");
      return;
    }

    const overall = calculatedOverallStatus();
    
    // Accounts specific checks
    if (overall === 'settled' && currentUser.role === 'accounts_desk') {
      if (!paymentReference.trim()) {
        setModalError("Payment Reference / NEFT Code is required for accounts settlements.");
        return;
      }
    }

    // Map record to list for submit
    const mappedLines = claim.items.map(item => ({
      id: item.id,
      status: lineDecisions[item.id]?.status || 'approved',
      remarks: lineDecisions[item.id]?.remarks || 'Approved during desk check'
    }));

    onSubmitDecision({
      overallStatus: overall as any,
      remarks: overallRemarks.trim(),
      paymentRef: paymentReference.trim() || undefined,
      lineDecisions: mappedLines
    });
  };

  const finalStatusIntent = calculatedOverallStatus();

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Page Header */}
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Auditing</span>
              <ChevronRight className="h-3 w-3" />
              <span>{claim.expense_number}</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl mt-0.5">
              Review Expense Claim
            </h2>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-150 rounded-xl px-3 py-1.5 flex items-center gap-2">
          <Shield className="h-4 w-4 text-indigo-600" />
          <span className="text-[10px] font-bold text-indigo-800 uppercase">
            Active Desk: <span className="text-slate-800">{currentUser.roleLabel}</span>
          </span>
        </div>
      </div>

      {/* 2. Interactive Steps Card Tracker */}
      <ExpenseApprovalStepsCard logs={claim.logs} currentStatus={claim.status} />

      {/* 3. Bulk Quick Select Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-500" />
            Line Decision Matrix
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Audit item lists line-by-line. Rejections from previous desks are locked and flagged.
          </p>
        </div>

        {/* Bulk toggle buttons */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Action:</span>
          {currentUser.role !== 'accounts_desk' ? (
            <>
              <button
                type="button"
                onClick={() => handleBulkToggle('approved')}
                className="bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Approve All
              </button>
              <button
                type="button"
                onClick={() => handleBulkToggle('correction_required')}
                className="bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Correct All
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => handleBulkToggle('settled')}
              className="bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Settle All
            </button>
          )}
        </div>
      </div>

      {/* 4. Action-Oriented Lines Grid */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3.5">Line Description</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
                <th className="px-5 py-3.5">Manager Desk</th>
                <th className="px-5 py-3.5">Finance Audit</th>
                <th className="px-5 py-3.5">HR Desk</th>
                <th className="px-5 py-3.5 sticky right-0 bg-slate-50/70 shadow-l">Audit Decisions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {claim.items.map((item, idx) => {
                // Check if pre-rejected
                const isPreRejected = item.desk_manager_status === 'rejected' || item.desk_finance_status === 'rejected' || item.desk_hr_status === 'rejected';
                
                const activeDecision = lineDecisions[item.id] || { status: 'approved', remarks: '' };

                return (
                  <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                    {/* Description Details */}
                    <td className="px-5 py-4 max-w-sm">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[9px] font-semibold text-slate-600">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{item.title}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {item.expense_type.label} • {formatDate(item.item_date)}
                        </span>
                        {item.description && (
                          <p className="text-xs text-slate-500 italic mt-1 leading-relaxed bg-slate-50 px-2 py-1 rounded">
                            &quot;{item.description}&quot;
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4 text-right font-bold text-xs text-slate-900 whitespace-nowrap">
                      {formatINR(item.amount)}
                    </td>

                    {/* Manager Status */}
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-bold">
                      {item.desk_manager_status ? (
                        <span className={`px-2 py-0.5 rounded ${
                          item.desk_manager_status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {item.desk_manager_status}
                        </span>
                      ) : <span className="text-slate-400 font-normal">-</span>}
                    </td>

                    {/* Finance Status */}
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-bold">
                      {item.desk_finance_status ? (
                        <span className={`px-2 py-0.5 rounded ${
                          item.desk_finance_status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {item.desk_finance_status}
                        </span>
                      ) : <span className="text-slate-400 font-normal">-</span>}
                    </td>

                    {/* HR Status */}
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-bold">
                      {item.desk_hr_status ? (
                        <span className={`px-2 py-0.5 rounded ${
                          item.desk_hr_status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {item.desk_hr_status}
                        </span>
                      ) : <span className="text-slate-400 font-normal">-</span>}
                    </td>

                    {/* Interactive Selection (STicky Right) */}
                    <td className="px-5 py-4 sticky right-0 bg-white shadow-l whitespace-nowrap min-w-[200px]" onClick={(e) => e.stopPropagation()}>
                      {isPreRejected ? (
                        <div className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <XCircle className="h-4 w-4" /> Locked Rejected
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <select
                            value={activeDecision.status}
                            onChange={(e) => handleLineStatusChange(item.id, e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-500"
                          >
                            {currentUser.role === 'manager' && (
                              <>
                                <option value="approved">Approve Line</option>
                                <option value="rejected">Reject Line</option>
                              </>
                            )}

                            {(currentUser.role === 'finance_desk' || currentUser.role === 'human_resources_desk') && (
                              <>
                                <option value="approved">Approve Line</option>
                                <option value="rejected">Reject Line</option>
                                <option value="correction_required">Request Correction</option>
                              </>
                            )}

                            {currentUser.role === 'accounts_desk' && (
                              <>
                                <option value="settled">Settle & Pay Line</option>
                                <option value="rejected">Reject Line</option>
                              </>
                            )}
                          </select>

                          {/* Individual line remarks input */}
                          <input
                            type="text"
                            placeholder="Add audit comments..."
                            value={activeDecision.remarks}
                            onChange={(e) => handleLineRemarksChange(item.id, e.target.value)}
                            className="w-full rounded-lg border border-slate-150 px-2 py-1 text-[11px] text-slate-700 focus:outline-none focus:border-slate-400 placeholder-slate-400"
                          />
                        </div>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Main Action Action Panel */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
        >
          Cancel Audit
        </button>
        <button
          type="button"
          onClick={handlePreSubmitCheck}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-indigo-100 active:scale-95 flex items-center gap-1.5 cursor-pointer"
          id="confirm-audit-btn"
        >
          Confirm and Log Decisions
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* 6. Confirmation Completion Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative z-50 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 space-y-4"
            >
              {/* Header */}
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-150">
                  <Shield className="text-indigo-600 h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {finalStatusIntent === 'settled' 
                      ? 'Process Settlement & Payout' 
                      : finalStatusIntent === 'correction_required' 
                      ? 'Confirm Correction Request' 
                      : finalStatusIntent === 'rejected'
                      ? 'Confirm Full Claim Rejection'
                      : 'Confirm Approval'
                    }
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Publishing decisions to audit stream</p>
                </div>
              </div>

              {/* Warning/Modal errors */}
              {modalError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" /> {modalError}
                </div>
              )}

              {/* Accounts specific: bank payment inputs */}
              {finalStatusIntent === 'settled' && currentUser.role === 'accounts_desk' && (
                <div className="space-y-1.5 bg-indigo-50/50 p-3.5 border border-indigo-150 rounded-xl">
                  <label className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                    <Landmark className="h-3.5 w-3.5" /> Bank Transaction Reference (NEFT/RTGS) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TXN-2026-NEFT-908123"
                    value={paymentReference}
                    onChange={(e) => {
                      setPaymentReference(e.target.value);
                      setModalError('');
                    }}
                    className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    id="payment-ref-input"
                  />
                  <p className="text-[9px] text-indigo-700">Required reference code for organizational payouts.</p>
                </div>
              )}

              {/* Mandatory overall remarks */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" /> Audit Remarks / Audit Note <span className="text-rose-500">*</span>
                </label>
                <textarea
                  placeholder="Provide audit reason, compliance details or reason for corrections..."
                  value={overallRemarks}
                  onChange={(e) => {
                    setOverallRemarks(e.target.value);
                    setModalError('');
                  }}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-500 resize-none"
                  id="overall-remarks-textarea"
                />
                <p className="text-[9px] text-slate-400">These remarks are published directly to the public timeline log.</p>
              </div>

              {/* Modal actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleModalSubmit}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4.5 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
                  id="modal-submit-decision-btn"
                >
                  Publish Audit
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
