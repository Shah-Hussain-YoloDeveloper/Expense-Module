/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'finance_desk' | 'human_resources_desk' | 'accounts_desk';
  roleLabel: string;
  department: string;
}

export interface UserRef {
  id: number;
  name: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
}

export interface ExpenseCategory {
  id: number;
  label: string;
  type: 'trip_expense' | 'other_expense';
}

export interface ExpenseType {
  id: number;
  label: string;
}

export interface Attachment {
  name: string;
  size: number;
  url: string;
  mime_type: string;
}

export interface ExpenseItem {
  id: number;
  item_date: string;
  expense_type: ExpenseType;
  title: string;
  amount: number;
  description: string;
  attachments: Attachment[];
  // Statuses for individual desks
  desk_manager_status: 'approved' | 'rejected' | 'correction_required' | null;
  desk_manager_remarks: string | null;
  desk_finance_status: 'approved' | 'rejected' | 'correction_required' | null;
  desk_finance_remarks: string | null;
  desk_hr_status: 'approved' | 'rejected' | 'correction_required' | null;
  desk_hr_remarks: string | null;
  desk_accounts_status: 'settled' | 'rejected' | null;
  desk_accounts_remarks: string | null;
}

export interface AuditLog {
  id: number;
  acted_at: string;
  action: 'submitted' | 'approved' | 'correction' | 'settle' | 'rejected';
  to_status: string;
  actor: {
    id: number;
    name: string;
  };
  actor_role: 'employee' | 'manager' | 'finance_desk' | 'human_resources_desk' | 'accounts_desk';
  remarks: string;
  payment_ref?: string | null;
}

export interface ExpenseClaim {
  id: number;
  expense_number: string;
  title: string;
  category: ExpenseCategory;
  city: string;
  from_date: string | null;
  to_date: string | null;
  transaction_date: string | null;
  status: 
    | 'awaiting_manager' 
    | 'pending' 
    | 'correction_required' 
    | 'rejected_by_manager' 
    | 'hr_approved' 
    | 'rejected_by_hr' 
    | 'rejected_by_finance' 
    | 'settled' 
    | 'rejected_by_accounts';
  status_label: string;
  current_approver_role: 'manager' | 'finance_desk' | 'human_resources_desk' | 'accounts_desk' | 'employee' | null;
  employee: Employee;
  assigned_manager_approver: UserRef | null;
  assigned_finance_desk_approver: UserRef | null;
  assigned_hr_approver: UserRef | null;
  assigned_finance_approver: UserRef | null; // Note: labeled "assigned_finance_approver" in JSON but maps to accounts desk
  submitted_at: string;
  items: ExpenseItem[];
  logs: AuditLog[];
}
