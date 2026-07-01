/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExpenseClaim, UserProfile, ExpenseCategory, ExpenseType } from './types';

// Predefined mock users for the Top Identity Switcher
export const MOCK_USERS: UserProfile[] = [
  {
    id: 10,
    name: 'Arjun Sharma',
    email: 'arjun.sharma@yolocorp.com',
    role: 'employee',
    roleLabel: 'Employee (Engineering)',
    department: 'Engineering'
  },
  {
    id: 20,
    name: 'Sarah Connor',
    email: 'sarah.connor@yolocorp.com',
    role: 'manager',
    roleLabel: 'Reporting Manager',
    department: 'Engineering'
  },
  {
    id: 30,
    name: 'Raj Mehta',
    email: 'raj.mehta@yolocorp.com',
    role: 'finance_desk',
    roleLabel: 'Finance Representative',
    department: 'Finance'
  },
  {
    id: 40,
    name: 'Priya Sen',
    email: 'priya.sen@yolocorp.com',
    role: 'human_resources_desk',
    roleLabel: 'HR Representative',
    department: 'Human Resources'
  },
  {
    id: 50,
    name: 'Dev Singh',
    email: 'dev.singh@yolocorp.com',
    role: 'accounts_desk',
    roleLabel: 'Accountant (Accounts Desk)',
    department: 'Accounts'
  }
];

// Predefined expense categories
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 1, label: 'Business Travel & Lodging', type: 'trip_expense' },
  { id: 2, label: 'Telecommunication & Internet', type: 'other_expense' },
  { id: 3, label: 'Training & Certifications', type: 'other_expense' },
  { id: 4, label: 'Client Entertainment & Meals', type: 'other_expense' }
];

// Predefined line-item expense types
export const EXPENSE_TYPES: ExpenseType[] = [
  { id: 10, label: 'Flights & Transport' },
  { id: 11, label: 'Hotel & Accommodation' },
  { id: 12, label: 'Meals & Food' },
  { id: 13, label: 'Internet & Telephone' },
  { id: 14, label: 'Professional Certifications' },
  { id: 15, label: 'Software Licenses' },
  { id: 16, label: 'Office Supplies' }
];

// Preseeded data from EXPENSE_MOCK_DATA.json with matching exact schemas
const INITIAL_CLAIMS: ExpenseClaim[] = [
  {
    "id": 101,
    "expense_number": "EXP-2026-0001",
    "title": "Q2 Client Onboarding - Bangalore Trip",
    "category": {
      "id": 1,
      "label": "Business Travel & Lodging",
      "type": "trip_expense"
    },
    "city": "Bangalore",
    "from_date": "2026-06-10",
    "to_date": "2026-06-14",
    "transaction_date": null,
    "status": "pending",
    "status_label": "Awaiting Finance Review",
    "current_approver_role": "finance_desk",
    "employee": {
      "id": 10,
      "name": "Arjun Sharma",
      "email": "arjun.sharma@yolocorp.com",
      "department": "Engineering"
    },
    "assigned_manager_approver": { "id": 20, "name": "Sarah Connor" },
    "assigned_finance_desk_approver": { "id": 30, "name": "Raj Mehta" },
    "assigned_hr_approver": { "id": 40, "name": "Priya Sen" },
    "assigned_finance_approver": { "id": 50, "name": "Dev Singh" },
    "submitted_at": "2026-06-15T10:30:00Z",
    "items": [
      {
        "id": 201,
        "item_date": "2026-06-11",
        "expense_type": { "id": 10, "label": "Flights & Transport" },
        "title": "Indigo flight Delhi to Bangalore",
        "amount": 8500,
        "description": "Round trip ticket booked economy class",
        "attachments": [
          {
            "name": "flight_ticket.pdf",
            "size": 245000,
            "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "mime_type": "application/pdf"
          }
        ],
        "desk_manager_status": "approved",
        "desk_manager_remarks": "Within guidelines.",
        "desk_finance_status": null,
        "desk_finance_remarks": null,
        "desk_hr_status": null,
        "desk_hr_remarks": null,
        "desk_accounts_status": null,
        "desk_accounts_remarks": null
      },
      {
        "id": 202,
        "item_date": "2026-06-12",
        "expense_type": { "id": 11, "label": "Hotel & Accommodation" },
        "title": "Taj Bangalore Stay - 3 Nights",
        "amount": 18000,
        "description": "Hotel accommodation including breakfast",
        "attachments": [
          {
            "name": "hotel_invoice.png",
            "size": 1500000,
            "url": "https://dummyimage.com/600x400/ccc/000.png&text=Taj+Hotel+Invoice",
            "mime_type": "image/png"
          }
        ],
        "desk_manager_status": "approved",
        "desk_manager_remarks": "Approved stay.",
        "desk_finance_status": null,
        "desk_finance_remarks": null,
        "desk_hr_status": null,
        "desk_hr_remarks": null,
        "desk_accounts_status": null,
        "desk_accounts_remarks": null
      }
    ],
    "logs": [
      {
        "id": 501,
        "acted_at": "2026-06-15T10:30:00Z",
        "action": "submitted",
        "to_status": "awaiting_manager",
        "actor": { "id": 10, "name": "Arjun Sharma" },
        "actor_role": "employee",
        "remarks": "Submitted for approval."
      },
      {
        "id": 502,
        "acted_at": "2026-06-16T14:20:00Z",
        "action": "approved",
        "to_status": "pending",
        "actor": { "id": 20, "name": "Sarah Connor" },
        "actor_role": "manager",
        "remarks": "Reviewed trip expenses, matches onboarding itinerary. Sending to Finance desk."
      }
    ]
  },
  {
    "id": 102,
    "expense_number": "EXP-2026-0002",
    "title": "Annual Sales Summit - Hyderabad",
    "category": {
      "id": 1,
      "label": "Business Travel & Lodging",
      "type": "trip_expense"
    },
    "city": "Hyderabad",
    "from_date": "2026-05-12",
    "to_date": "2026-05-15",
    "transaction_date": null,
    "status": "pending", // Set as pending so HR can review it when logged in
    "status_label": "Awaiting HR Partner Review",
    "current_approver_role": "human_resources_desk",
    "employee": {
      "id": 20,
      "name": "Sarah Connor",
      "email": "sarah.connor@yolocorp.com",
      "department": "Engineering"
    },
    "assigned_manager_approver": { "id": 30, "name": "Raj Mehta" },
    "assigned_finance_desk_approver": { "id": 30, "name": "Raj Mehta" },
    "assigned_hr_approver": { "id": 40, "name": "Priya Sen" },
    "assigned_finance_approver": { "id": 50, "name": "Dev Singh" },
    "submitted_at": "2026-05-16T09:00:00Z",
    "items": [
      {
        "id": 203,
        "item_date": "2026-05-12",
        "expense_type": { "id": 10, "label": "Flights & Transport" },
        "title": "Delhi to Hyderabad Flights",
        "amount": 9200,
        "description": "Round trip ticket for annual summit",
        "attachments": [],
        "desk_manager_status": "approved",
        "desk_manager_remarks": "Sales travel pre-approved.",
        "desk_finance_status": "approved",
        "desk_finance_remarks": "Fare matches limits.",
        "desk_hr_status": null,
        "desk_hr_remarks": null,
        "desk_accounts_status": null,
        "desk_accounts_remarks": null
      },
      {
        "id": 204,
        "item_date": "2026-05-13",
        "expense_type": { "id": 12, "label": "Meals & Food" },
        "title": "Summit Dinner with Clients",
        "amount": 4200,
        "description": "Dinner at Sheraton for 3 delegates",
        "attachments": [
          {
            "name": "dinner_bill.png",
            "size": 890000,
            "url": "https://dummyimage.com/600x400/ccc/000.png&text=Sheraton+Receipt",
            "mime_type": "image/png"
          }
        ],
        "desk_manager_status": "approved",
        "desk_manager_remarks": "Client event.",
        "desk_finance_status": "approved",
        "desk_finance_remarks": "Audited with client list.",
        "desk_hr_status": null,
        "desk_hr_remarks": null,
        "desk_accounts_status": null,
        "desk_accounts_remarks": null
      }
    ],
    "logs": [
      {
        "id": 503,
        "acted_at": "2026-05-16T09:00:00Z",
        "action": "submitted",
        "to_status": "awaiting_manager",
        "actor": { "id": 20, "name": "Sarah Connor" },
        "actor_role": "employee",
        "remarks": "Filing annual summit expenses."
      },
      {
        "id": 504,
        "acted_at": "2026-05-17T11:00:00Z",
        "action": "approved",
        "to_status": "pending",
        "actor": { "id": 30, "name": "Raj Mehta" },
        "actor_role": "manager",
        "remarks": "Approved as manager."
      },
      {
        "id": 505,
        "acted_at": "2026-05-18T16:45:00Z",
        "action": "approved",
        "to_status": "hr_approved",
        "actor": { "id": 30, "name": "Raj Mehta" },
        "actor_role": "finance_desk",
        "remarks": "Line entries verified. Sending to HR desk for compliance checking."
      }
    ]
  },
  {
    "id": 103,
    "expense_number": "EXP-2026-0003",
    "title": "Internet & Mobile Bill - Q2 Reimbursement",
    "category": {
      "id": 2,
      "label": "Telecommunication & Internet",
      "type": "other_expense"
    },
    "city": "Delhi NCR",
    "from_date": null,
    "to_date": null,
    "transaction_date": "2026-06-01",
    "status": "correction_required",
    "status_label": "Correction Required",
    "current_approver_role": "employee",
    "employee": {
      "id": 10,
      "name": "Arjun Sharma",
      "email": "arjun.sharma@yolocorp.com",
      "department": "Engineering"
    },
    "assigned_manager_approver": { "id": 20, "name": "Sarah Connor" },
    "assigned_finance_desk_approver": { "id": 30, "name": "Raj Mehta" },
    "assigned_hr_approver": { "id": 40, "name": "Priya Sen" },
    "assigned_finance_approver": { "id": 50, "name": "Dev Singh" },
    "submitted_at": "2026-06-02T10:00:00Z",
    "items": [
      {
        "id": 205,
        "item_date": "2026-06-01",
        "expense_type": { "id": 13, "label": "Internet & Telephone" },
        "title": "Airtel Broadband Bill - May 2026",
        "amount": 1200,
        "description": "Work from home internet connection charges",
        "attachments": [],
        "desk_manager_status": "approved",
        "desk_manager_remarks": "Approved.",
        "desk_finance_status": "correction_required",
        "desk_finance_remarks": "Please upload the official PDF receipt of the Airtel bill. No document attached.",
        "desk_hr_status": null,
        "desk_hr_remarks": null,
        "desk_accounts_status": null,
        "desk_accounts_remarks": null
      },
      {
        "id": 206,
        "item_date": "2026-06-01",
        "expense_type": { "id": 13, "label": "Internet & Telephone" },
        "title": "Jio mobile postpaid connection - May 2026",
        "amount": 750,
        "description": "Mobile charges for client calls",
        "attachments": [
          {
            "name": "jio_may_receipt.pdf",
            "size": 182000,
            "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "mime_type": "application/pdf"
          }
        ],
        "desk_manager_status": "approved",
        "desk_manager_remarks": "Approved.",
        "desk_finance_status": "approved",
        "desk_finance_remarks": "Receipt matches amount.",
        "desk_hr_status": null,
        "desk_hr_remarks": null,
        "desk_accounts_status": null,
        "desk_accounts_remarks": null
      }
    ],
    "logs": [
      {
        "id": 506,
        "acted_at": "2026-06-02T10:00:00Z",
        "action": "submitted",
        "to_status": "awaiting_manager",
        "actor": { "id": 10, "name": "Arjun Sharma" },
        "actor_role": "employee",
        "remarks": "Internet reimbursement claim."
      },
      {
        "id": 507,
        "acted_at": "2026-06-03T09:15:00Z",
        "action": "approved",
        "to_status": "pending",
        "actor": { "id": 20, "name": "Sarah Connor" },
        "actor_role": "manager",
        "remarks": "Internet limits look good."
      },
      {
        "id": 508,
        "acted_at": "2026-06-04T12:00:00Z",
        "action": "correction",
        "to_status": "correction_required",
        "actor": { "id": 30, "name": "Raj Mehta" },
        "actor_role": "finance_desk",
        "remarks": "Item 1 has no attachment. WFH claims require official bill. Sent back for correction."
      }
    ]
  },
  {
    "id": 104,
    "expense_number": "EXP-2026-0004",
    "title": "AWS Cloud Practitioner Certification",
    "category": {
      "id": 3,
      "label": "Training & Certifications",
      "type": "other_expense"
    },
    "city": "Online",
    "from_date": null,
    "to_date": null,
    "transaction_date": "2026-05-10",
    "status": "settled",
    "status_label": "Settled & Paid",
    "current_approver_role": null,
    "employee": {
      "id": 10,
      "name": "Arjun Sharma",
      "email": "arjun.sharma@yolocorp.com",
      "department": "Engineering"
    },
    "assigned_manager_approver": { "id": 20, "name": "Sarah Connor" },
    "assigned_finance_desk_approver": { "id": 30, "name": "Raj Mehta" },
    "assigned_hr_approver": { "id": 40, "name": "Priya Sen" },
    "assigned_finance_approver": { "id": 50, "name": "Dev Singh" },
    "submitted_at": "2026-05-10T14:00:00Z",
    "items": [
      {
        "id": 207,
        "item_date": "2026-05-10",
        "expense_type": { "id": 14, "label": "Professional Certifications" },
        "title": "AWS Cloud Practitioner Exam Fee",
        "amount": 9500,
        "description": "AWS exam fee reimbursement as approved by HOD",
        "attachments": [
          {
            "name": "aws_payment_receipt.pdf",
            "size": 312000,
            "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "mime_type": "application/pdf"
          },
          {
            "name": "aws_certificate.pdf",
            "size": 420000,
            "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "mime_type": "application/pdf"
          }
        ],
        "desk_manager_status": "approved",
        "desk_manager_remarks": "Exam passed. Congrats!",
        "desk_finance_status": "approved",
        "desk_finance_remarks": "Approved certification reimbursement.",
        "desk_hr_status": "approved",
        "desk_hr_remarks": "Verified and passed.",
        "desk_accounts_status": "settled",
        "desk_accounts_remarks": "Paid via NEFT transfer."
      }
    ],
    "logs": [
      {
        "id": 509,
        "acted_at": "2026-05-10T14:00:00Z",
        "action": "submitted",
        "to_status": "awaiting_manager",
        "actor": { "id": 10, "name": "Arjun Sharma" },
        "actor_role": "employee",
        "remarks": "Filing exam fee reimbursement request."
      },
      {
        "id": 510,
        "acted_at": "2026-05-11T10:00:00Z",
        "action": "approved",
        "to_status": "pending",
        "actor": { "id": 20, "name": "Sarah Connor" },
        "actor_role": "manager",
        "remarks": "Pre-approved training."
      },
      {
        "id": 511,
        "acted_at": "2026-05-12T15:20:00Z",
        "action": "approved",
        "to_status": "hr_approved",
        "actor": { "id": 30, "name": "Raj Mehta" },
        "actor_role": "finance_desk",
        "remarks": "Approved reimbursement."
      },
      {
        "id": 512,
        "acted_at": "2026-05-13T11:40:00Z",
        "action": "approved",
        "to_status": "hr_approved",
        "actor": { "id": 40, "name": "Priya Sen" },
        "actor_role": "human_resources_desk",
        "remarks": "Sending to accounts for payout."
      },
      {
        "id": 513,
        "acted_at": "2026-05-14T10:15:00Z",
        "action": "settle",
        "to_status": "settled",
        "actor": { "id": 50, "name": "Dev Singh" },
        "actor_role": "accounts_desk",
        "remarks": "Processed payment via NEFT.",
        "payment_ref": "TXN-2026-NEFT-908123"
      }
    ]
  },
  {
    "id": 105,
    "expense_number": "EXP-2026-0005",
    "title": "Client Dinner - Marriott Delhi",
    "category": {
      "id": 4,
      "label": "Client Entertainment & Meals",
      "type": "other_expense"
    },
    "city": "New Delhi",
    "from_date": null,
    "to_date": null,
    "transaction_date": "2026-06-25",
    "status": "awaiting_manager",
    "status_label": "Awaiting Manager Review",
    "current_approver_role": "manager",
    "employee": {
      "id": 20,
      "name": "Sarah Connor",
      "email": "sarah.connor@yolocorp.com",
      "department": "Engineering" // Adjusted to match engineering
    },
    "assigned_manager_approver": { "id": 30, "name": "Raj Mehta" }, // Since SarahConnor submitted, her manager is Raj Mehta
    "assigned_finance_desk_approver": { "id": 30, "name": "Raj Mehta" },
    "assigned_hr_approver": { "id": 40, "name": "Priya Sen" },
    "assigned_finance_approver": { "id": 50, "name": "Dev Singh" },
    "submitted_at": "2026-06-26T17:30:00Z",
    "items": [
      {
        "id": 208,
        "item_date": "2026-06-25",
        "expense_type": { "id": 12, "label": "Meals & Food" },
        "title": "Marriott business dinner with ACME team",
        "amount": 7800,
        "description": "Hosted 4 members from ACME corp during contract discussions",
        "attachments": [
          {
            "name": "marriott_bill.jpg",
            "size": 512000,
            "url": "https://dummyimage.com/600x400/ccc/000.png&text=Marriott+Receipt",
            "mime_type": "image/jpeg"
          }
        ],
        "desk_manager_status": null,
        "desk_manager_remarks": null,
        "desk_finance_status": null,
        "desk_finance_remarks": null,
        "desk_hr_status": null,
        "desk_hr_remarks": null,
        "desk_accounts_status": null,
        "desk_accounts_remarks": null
      }
    ],
    "logs": [
      {
        "id": 514,
        "acted_at": "2026-06-26T17:30:00Z",
        "action": "submitted",
        "to_status": "awaiting_manager",
        "actor": { "id": 20, "name": "Sarah Connor" },
        "actor_role": "employee",
        "remarks": "ACME closing dinner."
      }
    ]
  }
];

// Load claims from LocalStorage
export function getClaims(): ExpenseClaim[] {
  if (typeof window === 'undefined') return INITIAL_CLAIMS;
  const data = localStorage.getItem('EXPENSE_CLAIMS');
  if (!data) {
    localStorage.setItem('EXPENSE_CLAIMS', JSON.stringify(INITIAL_CLAIMS));
    return INITIAL_CLAIMS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_CLAIMS;
  }
}

// Save claims to LocalStorage
export function saveClaims(claims: ExpenseClaim[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('EXPENSE_CLAIMS', JSON.stringify(claims));
  }
}

// Load current active user from LocalStorage
export function getCurrentUser(): UserProfile {
  if (typeof window === 'undefined') return MOCK_USERS[0];
  const data = localStorage.getItem('CURRENT_EXPENSE_USER');
  if (!data) {
    localStorage.setItem('CURRENT_EXPENSE_USER', JSON.stringify(MOCK_USERS[0]));
    return MOCK_USERS[0];
  }
  try {
    const user = JSON.parse(data);
    // Ensure the loaded user is one of the valid ones
    const found = MOCK_USERS.find(u => u.id === user.id);
    return found || MOCK_USERS[0];
  } catch (e) {
    return MOCK_USERS[0];
  }
}

// Save current active user to LocalStorage
export function setCurrentUser(user: UserProfile): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('CURRENT_EXPENSE_USER', JSON.stringify(user));
  }
}

// Policy Document Content for "View Expense Policy" Modal/Panel
export const EXPENSE_POLICY_MARKDOWN = `
# Yolocorp Corporate Expense & Travel Policy
*Last updated: January 2026*

Welcome to the official company expense policy. These guidelines are designed to ensure transparency, policy compliance, and swift payouts.

## 1. General Guidelines
* **Pre-approval:** All business trips require manager pre-approval.
* **Itemized Receipts:** All line-item claims exceeding ₹500 must have an itemized PDF/image receipt attached.
* **Submission Window:** Expenses must be filed within **30 days** of occurrence. Normal employees can only submit items for the **current calendar month**.

## 2. Limits and Caps by Category
* **Flights & Transport:** Economy class only. No business class without VP authorization.
* **Hotel Stay:**
  * Metro Cities (Delhi NCR, Mumbai, Bangalore): Cap of **₹6,000 per night**.
  * Other Cities: Cap of **₹4,500 per night**.
* **Meals & Entertainment:**
  * Individual meals: Cap of **₹1,500 per day**.
  * Client Entertainment dinners: Cap of **₹2,000 per head** (list of delegates required in description).
* **WFH Broadband Reimbursement:** Limit of **₹1,500 per month** (official PDF receipt with bill break-up mandatory).

## 3. Four-Desk Review Cycle
1. **Manager Approval:** Line-by-line review. Verifies business relevance.
2. **Finance Audit:** Policy audit. Checks and validates attached invoices. Can request **Corrections** (sends claim back to employee).
3. **HR Compliance:** Ensures HR benefit criteria (e.g. training certification, wellness limits) are met.
4. **Accounts Payout:** Bank processing, settlements, and bank transaction logging (NEFT/RTGS).
`;
