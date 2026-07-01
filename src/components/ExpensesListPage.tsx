/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ExpenseClaim, UserProfile } from '../types';
import { EXPENSE_CATEGORIES } from '../data';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Calendar,
  IndianRupee,
  ChevronRight,
  MoreVertical,
  Pencil,
  Trash2,
  Filter,
  RefreshCw,
  TrendingUp,
  FileCheck2,
  FileBarChart2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ExpensesListPageProps {
  claims: ExpenseClaim[];
  currentUser: UserProfile;
  onSelectClaim: (id: number) => void;
  onReviewClaim: (id: number) => void;
  onNewClaim: () => void;
  onEditClaim: (id: number) => void;
  onDeleteClaim: (id: number) => void;
  onViewPolicy: () => void;
}

export default function ExpensesListPage({
  claims,
  currentUser,
  onSelectClaim,
  onReviewClaim,
  onNewClaim,
  onEditClaim,
  onDeleteClaim,
  onViewPolicy
}: ExpensesListPageProps) {
  // Filters & State
  const [activeTab, setActiveTab] = useState<'all' | 'settled' | 'rejected' | 'corrections'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  // Advanced search states
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Active actions menu popover
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Helper to check if current user is an approver role
  const isApprover = currentUser.role !== 'employee';

  // Format currency helper (Indian standard format)
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format dates helper
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setFromDate('');
    setToDate('');
    setStatusFilter('all');
    setSelectedCategory('all');
    setCurrentPage(1);
  };

  // Determine claims based on User Role & Queue rules
  const userFilteredClaims = useMemo(() => {
    const filtered = isApprover
      ? [...claims]
      : claims.filter((claim) => claim.employee.id === currentUser.id);

    return filtered.sort((a, b) => {
      const timeA = new Date(a.submitted_at).getTime();
      const timeB = new Date(b.submitted_at).getTime();
      if (timeB !== timeA) {
        return timeB - timeA;
      }
      return b.id - a.id;
    });
  }, [claims, currentUser, isApprover]);

  // Apply Search, Filters & Tab filtering
  const finalFilteredClaims = useMemo(() => {
    return userFilteredClaims.filter((claim) => {
      // Tab matching
      if (activeTab === 'settled' && claim.status !== 'settled') return false;
      if (activeTab === 'corrections' && claim.status !== 'correction_required') return false;
      if (activeTab === 'rejected') {
        const isRejected = ['rejected_by_manager', 'rejected_by_hr', 'rejected_by_finance', 'rejected_by_accounts'].includes(claim.status);
        if (!isRejected) return false;
      }

      // Quick Category select
      if (selectedCategory !== 'all' && claim.category.id !== parseInt(selectedCategory)) return false;

      // Advanced search query (ID, title, submitter name/email)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesId = claim.expense_number.toLowerCase().includes(query);
        const matchesTitle = claim.title.toLowerCase().includes(query);
        const matchesEmployee = claim.employee.name.toLowerCase().includes(query) || claim.employee.email.toLowerCase().includes(query);
        if (!matchesId && !matchesTitle && !matchesEmployee) return false;
      }

      // From / To date filter
      if (fromDate) {
        const claimDate = new Date(claim.submitted_at);
        const filterFrom = new Date(fromDate);
        if (claimDate < filterFrom) return false;
      }
      if (toDate) {
        const claimDate = new Date(claim.submitted_at);
        const filterTo = new Date(toDate);
        // Add 24 hours to include full selected day
        filterTo.setHours(23, 59, 59, 999);
        if (claimDate > filterTo) return false;
      }

      // Status dropdown filter
      if (statusFilter !== 'all' && claim.status !== statusFilter) return false;

      return true;
    });
  }, [userFilteredClaims, activeTab, selectedCategory, searchQuery, fromDate, toDate, statusFilter]);

  // Pagination calculations
  const totalRows = finalFilteredClaims.length;
  const totalPages = Math.ceil(totalRows / pageSize) || 1;
  const paginatedClaims = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return finalFilteredClaims.slice(startIndex, startIndex + pageSize);
  }, [finalFilteredClaims, currentPage, pageSize]);

  // Adjust page if filters change total row count
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalRows, totalPages, currentPage]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const all = userFilteredClaims.length;
    const settled = userFilteredClaims.filter(c => c.status === 'settled').length;
    const corrections = userFilteredClaims.filter(c => c.status === 'correction_required').length;
    const rejected = userFilteredClaims.filter(c =>
      ['rejected_by_manager', 'rejected_by_hr', 'rejected_by_finance', 'rejected_by_accounts'].includes(c.status)
    ).length;

    return { all, settled, corrections, rejected };
  }, [userFilteredClaims]);

  // Metrics (Employee Dashboard Only)
  const stats = useMemo(() => {
    const personalClaims = claims.filter(c => c.employee.id === currentUser.id);
    
    let totalSum = 0;
    let approvedSum = 0;
    let pendingSum = 0;
    let rejectedSum = 0;

    let totalCount = personalClaims.length;
    let approvedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;

    personalClaims.forEach(c => {
      const claimTotal = c.items.reduce((sum, item) => sum + item.amount, 0);
      totalSum += claimTotal;

      if (c.status === 'settled' || c.status === 'hr_approved') {
        approvedSum += claimTotal;
        approvedCount++;
      } else if (c.status === 'awaiting_manager' || c.status === 'pending') {
        pendingSum += claimTotal;
        pendingCount++;
      } else if (['rejected_by_manager', 'rejected_by_hr', 'rejected_by_finance', 'rejected_by_accounts'].includes(c.status)) {
        rejectedSum += claimTotal;
        rejectedCount++;
      } else if (c.status === 'correction_required') {
        // Corrections are pending attention
        pendingSum += claimTotal;
        pendingCount++;
      }
    });

    return {
      total: { val: totalSum, count: totalCount },
      approved: { val: approvedSum, count: approvedCount },
      pending: { val: pendingSum, count: pendingCount },
      rejected: { val: rejectedSum, count: rejectedCount }
    };
  }, [claims, currentUser]);

  // Metrics (Approver Dashboard)
  const approverStats = useMemo(() => {
    if (!isApprover) return null;

    // Claims currently awaiting this approver's desk action
    const pendingClaims = claims.filter(c => c.current_approver_role === currentUser.role);
    const pendingSum = pendingClaims.reduce((sum, c) => sum + c.items.reduce((itemSum, item) => itemSum + item.amount, 0), 0);

    // Claims actioned by this approver in the past
    const actionedClaims = claims.filter(c => c.logs.some(log => log.actor.id === currentUser.id));
    const actionedSum = actionedClaims.reduce((sum, c) => sum + c.items.reduce((itemSum, item) => itemSum + item.amount, 0), 0);

    // Approved/Settled claims actioned by this user
    const approvedClaims = actionedClaims.filter(c => {
      const myLog = c.logs.find(log => log.actor.id === currentUser.id);
      return myLog && (myLog.action === 'approved' || myLog.action === 'settle');
    });
    const approvedSum = approvedClaims.reduce((sum, c) => sum + c.items.reduce((itemSum, item) => itemSum + item.amount, 0), 0);

    // Correction claims actioned by this user
    const correctionClaims = actionedClaims.filter(c => {
      const myLog = c.logs.find(log => log.actor.id === currentUser.id);
      return myLog && myLog.action === 'correction';
    });
    const correctionSum = correctionClaims.reduce((sum, c) => sum + c.items.reduce((itemSum, item) => itemSum + item.amount, 0), 0);

    return {
      pending: { val: pendingSum, count: pendingClaims.length },
      actioned: { val: actionedSum, count: actionedClaims.length },
      approved: { val: approvedSum, count: approvedClaims.length },
      corrections: { val: correctionSum, count: correctionClaims.length }
    };
  }, [claims, currentUser, isApprover]);

  // Recharts data generation: Category spending
  const categoryChartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    EXPENSE_CATEGORIES.forEach(cat => {
      categoryTotals[cat.label] = 0;
    });

    const relevantClaims = isApprover
      ? claims.filter(c => c.current_approver_role === currentUser.role)
      : claims.filter(c => c.employee.id === currentUser.id);

    relevantClaims.forEach(claim => {
      claim.items.forEach(item => {
        const catLabel = claim.category.label;
        if (categoryTotals[catLabel] !== undefined) {
          categoryTotals[catLabel] += item.amount;
        } else {
          categoryTotals[catLabel] = item.amount;
        }
      });
    });

    return Object.keys(categoryTotals).map(label => ({
      name: label.length > 22 ? label.substring(0, 20) + '...' : label,
      amount: categoryTotals[label]
    }));
  }, [claims, currentUser, isApprover]);

  // Status badging utility
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'settled':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-650/10">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Settled
          </span>
        );
      case 'hr_approved':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-650/10">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            HR Approved
          </span>
        );
      case 'awaiting_manager':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-650/10 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Awaiting Manager
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-650/10">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Pending Audit
          </span>
        );
      case 'correction_required':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900 ring-1 ring-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-ping" />
            Correction Required
          </span>
        );
      case 'rejected_by_manager':
      case 'rejected_by_hr':
      case 'rejected_by_finance':
      case 'rejected_by_accounts':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-650/10">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-550/10">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl" id="page-title">
            {isApprover ? "Expense Approvals Dashboard" : "My Expenses"}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {isApprover 
              ? "Review, audit, and approve submitted claims across organizational desks."
              : "Track, file, and manage your personal corporate expense requests."
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onViewPolicy}
            className="md:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Policy Document <ExternalLink className="h-3.5 w-3.5" />
          </button>
          
          <button
            onClick={onNewClaim}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-indigo-100 active:scale-95 cursor-pointer"
            id="new-expense-btn"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            New Expense Claim
          </button>
        </div>
      </div>

      {/* 2. Dashboard Widgets & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Column */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {!isApprover ? (
            <>
              {/* CARD 1: Total Claims */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Requested
                  </p>
                  <p className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                    {formatINR(stats.total.val)}
                  </p>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-3 flex items-center gap-1.5">
                  <FileCheck2 className="h-4 w-4 text-slate-400" />
                  {stats.total.count} total requests filed
                </p>
              </div>

              {/* CARD 2: Approved / Settled */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Approved & Settled
                  </p>
                  <p className="text-2xl font-extrabold text-emerald-600 tracking-tight mt-1">
                    {formatINR(stats.approved.val)}
                  </p>
                </div>
                <p className="text-xs text-emerald-700 font-medium mt-3 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {stats.approved.count} requests approved
                </p>
              </div>

              {/* CARD 3: Pending Review */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Pending Review
                  </p>
                  <p className="text-2xl font-extrabold text-amber-600 tracking-tight mt-1">
                    {formatINR(stats.pending.val)}
                  </p>
                </div>
                <p className="text-xs text-amber-700 font-medium mt-3 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  {stats.pending.count} awaiting desk actions
                </p>
              </div>

              {/* CARD 4: Rejected Requests */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Rejected Claims
                  </p>
                  <p className="text-2xl font-extrabold text-rose-600 tracking-tight mt-1">
                    {formatINR(stats.rejected.val)}
                  </p>
                </div>
                <p className="text-xs text-rose-700 font-medium mt-3 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  {stats.rejected.count} requests rejected
                </p>
              </div>
            </>
          ) : (
            <>
              {/* CARD 1: Pending Your Desk */}
              <div className="bg-indigo-50/55 border border-indigo-150 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                    Pending Your Desk
                  </p>
                  <p className="text-2xl font-extrabold text-indigo-700 tracking-tight mt-1">
                    {formatINR(approverStats?.pending.val || 0)}
                  </p>
                </div>
                <p className="text-xs text-indigo-700 font-bold mt-3 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                  {approverStats?.pending.count || 0} claims awaiting your review
                </p>
              </div>

              {/* CARD 2: Actioned by You */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Actioned by You
                  </p>
                  <p className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                    {approverStats?.actioned.count || 0} Claims
                  </p>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-3 flex items-center gap-1.5">
                  <FileCheck2 className="h-4 w-4 text-slate-400" />
                  Value: {formatINR(approverStats?.actioned.val || 0)}
                </p>
              </div>

              {/* CARD 3: Approved / Settled */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Approved / Settled
                  </p>
                  <p className="text-2xl font-extrabold text-emerald-600 tracking-tight mt-1">
                    {approverStats?.approved.count || 0} Claims
                  </p>
                </div>
                <p className="text-xs text-emerald-700 font-medium mt-3 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Value: {formatINR(approverStats?.approved.val || 0)}
                </p>
              </div>

              {/* CARD 4: Corrections Issued */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Corrections Issued
                  </p>
                  <p className="text-2xl font-extrabold text-amber-650 tracking-tight mt-1">
                    {approverStats?.corrections.count || 0} Claims
                  </p>
                </div>
                <p className="text-xs text-amber-700 font-medium mt-3 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Value: {formatINR(approverStats?.corrections.val || 0)}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Chart Column (Fulfilling the Recharts/D3 requirements) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileBarChart2 className="h-4 w-4 text-indigo-500" />
                {!isApprover ? "Category Outlay" : "Pending Category Outlay"}
              </h3>
              <span className="text-[10px] text-slate-500 font-medium">Auto-updated</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {!isApprover 
                ? "Distribution of your logged expenses across various spend categories."
                : "Spend distribution across categories of claims pending your approval."}
            </p>
          </div>

          <div className="h-40 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, 'Amount']} 
                  contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#1e293b' : index === 1 ? '#4f46e5' : index === 2 ? '#ec4899' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Approver Information Widget (Only visible when logged in as desk approvers) */}
      {isApprover && (
        <div className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden shadow-lg shadow-slate-200">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="text-amber-400 mt-0.5 animate-pulse">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  Smart Insights Desk
                </p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  You are auditing claims as <span className="font-bold text-white text-indigo-300">{currentUser.roleLabel}</span>. Items requiring your direct action are highlighted in soft purple and pinned to the top.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
              <div className="bg-white/10 backdrop-blur-md text-white border border-white/10 px-3.5 py-2 rounded-xl flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
                <span>Pending Queue: {claims.filter(c => c.current_approver_role === currentUser.role).length} claims</span>
              </div>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-600 rounded-full opacity-25 filter blur-md"></div>
        </div>
      )}

      {/* 4. Controls: Tabs, Quick Select & Filters Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
        {/* Tab Filters */}
        <div className="flex items-center overflow-x-auto border-b border-slate-200 gap-1 pb-px scrollbar-thin">
          <button
            onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
            className={`whitespace-nowrap px-3.5 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'all'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Claims <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === 'all' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'}`}>{tabCounts.all}</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('settled'); setCurrentPage(1); }}
            className={`whitespace-nowrap px-3.5 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'settled'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Settled <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === 'settled' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{tabCounts.settled}</span>
          </button>

          <button
            onClick={() => { setActiveTab('corrections'); setCurrentPage(1); }}
            className={`whitespace-nowrap px-3.5 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'corrections'
                ? 'border-amber-500 text-amber-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Corrections <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === 'corrections' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{tabCounts.corrections}</span>
          </button>

          <button
            onClick={() => { setActiveTab('rejected'); setCurrentPage(1); }}
            className={`whitespace-nowrap px-3.5 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'rejected'
                ? 'border-rose-600 text-rose-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Rejected <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'}`}>{tabCounts.rejected}</span>
          </button>
        </div>

        {/* Quick Search Controls */}
        <div className="flex items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs focus:border-slate-500 focus:outline-none"
            id="category-quick-select"
          >
            <option value="all">All Categories</option>
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>

          {/* Toggle Expandable Advanced Filters Drawer */}
          <button
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
              isFilterDrawerOpen || searchQuery || fromDate || toDate || statusFilter !== 'all'
                ? 'bg-slate-900 border-slate-900 text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            id="filter-drawer-toggle"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* 5. Expandable Filters Drawer */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Query search */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Search className="h-3 w-3" /> Search Text
                </label>
                <input
                  type="text"
                  placeholder="ID, Title, Submitter..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none"
                  id="search-query-input"
                />
              </div>

              {/* Submitted From */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Submitted From
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-slate-500 focus:outline-none"
                  id="from-date-input"
                />
              </div>

              {/* Submitted To */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Submitted To
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-slate-500 focus:outline-none"
                  id="to-date-input"
                />
              </div>

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Filter className="h-3 w-3" /> Filter Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 bg-white focus:border-slate-500 focus:outline-none"
                  id="status-select-filter"
                >
                  <option value="all">All Statuses</option>
                  <option value="awaiting_manager">Awaiting Manager Review</option>
                  <option value="pending">Pending Audit</option>
                  <option value="correction_required">Correction Required</option>
                  <option value="hr_approved">HR Approved</option>
                  <option value="settled">Settled & Paid</option>
                  <option value="rejected_by_manager">Rejected by Manager</option>
                  <option value="rejected_by_finance">Rejected by Finance</option>
                  <option value="rejected_by_hr">Rejected by HR</option>
                  <option value="rejected_by_accounts">Rejected by Accounts</option>
                </select>
              </div>

            </div>

            <div className="flex justify-end gap-2.5 mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={handleResetFilters}
                className="rounded-xl border border-slate-200 hover:bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
                id="reset-filters-btn"
              >
                <RefreshCw className="h-3 w-3" /> Reset Filters
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-100 transition-colors cursor-pointer"
                id="apply-filters-btn"
              >
                Close Drawer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Main Claims List Table Grid */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3.5">Expense ID</th>
                {isApprover && <th className="px-5 py-3.5">Employee</th>}
                <th className="px-5 py-3.5">Expense Category</th>
                <th className="px-5 py-3.5">Date(s) of Expense</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
                <th className="px-5 py-3.5">Submitted</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {paginatedClaims.length === 0 ? (
                <tr>
                  <td colSpan={isApprover ? 8 : 7} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <SlidersHorizontal className="h-10 w-10 text-slate-300 stroke-[1.5] mb-2" />
                      <p className="font-semibold text-sm text-slate-900">No matching claims found</p>
                      <p className="text-xs text-slate-500 mt-0.5">Try widening your search queries or resetting search filters.</p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedClaims.map((claim) => {
                  const totalClaimAmount = claim.items.reduce((sum, i) => sum + i.amount, 0);
                  
                  // Interactive review triggers
                  const isAwaitingActiveUser = currentUser.role !== 'employee' && claim.current_approver_role === currentUser.role;

                  return (
                    <tr
                      key={claim.id}
                      className={`group hover:bg-slate-50/50 transition-colors cursor-pointer ${
                        isAwaitingActiveUser ? 'bg-indigo-50/20' : ''
                      }`}
                      onClick={() => onSelectClaim(claim.id)}
                    >
                      {/* ID */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors underline decoration-slate-200 underline-offset-2">
                          {claim.expense_number}
                        </span>
                      </td>

                      {/* Employee (Only Approver View) */}
                      {isApprover && (
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900">{claim.employee.name}</span>
                            <span className="text-[10px] text-slate-500">{claim.employee.department}</span>
                          </div>
                        </td>
                      )}

                      {/* Category */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-800">{claim.category.label}</span>
                          <span className="text-[10px] text-slate-500">{claim.city}</span>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-xs font-medium text-slate-600">
                          {claim.category.type === 'trip_expense' 
                            ? `${formatDate(claim.from_date)} – ${formatDate(claim.to_date)}`
                            : formatDate(claim.transaction_date)
                          }
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 whitespace-nowrap text-right font-bold text-xs text-slate-900">
                        {formatINR(totalClaimAmount)}
                      </td>

                      {/* Submitted At */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                        {formatDate(claim.submitted_at)}
                      </td>

                      {/* Status badge / interactive approvals trigger */}
                      <td className="px-5 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {isAwaitingActiveUser ? (
                          <button
                            onClick={() => onReviewClaim(claim.id)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 px-3 py-1 text-xs font-bold text-white transition-all shadow-xs active:scale-95 cursor-pointer"
                          >
                            <span>Awaiting Your Approval</span>
                            <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
                          </button>
                        ) : (
                          getStatusBadge(claim.status)
                        )}
                      </td>

                      {/* Row Dot Actions (Employee only, or custom edit links) */}
                      <td className="px-5 py-4 whitespace-nowrap text-right text-xs" onClick={(e) => e.stopPropagation()}>
                        {!isApprover ? (
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === claim.id ? null : claim.id)}
                              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            <AnimatePresence>
                              {activeMenuId === claim.id && (
                                <>
                                  <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute right-0 mt-1 z-50 w-36 origin-top-right rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
                                  >
                                    {/* Edit check */}
                                    {(() => {
                                      const isOwner = claim.employee.id === currentUser.id;
                                      const wasManagerApproved = claim.logs?.some(log => log.actor_role === 'manager' && log.action === 'approved');
                                      const isManagerApprovedByStatus = !['awaiting_manager', 'rejected_by_manager', 'correction_required'].includes(claim.status);
                                      const canEdit = isOwner && !(wasManagerApproved && claim.status !== 'correction_required') && !isManagerApprovedByStatus;
                                      
                                      return canEdit ? (
                                        <button
                                          onClick={() => {
                                            onEditClaim(claim.id);
                                            setActiveMenuId(null);
                                          }}
                                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                        >
                                          <Pencil className="h-3.5 w-3.5 text-slate-500" />
                                          Edit Request
                                        </button>
                                      ) : (
                                        <span className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-350 cursor-not-allowed" title="This claim is locked and cannot be edited.">
                                          <Pencil className="h-3.5 w-3.5 text-slate-300" />
                                          Locked
                                        </span>
                                      );
                                    })()}

                                    {/* Delete check */}
                                    {(() => {
                                      const isOwner = claim.employee.id === currentUser.id;
                                      const wasManagerApproved = claim.logs?.some(log => log.actor_role === 'manager' && log.action === 'approved');
                                      const isManagerApprovedByStatusForDelete = !['awaiting_manager', 'rejected_by_manager'].includes(claim.status);
                                      const canDelete = isOwner && !wasManagerApproved && !isManagerApprovedByStatusForDelete;

                                      return canDelete ? (
                                        <button
                                          onClick={() => {
                                            if (confirm('Are you sure you want to delete this claim? This action cannot be undone.')) {
                                              onDeleteClaim(claim.id);
                                            }
                                            setActiveMenuId(null);
                                          }}
                                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                                        >
                                          <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                          Delete Request
                                        </button>
                                      ) : (
                                        <span className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-350 cursor-not-allowed" title="Claims cannot be deleted once approved by a manager.">
                                          <Trash2 className="h-3.5 w-3.5 text-slate-300" />
                                          Cannot Delete
                                        </span>
                                      );
                                    })()}
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <button
                            onClick={() => onSelectClaim(claim.id)}
                            className="rounded-lg border border-slate-200 hover:bg-slate-50 px-2.5 py-1 text-slate-600 font-semibold hover:text-slate-900 transition-all text-[11px] cursor-pointer"
                          >
                            View details
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 7. Pagination Footer */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 bg-slate-50/50 px-5 py-3.5">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> –{' '}
            <span className="font-bold text-slate-800">{Math.min(currentPage * pageSize, totalRows)}</span> of{' '}
            <span className="font-bold text-slate-800">{totalRows}</span> expenses
          </div>

          <div className="flex items-center gap-4">
            {/* Rows Per Page dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-2xs focus:border-slate-500 focus:outline-none"
              >
                <option value={10}>10 rows</option>
                <option value={15}>15 rows</option>
                <option value={25}>25 rows</option>
                <option value={50}>50 rows</option>
              </select>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                First
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              <span className="text-xs font-bold text-slate-700 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
