/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, FileText, CheckCircle, ShieldAlert, Award, Plane } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExpensePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExpensePolicyModal({ isOpen, onClose }: ExpensePolicyModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-50 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-150 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Yolocorp Expense Policy</h3>
                  <p className="text-[10px] text-slate-500">Official Travel & Compliance Guidelines</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
                id="close-policy-btn"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Area */}
            <div className="max-h-[65vh] overflow-y-auto p-6 text-slate-700 space-y-6 text-sm">
              
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-amber-900">Strict Submission Windows</h4>
                  <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                    Expenses must be submitted within **30 days** of incurring them. Employees can only select line item dates that fall within the **current calendar month**. Dates outside this range require executive-level pre-authorization.
                  </p>
                </div>
              </div>

              {/* SECTION 1 */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Plane className="h-4 w-4 text-indigo-500" />
                  1. Travel & Lodging Allowances
                </h4>
                <ul className="space-y-2 pl-6 list-disc">
                  <li><strong>Flights:</strong> Economy class only. Round-trip flights must be booked at least 10 days in advance of the trip whenever possible.</li>
                  <li>
                    <strong>Hotel Cap Limits:</strong>
                    <div className="mt-1.5 grid grid-cols-2 gap-3 max-w-md">
                      <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-xs">
                        <p className="font-semibold text-slate-800">Tier 1 Metros</p>
                        <p className="text-slate-500 mt-0.5">Delhi NCR, Mumbai, Bangalore</p>
                        <p className="text-indigo-600 font-bold mt-1">Cap: ₹6,000 / night</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-xs">
                        <p className="font-semibold text-slate-800">Other Cities</p>
                        <p className="text-slate-500 mt-0.5">Hyderabad, Pune, Chennai, etc.</p>
                        <p className="text-indigo-600 font-bold mt-1">Cap: ₹4,500 / night</p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              {/* SECTION 2 */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-500" />
                  2. Meals, Entertainment & Subscriptions
                </h4>
                <ul className="space-y-2 pl-6 list-disc">
                  <li><strong>Daily Food Allowance:</strong> Individual meals are capped at **₹1,500 per day** in aggregate.</li>
                  <li><strong>Client Hosting:</strong> Capped at **₹2,000 per head**. High-value entertainment dinners require writing down all attending guest names and companies in the description box.</li>
                  <li><strong>Internet Broadband:</strong> WFH broadband allowances up to **₹1,500 per month**. An official PDF receipt with itemized breakdown must be uploaded; generic payment confirmations (e.g. UPI screenshots) are not acceptable.</li>
                </ul>
              </div>

              {/* SECTION 3 */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  3. The 4-Desk Audit Workflow
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl text-center">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-slate-200 text-[10px] font-bold text-slate-700">1</span>
                    <p className="font-semibold text-slate-800 text-xs mt-1.5">Line Manager</p>
                    <p className="text-[10px] text-slate-500 mt-1">Verifies business context & relevance</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl text-center">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-indigo-100 text-[10px] font-bold text-indigo-700">2</span>
                    <p className="font-semibold text-slate-800 text-xs mt-1.5">Finance Audit</p>
                    <p className="text-[10px] text-slate-500 mt-1">Checks receipts, policy rules & tax codes</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl text-center">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-pink-100 text-[10px] font-bold text-pink-700">3</span>
                    <p className="font-semibold text-slate-800 text-xs mt-1.5">HR Benefit</p>
                    <p className="text-[10px] text-slate-500 mt-1">Validates benefits & compliance guidelines</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl text-center">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-amber-100 text-[10px] font-bold text-amber-700">4</span>
                    <p className="font-semibold text-slate-800 text-xs mt-1.5">Accounts</p>
                    <p className="text-[10px] text-slate-500 mt-1">Processes bank transfer & payments</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-3.5 flex justify-end">
              <button
                onClick={onClose}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                id="close-policy-bottom-btn"
              >
                Understood
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
