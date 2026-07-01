/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ExpenseClaim, UserProfile, ExpenseItem, AuditLog, Attachment } from '../types';
import ExpenseApprovalStepsCard from './ExpenseApprovalStepsCard';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Paperclip,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MessageSquare,
  Landmark,
  Shield,
  FileText,
  User,
  Edit,
  Trash,
  X,
  Eye,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExpenseDetailPageProps {
  claim: ExpenseClaim;
  currentUser: UserProfile;
  onBack: () => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onReview: (id: number) => void;
}

export default function ExpenseDetailPage({
  claim,
  currentUser,
  onBack,
  onEdit,
  onDelete,
  onReview
}: ExpenseDetailPageProps) {
  const [activeTab, setActiveTab] = useState<'items' | 'timeline'>('items');
  const [lightboxFile, setLightboxFile] = useState<Attachment | null>(null);

  // Checks
  const isOwner = claim.employee.id === currentUser.id;
  const isAwaitingActiveUser = claim.current_approver_role === currentUser.role;

  // Determine edit/delete permissions
  const canEdit = isOwner && ['awaiting_manager', 'pending', 'correction_required'].includes(claim.status);
  const canDelete = isOwner && ['awaiting_manager', 'pending'].includes(claim.status);

  // Formatters
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatFullTime = (timeStr: string) => {
    const d = new Date(timeStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Safe checks for line-item outcomes
  const getOutcomeBadge = (status: string | null, remarks: string | null) => {
    if (status === 'approved' || status === 'settled') {
      return (
        <span
          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150 cursor-help"
          title={remarks || 'Approved'}
        >
          <CheckCircle2 className="h-3 w-3" /> Approved
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span
          className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-150 cursor-help"
          title={remarks || 'Rejected'}
        >
          <XCircle className="h-3 w-3" /> Rejected
        </span>
      );
    }
    if (status === 'correction_required') {
      return (
        <span
          className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 cursor-help"
          title={remarks || 'Correction Required'}
        >
          <RefreshCw className="h-3 w-3 animate-spin-slow" /> Correction
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-150">
        <HelpCircle className="h-3 w-3" /> Pending
      </span>
    );
  };

  const getLogActionStyle = (action: string) => {
    switch (action) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'correction': return 'bg-amber-100 text-amber-800';
      case 'settle': return 'bg-indigo-100 text-indigo-800';
      case 'rejected': return 'bg-rose-100 text-rose-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const totalAmount = claim.items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Lightbox Receipt Viewer Overlay */}
      <AnimatePresence>
        {lightboxFile && (
          <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxFile(null)}
              className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-200 max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[300px]">
                    Viewing attachment: {lightboxFile.name}
                  </span>
                </div>
                <button
                  onClick={() => setLightboxFile(null)}
                  className="rounded-lg p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 bg-slate-100 overflow-y-auto flex items-center justify-center min-h-[300px]">
                {lightboxFile.mime_type.startsWith('image/') ? (
                  <img
                    src={lightboxFile.url}
                    alt={lightboxFile.name}
                    className="max-w-full max-h-[60vh] object-contain rounded border border-slate-300 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center p-8 bg-white border border-slate-200 rounded-xl max-w-sm">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto stroke-[1.5] mb-3" />
                    <h4 className="text-sm font-bold text-slate-900">PDF Audit Receipt Document</h4>
                    <p className="text-xs text-slate-500 mt-1">This mock PDF contains certified receipt items, stamp compliance identifiers, and detailed merchant line logs.</p>
                    <a
                      href={lightboxFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Open Document in New Tab <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>

              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-[11px] text-slate-400">
                <span>Size: {(lightboxFile.size / 1024).toFixed(0)} KB</span>
                <span>Yolocorp Audit System Secure Node</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1. Breadcrumbs Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            id="back-to-list-btn"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Claims</span>
              <ChevronRight className="h-3 w-3" />
              <span>{claim.expense_number}</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl mt-0.5">
              {claim.title}
            </h2>
          </div>
        </div>

        {/* Edit / Delete / Action Buttons */}
        <div className="flex items-center gap-2.5">
          {canEdit && (
            <button
              onClick={() => onEdit(claim.id)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer"
              id="detail-edit-btn"
            >
              <Edit className="h-3.5 w-3.5 text-slate-500" />
              Edit Claim File
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this expense claim permanently?')) {
                  onDelete(claim.id);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/20 hover:bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 shadow-2xs transition-all cursor-pointer"
              id="detail-delete-btn"
            >
              <Trash className="h-3.5 w-3.5 text-rose-500" />
              Delete Claim
            </button>
          )}
        </div>
      </div>

      {/* 2. Highlighted Pending Review Banner (Approvers Action trigger) */}
      {isAwaitingActiveUser && (
        <div className="bg-indigo-600 border border-indigo-700 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">Attention Approver</h4>
              <p className="text-xs text-indigo-100 mt-0.5">
                This claim is currently awaiting your review as <span className="font-bold underline">{currentUser.roleLabel}</span>.
              </p>
            </div>
          </div>
          
          <button
            onClick={() => onReview(claim.id)}
            className="inline-flex items-center gap-2 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2.5 text-xs font-extrabold transition-all shadow-sm active:scale-95 cursor-pointer"
            id="detail-review-action-btn"
          >
            Review and Audit Action
            <ChevronRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* 3. Summary Tiles Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">ID Reference</span>
          <span className="text-xs font-bold text-slate-900 mt-1 block">{claim.expense_number}</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Claim Total</span>
          <span className="text-xs font-extrabold text-indigo-600 mt-1 block">{formatINR(totalAmount)}</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Lines Count</span>
          <span className="text-xs font-bold text-slate-900 mt-1 block">{claim.items.length} items</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Location City</span>
          <span className="text-xs font-bold text-slate-900 mt-1 block flex items-center gap-1">
            <MapPin className="h-3 w-3 text-slate-400" /> {claim.city}
          </span>
        </div>

        {/* Metric 5 */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Category</span>
          <span className="text-xs font-bold text-slate-900 mt-1 block flex items-center gap-1">
            <Tag className="h-3 w-3 text-slate-400" /> {claim.category.label}
          </span>
        </div>

        {/* Metric 6 */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs col-span-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Occurred On</span>
          <span className="text-xs font-bold text-slate-900 mt-1 block">
            {claim.category.type === 'trip_expense'
              ? `${formatDate(claim.from_date)}`
              : formatDate(claim.transaction_date)
            }
          </span>
        </div>
      </div>

      {/* 4. Sequential Steps Flow Tracker */}
      <ExpenseApprovalStepsCard logs={claim.logs} currentStatus={claim.status} />

      {/* 5. Details Section Tabs */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'items'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-800'
            }`}
          >
            Claim Line Items List
          </button>
          
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'timeline'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-800'
            }`}
          >
            Audit Log Timeline
          </button>
        </div>

        {activeTab === 'items' ? (
          /* TAB 1: ITEMS TABLE LIST */
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Details</th>
                    <th className="px-5 py-3.5 text-right">Amount</th>
                    <th className="px-5 py-3.5">Line Manager</th>
                    <th className="px-5 py-3.5">Finance Desk</th>
                    <th className="px-5 py-3.5">HR Desk</th>
                    <th className="px-5 py-3.5">Accounts Desk</th>
                    <th className="px-5 py-3.5">Receipts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {claim.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Details Column */}
                      <td className="px-5 py-4 max-w-sm">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[9px] font-semibold text-slate-600">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{item.title}</span>
                          </div>
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
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

                      {/* Desk Columns */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {getOutcomeBadge(item.desk_manager_status, item.desk_manager_remarks)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {getOutcomeBadge(item.desk_finance_status, item.desk_finance_remarks)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {getOutcomeBadge(item.desk_hr_status, item.desk_hr_remarks)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {getOutcomeBadge(item.desk_accounts_status, item.desk_accounts_remarks)}
                      </td>

                      {/* Attachments Column */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {item.attachments.map(att => (
                            <button
                              key={att.name}
                              onClick={() => setLightboxFile(att)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors hover:underline text-left max-w-[120px] truncate"
                              title={`View ${att.name}`}
                            >
                              <Paperclip className="h-3 w-3 shrink-0" />
                              <span className="truncate">{att.name}</span>
                            </button>
                          ))}
                          {item.attachments.length === 0 && (
                            <span className="text-[10px] text-slate-400 italic">None</span>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* TAB 2: AUDIT TIMELINE STREAM */
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
            <div className="relative border-l-2 border-slate-100 pl-6 space-y-6">
              {claim.logs.map((log, index) => {
                const isSystemLog = log.actor_role === 'accounts_desk' && log.action === 'settle';
                
                return (
                  <div key={log.id} className="relative">
                    {/* Circle timeline indicators */}
                    <span className={`absolute -left-[31px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 ${
                      log.action === 'approved' || log.action === 'settle'
                        ? 'border-emerald-500'
                        : log.action === 'correction'
                        ? 'border-amber-500'
                        : log.action === 'submitted'
                        ? 'border-blue-500'
                        : 'border-rose-500'
                    }`} />

                    <div className="space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{log.actor.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          ({log.actor_role.replace('_', ' ')})
                        </span>
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded ${getLogActionStyle(log.action)}`}>
                          {log.action}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 bg-slate-50/50 p-3 rounded-xl border border-slate-100 italic leading-relaxed">
                        &quot;{log.remarks}&quot;
                      </p>

                      {/* Display reference codes if they exist */}
                      {log.payment_ref && (
                        <div className="inline-flex items-center gap-1.5 text-xs text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg">
                          <Landmark className="h-3.5 w-3.5" />
                          Bank Transaction Ref: <span className="underline select-all">{log.payment_ref}</span>
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatFullTime(log.acted_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
