/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Building, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Map, 
  Layers, 
  Coins, 
  Clock, 
  BookOpen, 
  DollarSign, 
  Plane, 
  FileText 
} from 'lucide-react';

interface ExpensePolicyPageProps {
  onBack: () => void;
}

export default function ExpensePolicyPage({ onBack }: ExpensePolicyPageProps) {
  const [activeTab, setActiveTab] = useState<'guidelines' | 'slabs' | 'procedure'>('guidelines');

  const pdfUrl = "https://growth-healthatm.s3.ap-south-1.amazonaws.com/simple-organization-policies/1e32f454-461c-44de-87b1-1a7142e85b25-haipl-travel-expense-policy.pdf";

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            title="Go back to claims list"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Corporate Governance</span>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Travel & Expense Policy</h1>
          </div>
        </div>

        {/* PDF Link Button */}
        <a
          href={pdfUrl}
          target="_blank"
          referrerPolicy="no-referrer"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-700 hover:shadow-indigo-600/25 transition-all cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Download Policy PDF
        </a>
      </div>

      {/* Corporate Header Info & Tab Navigation Row */}
      <div className="flex flex-col gap-5 border-b border-slate-200 bg-white p-5 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <Building className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">HealthATM India Private Limited</h4>
              <p className="text-[10px] text-slate-500 font-medium leading-normal mt-0.5">
                CIN No: U85191MH2013PTC245173 • 211, Woodrow, Veera Desai Road, Andheri West, Mumbai - 400053
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'guidelines' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Policy Guidelines
          </button>
          <button
            onClick={() => setActiveTab('slabs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'slabs' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
            }`}
          >
            <Layers className="h-4 w-4" />
            Expenses Slabs Limits
          </button>
          <button
            onClick={() => setActiveTab('procedure')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'procedure' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
            }`}
          >
            <Clock className="h-4 w-4" />
            Submission & Review Flow
          </button>
        </div>
      </div>

      {/* Main Content Card (Full Width) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
        {/* TAB 1: GUIDELINES */}
            {activeTab === 'guidelines' && (
              <div className="space-y-8">
                {/* Intro Hero banner */}
                <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 opacity-10">
                    <FileText className="h-48 w-48" />
                  </div>
                  <span className="text-[9px] font-extrabold bg-indigo-500 px-2 py-0.5 rounded text-white uppercase tracking-wide">Yolo Health Business</span>
                  <h2 className="text-lg font-extrabold mt-2 tracking-tight">Travel Expenses Directive</h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                    This document provides guidance to management and employees for reimbursement of allowable expenses incurred on Yolo Health trips, which must be consistent with normal living standards.
                  </p>
                </div>

                {/* Purpose & Policy Base */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Purpose
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      To provide guidance to management and Employees for reimbursement of allowable expenses while on Yolo Health business. Only receipts which have been approved by the Employee's manager are reimbursed.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Mileage Definition
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      "Mileage" refers to the payment Yolo Health makes to Employees for using their personal vehicles for business, based on a flat rate per kilometer traveled to cover fuel, insurance, maintenance, and wear-and-tear.
                    </p>
                  </div>
                </div>

                {/* Allowable vs Non-reimbursable GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  {/* Allowable List */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Allowable Business Expenses</h3>
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-650">
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        <span><strong>Flights:</strong> Economy class air fares, train, or bus tickets to destination city.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        <span><strong>Hotels:</strong> Overnight accommodation arrangements kept as economical as possible.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        <span><strong>Meals:</strong> Reasonable personal meals and associated tips during travel.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        <span><strong>Conveyance:</strong> Local taxi, auto, public transport, or rental cars (if cheaper overall).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        <span><strong>Mileage:</strong> Personal vehicle usage for business trips not including home-to-work travel.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        <span><strong>Entertainment:</strong> For executives/managers during client relations events.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Non-reimbursable List */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <XCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Non-Reimbursable Items</h3>
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-650">
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                        <span>Alcohol purchases and updates to higher classes of travel services.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                        <span>Fines for traffic violations, parking fines, or towing fees.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                        <span>Expenses related to travelling with a spouse or other guest.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                        <span>Flight, train, or cab cancellation charges arising from employee's fault.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                        <span>Hotel pay TV, laundry (under 3 days), hair dressing, and clothing purchases.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                        <span>Loss or theft of personal items/luggage during business trips.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Special vehicle travel conditions */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-150 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-indigo-500" />
                    Special Conditions for Vehicle Claims
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Employees may claim mileage when using personal vehicles if:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
                    <div className="bg-white border border-slate-200/60 p-3.5 rounded-xl text-xs">
                      <p className="font-semibold text-slate-800">Trip Efficiency</p>
                      <p className="text-slate-500 mt-1 leading-relaxed">The cost of the trip does not exceed the cost of other forms of transportation.</p>
                    </div>
                    <div className="bg-white border border-slate-200/60 p-3.5 rounded-xl text-xs">
                      <p className="font-semibold text-slate-800">Operational Sites</p>
                      <p className="text-slate-500 mt-1 leading-relaxed">Travel goes directly from normal place of employment to a different business operation (e.g., ATM Machine site).</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-amber-700 font-medium pt-1">
                    *Note: Normal travel from home to normal place of work and return is not eligible to be claimed.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: SLABS */}
            {activeTab === 'slabs' && (
              <div className="space-y-8">
                {/* Intro block */}
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Coins className="h-4.5 w-4.5 text-indigo-600" />
                    Tiered Reimbursement Slabs Limit
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Specific category caps are strictly enforced by the systems. Expenses exceeding these slabs will not be approved.
                  </p>
                </div>

                {/* SLAB 1: Metro Slabs */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-50 text-[10px] font-bold text-indigo-600">Region 1</span>
                    <h3 className="text-xs font-extrabold text-slate-800">Mumbai, Delhi & Uttar Pradesh Limits</h3>
                  </div>
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Airfare</th>
                          <th className="px-4 py-3">Train Limit</th>
                          <th className="px-4 py-3">Hotel Cap</th>
                          <th className="px-4 py-3">Cab Class</th>
                          <th className="px-4 py-3 text-center">B'fast</th>
                          <th className="px-4 py-3 text-center">Lunch</th>
                          <th className="px-4 py-3 text-center">Dinner</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        <tr className="hover:bg-slate-50/50">
                          <td className="px-4 py-3.5 font-bold text-slate-900">Associate Level</td>
                          <td className="px-4 py-3.5 text-slate-500">Economic</td>
                          <td className="px-4 py-3.5 text-slate-500">AC 3 Tier / Sleeper</td>
                          <td className="px-4 py-3.5 text-indigo-600 font-bold">₹1,000 - ₹1,500</td>
                          <td className="px-4 py-3.5 text-slate-500 text-[11px] leading-relaxed">Mini cab, Rapido, Shared, Ola Bike, Rickshaw</td>
                          <td className="px-4 py-3.5 text-center text-slate-600 font-semibold">₹100</td>
                          <td className="px-4 py-3.5 text-center text-slate-600 font-semibold">₹200</td>
                          <td className="px-4 py-3.5 text-center text-slate-600 font-semibold">₹200</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 bg-slate-50/20">
                          <td className="px-4 py-3.5 font-bold text-slate-900">Manager</td>
                          <td className="px-4 py-3.5 text-slate-500">Economic</td>
                          <td className="px-4 py-3.5 text-slate-500">AC 3 Tier</td>
                          <td className="px-4 py-3.5 text-indigo-600 font-bold">₹2,000 - ₹3,000</td>
                          <td className="px-4 py-3.5 text-slate-500">Mini Cab</td>
                          <td className="px-4 py-3.5 text-center text-slate-600 font-semibold">₹150</td>
                          <td className="px-4 py-3.5 text-center text-slate-600 font-semibold">₹300</td>
                          <td className="px-4 py-3.5 text-center text-slate-600 font-semibold">₹300</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="px-4 py-3.5 font-bold text-slate-900">Above Manager</td>
                          <td className="px-4 py-3.5 text-slate-500">Economic</td>
                          <td className="px-4 py-3.5 text-slate-500">AC 2 / 1 Tier</td>
                          <td className="px-4 py-3.5 text-indigo-600 font-bold">₹3,000 - ₹5,000</td>
                          <td className="px-4 py-3.5 text-slate-500">Prime Cab</td>
                          <td className="px-4 py-3.5 text-center text-slate-600 font-semibold">₹200</td>
                          <td className="px-4 py-3.5 text-center text-slate-600 font-semibold">₹500</td>
                          <td className="px-4 py-3.5 text-center text-slate-600 font-semibold">₹500</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SLAB 2: Arunachal Pradesh Slabs */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-50 text-[10px] font-bold text-indigo-600">Region 2</span>
                    <h3 className="text-xs font-extrabold text-slate-800">Arunachal Pradesh Limits</h3>
                  </div>
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Airfare</th>
                          <th className="px-4 py-3">Train Limit</th>
                          <th className="px-4 py-3">Hotel Cap</th>
                          <th className="px-4 py-3">Cab Class</th>
                          <th className="px-4 py-3 text-center">Combined Meal Allowance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        <tr className="hover:bg-slate-50/50">
                          <td className="px-4 py-3.5 font-bold text-slate-900">Associate Level</td>
                          <td className="px-4 py-3.5 text-slate-500">Economic</td>
                          <td className="px-4 py-3.5 text-slate-500">AC 3 Tier</td>
                          <td className="px-4 py-3.5 text-indigo-600 font-bold">₹1,000 - ₹1,500</td>
                          <td className="px-4 py-3.5 text-slate-500">Mini Cab</td>
                          <td className="px-4 py-3.5 text-center text-slate-600 font-extrabold">₹1,000 / day</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 bg-slate-50/20">
                          <td className="px-4 py-3.5 font-bold text-slate-900">Manager</td>
                          <td className="px-4 py-3.5 text-slate-500">Economic</td>
                          <td className="px-4 py-3.5 text-slate-500">AC 3 Tier</td>
                          <td className="px-4 py-3.5 text-indigo-600 font-bold">₹2,000 - ₹3,000</td>
                          <td className="px-4 py-3.5 text-slate-500">Mini Cab</td>
                          <td className="px-4 py-3.5 text-center text-slate-600 font-extrabold">₹1,500 / day</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="px-4 py-3.5 font-bold text-slate-900">Above Manager</td>
                          <td className="px-4 py-3.5 text-slate-500">Economic</td>
                          <td className="px-4 py-3.5 text-slate-500">AC 2 / 1 Tier</td>
                          <td className="px-4 py-3.5 text-indigo-600 font-bold">₹3,000 - ₹5,000</td>
                          <td className="px-4 py-3.5 text-slate-500">Prime Cab</td>
                          <td className="px-4 py-3.5 text-center text-slate-600 font-extrabold">₹2,000 / day</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Core compliance note */}
                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4.5 flex gap-3 text-amber-900">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-extrabold">Notice to Employees & Auditors</p>
                    <p className="leading-relaxed">
                      Always double-check receipt figures. Any expense claims that cross the maximum ceiling limit defined above must be auto-flagged and rejected, or sent for correction by respective auditing departments.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PROCEDURE */}
            {activeTab === 'procedure' && (
              <div className="space-y-8">
                {/* Submission Procedures */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="h-4.5 w-4.5 text-indigo-600" />
                      1. Employee Submission Workflow
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Step-by-step guideline on retaining and uploading receipts through ERP.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-slate-150 p-4 rounded-2xl space-y-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">a</span>
                      <p className="text-xs font-bold text-slate-900">Detailed Itemization</p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        The Employee must retain and submit detailed, itemized receipts for every transaction, specifically highlighting restaurant item details for food purchases.
                      </p>
                    </div>
                    <div className="border border-slate-150 p-4 rounded-2xl space-y-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">b</span>
                      <p className="text-xs font-bold text-slate-900">Context & Date Meta</p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Every upload must clearly document the nature of the expense, transaction date, location, client/customer, and business reason.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Audit Desk Flow */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                      2. Interactive 4-Desk Audit Steps
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Multi-desk approval hierarchy executed on the ERP for reimbursement processing.
                    </p>
                  </div>
                  <div className="space-y-3.5">
                    {/* Desk 1 */}
                    <div className="flex gap-4 p-4 rounded-2xl border border-slate-150 hover:border-slate-200 transition-colors">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-extrabold text-slate-700 text-xs">1</div>
                      <div className="text-xs space-y-1">
                        <p className="font-extrabold text-slate-900">Department Manager Review</p>
                        <p className="text-slate-500 leading-relaxed">
                          Reviews for business relevance and normal living standards. Options include: **Approve** (forward to Finance), **Deny** / **Request Correction** (to adjust errors), or provide guidance on appropriate levels.
                        </p>
                      </div>
                    </div>
                    {/* Desk 2 */}
                    <div className="flex gap-4 p-4 rounded-2xl border border-slate-150 hover:border-slate-200 transition-colors">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-extrabold text-indigo-700 text-xs">2</div>
                      <div className="text-xs space-y-1">
                        <p className="font-extrabold text-slate-900">Finance Audit Review</p>
                        <p className="text-slate-500 leading-relaxed">
                          Checks receipt integrity, compliance with strict slab ranges, tax components, and correct classification. Option to request correction back to the Employee.
                        </p>
                      </div>
                    </div>
                    {/* Desk 3 */}
                    <div className="flex gap-4 p-4 rounded-2xl border border-slate-150 hover:border-slate-200 transition-colors">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-pink-50 font-extrabold text-pink-700 text-xs">3</div>
                      <div className="text-xs space-y-1">
                        <p className="font-extrabold text-slate-900">HR Compliance Check</p>
                        <p className="text-slate-500 leading-relaxed">
                          Performs audit checks to verify if any regional/corporate benefit anomalies were made. Once rectified or approved, HR forwards the claim in ERP to Accounts.
                        </p>
                      </div>
                    </div>
                    {/* Desk 4 */}
                    <div className="flex gap-4 p-4 rounded-2xl border border-slate-150 hover:border-slate-200 transition-colors">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 font-extrabold text-amber-700 text-xs">4</div>
                      <div className="text-xs space-y-1">
                        <p className="font-extrabold text-slate-900">Accounts & Finance Settlement</p>
                        <p className="text-slate-500 leading-relaxed">
                          Final desk. Verifies authorizations and registers bank transfer/reimbursement payouts. Action results in final **Settlement** of the claim.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Core Judgement Statement */}
                <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-850 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Judicious Expenditures Clause</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Employees are expected to: Spend the company's money as carefully and judiciously as they would their own, exercise good judgment, and report all claims promptly with receipt proofs uploaded. If receipt or payment proof is missing, the expense will not be approved.
                  </p>
                </div>
              </div>
            )}
          </div>
    </div>
  );
}
