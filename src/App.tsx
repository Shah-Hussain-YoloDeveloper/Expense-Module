/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { getClaims, saveClaims, getCurrentUser, setCurrentUser, MOCK_USERS } from './data';
import { ExpenseClaim, UserProfile, AuditLog, ExpenseItem } from './types';
import HeaderSessionSwitcher from './components/HeaderSessionSwitcher';
import ExpensePolicyModal from './components/ExpensePolicyModal';
import ExpensesListPage from './components/ExpensesListPage';
import ExpenseClaimForm from './components/ExpenseClaimForm';
import ExpenseDetailPage from './components/ExpenseDetailPage';
import ExpenseReviewPage from './components/ExpenseReviewPage';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle, Info } from 'lucide-react';

export default function App() {
  // Session states
  const [currentUser, setSessionUser] = useState<UserProfile>(getCurrentUser());
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  
  // Navigation states
  const [page, setPage] = useState<'list' | 'detail' | 'create' | 'edit' | 'review'>('list');
  const [selectedClaimId, setSelectedClaimId] = useState<number | null>(null);

  // Policy modal overlay state
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);

  // Success toast/alert feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load claims on mount
  useEffect(() => {
    setClaims(getClaims());
  }, []);

  // Set page hash for lightweight clean browser routing fallback
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page, selectedClaimId]);

  // Handle Switch Session
  const handleUserChange = (user: UserProfile) => {
    setCurrentUser(user);
    setSessionUser(user);
    setPage('list');
    setSelectedClaimId(null);
    triggerToast(`Switched workspace session to: ${user.name}`);
  };

  // Toast feedback trigger helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Nav actions
  const handleSelectClaim = (id: number) => {
    setSelectedClaimId(id);
    setPage('detail');
  };

  const handleEditClaim = (id: number) => {
    setSelectedClaimId(id);
    setPage('edit');
  };

  const handleReviewClaim = (id: number) => {
    setSelectedClaimId(id);
    setPage('review');
  };

  const handleNewClaim = () => {
    setSelectedClaimId(null);
    setPage('create');
  };

  const handleDeleteClaim = (id: number) => {
    const updated = claims.filter(c => c.id !== id);
    saveClaims(updated);
    setClaims(updated);
    triggerToast("Expense claim deleted successfully.");
    setPage('list');
  };

  // Create or Update Claim Form submissions
  const handleCreateOrUpdateClaimSubmit = (formData: Partial<ExpenseClaim>) => {
    let updatedClaims = [...claims];
    const timestamp = new Date().toISOString();

    if (page === 'create') {
      // 1. CREATE MODE
      const newId = Date.now();
      const uniqueNum = `EXP-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
      
      const newClaim: ExpenseClaim = {
        id: newId,
        expense_number: uniqueNum,
        title: formData.title || 'Untitled Claim',
        category: formData.category!,
        city: formData.city || 'Online',
        from_date: formData.from_date || null,
        to_date: formData.to_date || null,
        transaction_date: formData.transaction_date || null,
        status: 'awaiting_manager',
        status_label: 'Awaiting Manager Review',
        current_approver_role: 'manager',
        employee: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          department: currentUser.department
        },
        // Setup initial workspace approval paths
        assigned_manager_approver: { id: 20, name: 'Sarah Connor' },
        assigned_finance_desk_approver: { id: 30, name: 'Raj Mehta' },
        assigned_hr_approver: { id: 40, name: 'Priya Sen' },
        assigned_finance_approver: { id: 50, name: 'Dev Singh' }, // Accounts Desk
        submitted_at: timestamp,
        items: (formData.items || []).map((it, idx) => ({
          ...it,
          id: Date.now() + idx + Math.random()
        })),
        logs: [
          {
            id: Date.now() + 1,
            acted_at: timestamp,
            action: 'submitted',
            to_status: 'awaiting_manager',
            actor: { id: currentUser.id, name: currentUser.name },
            actor_role: 'employee',
            remarks: 'Submitted claim for initial desk approval.'
          }
        ]
      };

      updatedClaims.push(newClaim);
      triggerToast(`Claim ${newClaim.expense_number} filed successfully!`);

    } else if (page === 'edit' && selectedClaimId) {
      // 2. EDIT MODE (For adjustments or corrections)
      updatedClaims = claims.map(c => {
        if (c.id === selectedClaimId) {
          // Check if previous status was Correction Required
          const wasCorrection = c.status === 'correction_required';
          const nextStatus = wasCorrection ? 'awaiting_manager' : c.status;
          const nextLabel = wasCorrection ? 'Awaiting Manager Review' : c.status_label;
          const nextRole = wasCorrection ? 'manager' : c.current_approver_role;

          // Append audit logs explaining the correction adjustments
          const editLog: AuditLog = {
            id: Date.now() + 1,
            acted_at: timestamp,
            action: 'submitted',
            to_status: nextStatus,
            actor: { id: currentUser.id, name: currentUser.name },
            actor_role: 'employee',
            remarks: wasCorrection 
              ? 'Corrected items and resubmitted for manager re-approval.' 
              : 'Modified claim details.'
          };

          // Retain individual line items previous decisions except for those under correction_required
          const mergedItems = (formData.items || []).map(newItem => {
            const existing = c.items.find(old => old.title === newItem.title && old.amount === newItem.amount);
            if (existing) {
              return {
                ...newItem,
                desk_manager_status: existing.desk_manager_status,
                desk_manager_remarks: existing.desk_manager_remarks,
                desk_finance_status: existing.desk_finance_status === 'correction_required' ? null : existing.desk_finance_status, // clear correction marker on edit
                desk_finance_remarks: existing.desk_finance_remarks,
                desk_hr_status: existing.desk_hr_status,
                desk_hr_remarks: existing.desk_hr_remarks,
                desk_accounts_status: existing.desk_accounts_status,
                desk_accounts_remarks: existing.desk_accounts_remarks
              };
            }
            return newItem;
          });

          return {
            ...c,
            title: formData.title || c.title,
            category: formData.category || c.category,
            city: formData.city || c.city,
            from_date: formData.from_date || null,
            to_date: formData.to_date || null,
            transaction_date: formData.transaction_date || null,
            items: mergedItems,
            status: nextStatus as any,
            status_label: nextLabel,
            current_approver_role: nextRole as any,
            logs: [...c.logs, editLog]
          };
        }
        return c;
      });

      triggerToast("Claim details adjusted and resubmitted successfully.");
    }

    saveClaims(updatedClaims);
    setClaims(updatedClaims);
    setPage('list');
    setSelectedClaimId(null);
  };

  // Approver Action Submissions (Transition State Machine)
  const handleReviewDecisionSubmit = (payload: {
    overallStatus: 'approved' | 'rejected' | 'correction_required' | 'settled';
    remarks: string;
    paymentRef?: string;
    lineDecisions: Array<{ id: number; status: string; remarks: string }>;
  }) => {
    if (!selectedClaimId) return;
    const timestamp = new Date().toISOString();

    const updatedClaims = claims.map(c => {
      if (c.id === selectedClaimId) {
        
        // 1. Update lines decisions inside items
        const updatedItems = c.items.map(item => {
          const matchingChoice = payload.lineDecisions.find(choice => choice.id === item.id);
          if (!matchingChoice) return item;

          // Align status based on role
          const role = currentUser.role;
          let mgrStatus = item.desk_manager_status;
          let mgrRemarks = item.desk_manager_remarks;
          let finStatus = item.desk_finance_status;
          let finRemarks = item.desk_finance_remarks;
          let hrStatus = item.desk_hr_status;
          let hrRemarks = item.desk_hr_remarks;
          let accStatus = item.desk_accounts_status;
          let accRemarks = item.desk_accounts_remarks;

          if (role === 'manager') {
            mgrStatus = matchingChoice.status as any;
            mgrRemarks = matchingChoice.remarks;
          } else if (role === 'finance_desk') {
            finStatus = matchingChoice.status as any;
            finRemarks = matchingChoice.remarks;
          } else if (role === 'human_resources_desk') {
            hrStatus = matchingChoice.status as any;
            hrRemarks = matchingChoice.remarks;
          } else if (role === 'accounts_desk') {
            accStatus = matchingChoice.status as any;
            accRemarks = matchingChoice.remarks;
          }

          return {
            ...item,
            desk_manager_status: mgrStatus,
            desk_manager_remarks: mgrRemarks,
            desk_finance_status: finStatus,
            desk_finance_remarks: finRemarks,
            desk_hr_status: hrStatus,
            desk_hr_remarks: hrRemarks,
            desk_accounts_status: accStatus,
            desk_accounts_remarks: accRemarks
          };
        });

        // 2. Establish next status, status labels and roles
        let nextStatus: ExpenseClaim['status'] = c.status;
        let nextLabel = c.status_label;
        let nextApproverRole: ExpenseClaim['current_approver_role'] = c.current_approver_role;

        const role = currentUser.role;
        const choice = payload.overallStatus;

        if (role === 'manager') {
          if (choice === 'approved') {
            nextStatus = 'pending';
            nextLabel = 'Awaiting Finance Review';
            nextApproverRole = 'finance_desk';
          } else {
            nextStatus = 'rejected_by_manager';
            nextLabel = 'Rejected by Manager';
            nextApproverRole = null;
          }
        } else if (role === 'finance_desk') {
          if (choice === 'correction_required') {
            nextStatus = 'correction_required';
            nextLabel = 'Correction Required';
            nextApproverRole = 'employee';
          } else if (choice === 'approved') {
            nextStatus = 'hr_approved'; // Map next step: HR Partner
            nextLabel = 'Awaiting HR Partner Review';
            nextApproverRole = 'human_resources_desk';
          } else {
            nextStatus = 'rejected_by_finance';
            nextLabel = 'Rejected by Finance';
            nextApproverRole = null;
          }
        } else if (role === 'human_resources_desk') {
          if (choice === 'correction_required') {
            nextStatus = 'correction_required';
            nextLabel = 'Correction Required';
            nextApproverRole = 'employee';
          } else if (choice === 'approved') {
            // Send to accounts desk for settling
            nextStatus = 'hr_approved'; // retain hr approved state
            nextLabel = 'Awaiting Accounts Settlement';
            nextApproverRole = 'accounts_desk';
          } else {
            nextStatus = 'rejected_by_hr';
            nextLabel = 'Rejected by HR';
            nextApproverRole = null;
          }
        } else if (role === 'accounts_desk') {
          if (choice === 'settled') {
            nextStatus = 'settled';
            nextLabel = 'Settled & Paid';
            nextApproverRole = null;
          } else {
            nextStatus = 'rejected_by_accounts';
            nextLabel = 'Rejected by Accounts';
            nextApproverRole = null;
          }
        }

        // 3. Setup audit log event
        const logAction: AuditLog['action'] = 
          choice === 'settled' 
            ? 'settle' 
            : choice === 'correction_required' 
            ? 'correction' 
            : choice === 'approved' 
            ? 'approved' 
            : 'rejected';

        const auditEvent: AuditLog = {
          id: Date.now(),
          acted_at: timestamp,
          action: logAction,
          to_status: nextStatus,
          actor: { id: currentUser.id, name: currentUser.name },
          actor_role: currentUser.role,
          remarks: payload.remarks,
          payment_ref: payload.paymentRef || null
        };

        return {
          ...c,
          items: updatedItems,
          status: nextStatus,
          status_label: nextLabel,
          current_approver_role: nextApproverRole,
          logs: [...c.logs, auditEvent]
        };
      }
      return c;
    });

    saveClaims(updatedClaims);
    setClaims(updatedClaims);
    triggerToast(`Logged review action on claim ${claims.find(c => c.id === selectedClaimId)?.expense_number}`);
    setPage('list');
    setSelectedClaimId(null);
  };

  const selectedClaim = claims.find(c => c.id === selectedClaimId);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col antialiased">
      
      {/* Stickied Header & Identity Switcher */}
      <HeaderSessionSwitcher
        currentUser={currentUser}
        onUserChange={handleUserChange}
        onViewPolicy={() => setIsPolicyOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Success Toasts Feed */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.95 }}
              className="fixed bottom-6 right-6 z-150 rounded-2xl bg-slate-900 border border-slate-800 text-white p-4 shadow-2xl flex items-center gap-3 max-w-sm"
              id="global-toast-feedback"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white">
                <CheckCircle className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100 leading-4">System Notice</p>
                <p className="text-[11px] text-slate-350 leading-3 mt-0.5">{toastMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic page routers based on clean conditional component selections */}
        <div className="relative">
          {page === 'list' && (
            <ExpensesListPage
              claims={claims}
              currentUser={currentUser}
              onSelectClaim={handleSelectClaim}
              onReviewClaim={handleReviewClaim}
              onNewClaim={handleNewClaim}
              onEditClaim={handleEditClaim}
              onDeleteClaim={handleDeleteClaim}
              onViewPolicy={() => setIsPolicyOpen(true)}
            />
          )}

          {page === 'create' && (
            <ExpenseClaimForm
              currentUser={currentUser}
              onCancel={() => setPage('list')}
              onSubmit={handleCreateOrUpdateClaimSubmit}
            />
          )}

          {page === 'edit' && selectedClaim && (
            <ExpenseClaimForm
              currentUser={currentUser}
              claimToEdit={selectedClaim}
              onCancel={() => setPage('list')}
              onSubmit={handleCreateOrUpdateClaimSubmit}
            />
          )}

          {page === 'detail' && selectedClaim && (
            <ExpenseDetailPage
              claim={selectedClaim}
              currentUser={currentUser}
              onBack={() => setPage('list')}
              onEdit={handleEditClaim}
              onDelete={handleDeleteClaim}
              onReview={handleReviewClaim}
            />
          )}

          {page === 'review' && selectedClaim && (
            <ExpenseReviewPage
              claim={selectedClaim}
              currentUser={currentUser}
              onCancel={() => setPage('list')}
              onSubmitDecision={handleReviewDecisionSubmit}
            />
          )}
        </div>

      </main>

      {/* Corporate Policies Info Modal */}
      <ExpensePolicyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
      />

      {/* Footer copyright */}
      <footer className="border-t border-slate-200 bg-white/60 py-6 mt-12 text-center text-xs text-slate-400 font-medium">
        <p>© 2026 Yolocorp Inc. All Rights Reserved. • Powered by Expense Desk Engine Node</p>
      </footer>

    </div>
  );
}
