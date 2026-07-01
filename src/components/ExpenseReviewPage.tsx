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
  Layers,
  Calendar,
  DollarSign,
  Paperclip,
  Tag,
  FileText
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

  // Selected item to view details in modal
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<ExpenseItem | null>(null);

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
  const getReviewStatusBadge = (status: string | null) => {
    if (!status) return <span className="text-slate-400 font-normal">-</span>;
    let style = 'bg-rose-50 text-rose-700 border border-rose-200';
    if (status === 'approved' || status === 'settled') {
      style = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    } else if (status === 'correction_required') {
      style = 'bg-amber-50 text-amber-700 border border-amber-200';
    }
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${style}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

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

  if (claim.current_approver_role !== currentUser.role) {
    return (
      <div className="space-y-6 pb-12">
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
        </div>

        <div className="bg-rose-50 border border-rose-150 rounded-2xl p-8 text-center max-w-lg mx-auto mt-12 shadow-xs" id="review-access-denied-gate">
          <Shield className="h-12 w-12 text-rose-600 mx-auto stroke-[1.5] mb-4 animate-pulse" />
          <h3 className="text-base font-bold text-slate-900">Access Denied</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Your current role (<span className="font-bold text-slate-700">{currentUser.roleLabel}</span>) is not authorized to audit this claim. This claim is currently awaiting review at the <span className="font-bold text-indigo-650">{claim.current_approver_role ? claim.current_approver_role.replace('_', ' ').toUpperCase() : 'N/A'}</span> desk.
          </p>
          <button
            onClick={onCancel}
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white px-5 py-2.5 shadow-sm transition-all cursor-pointer"
          >
            Go Back to List
          </button>
        </div>
      </div>
    );
  }

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
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                <th className="px-5 py-3.5 min-w-[200px]">Line Description</th>
                <th className="px-5 py-3.5 text-right w-[110px]">Amount</th>
                <th className="px-5 py-3.5 text-center w-[120px]">Manager Desk</th>
                <th className="px-5 py-3.5 text-center w-[120px]">Finance Audit</th>
                <th className="px-5 py-3.5 text-center w-[120px]">HR Desk</th>
                <th className="px-5 py-3.5 sticky right-0 bg-slate-100 border-l border-slate-200 z-10 w-[180px] min-w-[180px]">Audit Decisions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {claim.items.map((item, idx) => {
                // Check if pre-rejected
                const isPreRejected = item.desk_manager_status === 'rejected' || item.desk_finance_status === 'rejected' || item.desk_hr_status === 'rejected';
                
                const activeDecision = lineDecisions[item.id] || { status: 'approved', remarks: '' };

                return (
                  <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                    {/* Description Details */}
                    <td className="px-5 py-4 max-w-xs sm:max-w-sm">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-[9px] font-bold text-indigo-600">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900 leading-tight">{item.title}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                          {item.expense_type.label} • {formatDate(item.item_date)}
                        </span>
                        
                        <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 border-t border-slate-100">
                          <span className="text-[11px] text-slate-500 italic truncate max-w-[160px] block" title={item.description}>
                            {item.description ? `"${item.description}"` : "No description"}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedItemForDetails(item)}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline shrink-0 flex items-center gap-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition-colors"
                          >
                            <Info className="h-3 w-3" /> Show all
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4 text-right font-bold text-xs text-slate-900 whitespace-nowrap w-[110px]">
                      {formatINR(item.amount)}
                    </td>

                    {/* Manager Status */}
                    <td className="px-5 py-4 text-center whitespace-nowrap w-[120px]">
                      {getReviewStatusBadge(item.desk_manager_status)}
                    </td>

                    {/* Finance Status */}
                    <td className="px-5 py-4 text-center whitespace-nowrap w-[120px]">
                      {getReviewStatusBadge(item.desk_finance_status)}
                    </td>

                    {/* HR Status */}
                    <td className="px-5 py-4 text-center whitespace-nowrap w-[120px]">
                      {getReviewStatusBadge(item.desk_hr_status)}
                    </td>

                    {/* Interactive Selection (Sticky Right with Opaque Background) */}
                    <td className="px-5 py-4 sticky right-0 bg-white border-l border-slate-200 z-10 w-[180px] min-w-[180px]" onClick={(e) => e.stopPropagation()}>
                      {isPreRejected ? (
                        <div className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 justify-center w-full">
                          <XCircle className="h-4 w-4 shrink-0" /> Locked Rejected
                        </div>
                      ) : (
                        <div className="w-full">
                          <select
                            value={activeDecision.status}
                            onChange={(e) => handleLineStatusChange(item.id, e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer"
                          >
                            {currentUser.role === 'manager' && (
                              <>
                                <option value="approved">Approve Line</option>
                                <option value="rejected">Reject Line</option>
                                <option value="correction_required">Request Correction</option>
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

      {/* 7. Line Item Details Modal Dialog */}
      <AnimatePresence>
        {selectedItemForDetails && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItemForDetails(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative z-50 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100">
                    <FileText className="text-indigo-600 h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Line Item Details
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Comprehensive audit and background view</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItemForDetails(null)}
                  className="rounded-lg border border-slate-250 hover:bg-slate-50 p-1.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              {/* Main Content Info */}
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {/* Row 1: Title and Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Item Title</span>
                    <p className="text-xs font-bold text-slate-800">{selectedItemForDetails.title}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expense Category</span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
                      <Tag className="h-3.5 w-3.5" />
                      {selectedItemForDetails.expense_type.label}
                    </span>
                  </div>
                </div>

                {/* Row 2: Date and Amount */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Spent Date</span>
                    <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {formatDate(selectedItemForDetails.item_date)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Line Amount</span>
                    <p className="text-xs font-extrabold text-indigo-600 flex items-center gap-0.5">
                      <DollarSign className="h-4 w-4 text-indigo-500" />
                      {formatINR(selectedItemForDetails.amount)}
                    </p>
                  </div>
                </div>

                {/* Row 3: Description */}
                <div className="space-y-1 bg-slate-50 border border-slate-150 rounded-xl p-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Description</span>
                  <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                    {selectedItemForDetails.description || "No full description provided for this line item."}
                  </p>
                </div>

                {/* Row 4: Attachments */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attachments ({selectedItemForDetails.attachments?.length || 0})</span>
                  {selectedItemForDetails.attachments && selectedItemForDetails.attachments.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {selectedItemForDetails.attachments.map((att, attIdx) => (
                        <a
                          key={attIdx}
                          href={att.url}
                          target="_blank"
                          rel="noreferrer referrer"
                          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 hover:shadow-2xs transition-all animate-fade-in"
                        >
                          <Paperclip className="h-4 w-4 text-slate-400" />
                          <span className="truncate max-w-[200px]">{att.name}</span>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-auto">({(att.size / 1024).toFixed(1)} KB)</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No attachments uploaded for this line item.</p>
                  )}
                </div>

                {/* Row 5: Approval Status by Desks */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Multi-Desk Audit History</h4>
                  </div>
                  <div className="p-3.5 space-y-3 divide-y divide-slate-100">
                    <div className="flex justify-between items-start pt-2 first:pt-0">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Manager Desk</span>
                        <p className="text-xs text-slate-500 italic mt-0.5">{selectedItemForDetails.desk_manager_remarks || "No comments log"}</p>
                      </div>
                      <div>{getReviewStatusBadge(selectedItemForDetails.desk_manager_status)}</div>
                    </div>
                    <div className="flex justify-between items-start pt-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Finance Audit</span>
                        <p className="text-xs text-slate-500 italic mt-0.5">{selectedItemForDetails.desk_finance_remarks || "No comments log"}</p>
                      </div>
                      <div>{getReviewStatusBadge(selectedItemForDetails.desk_finance_status)}</div>
                    </div>
                    <div className="flex justify-between items-start pt-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">HR Desk</span>
                        <p className="text-xs text-slate-500 italic mt-0.5">{selectedItemForDetails.desk_hr_remarks || "No comments log"}</p>
                      </div>
                      <div>{getReviewStatusBadge(selectedItemForDetails.desk_hr_status)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal actions */}
              <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedItemForDetails(null)}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Close Details
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
