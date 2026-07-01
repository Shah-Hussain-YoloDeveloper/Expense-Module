/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ExpenseClaim, UserProfile, ExpenseItem, Attachment } from '../types';
import { EXPENSE_CATEGORIES, EXPENSE_TYPES } from '../data';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  FileSpreadsheet,
  Upload,
  Download,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Paperclip,
  X,
  FileCheck2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';

interface ExpenseClaimFormProps {
  currentUser: UserProfile;
  claimToEdit?: ExpenseClaim; // If specified, we are in Edit mode
  onCancel: () => void;
  onSubmit: (formData: Partial<ExpenseClaim>) => void;
}

export default function ExpenseClaimForm({
  currentUser,
  claimToEdit,
  onCancel,
  onSubmit
}: ExpenseClaimFormProps) {
  const isEditMode = !!claimToEdit;

  // Header/Meta metadata state
  const [title, setTitle] = useState(claimToEdit?.title || '');
  const [categoryId, setCategoryId] = useState<string>(claimToEdit?.category.id.toString() || '1');
  const [city, setCity] = useState(claimToEdit?.city || '');
  const [fromDate, setFromDate] = useState(claimToEdit?.from_date || '');
  const [toDate, setToDate] = useState(claimToEdit?.to_date || '');
  const [transactionDate, setTransactionDate] = useState(claimToEdit?.transaction_date || '');

  // Line items state
  const [lines, setLines] = useState<ExpenseItem[]>([]);

  // Validation feedback
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [reportingManagerName, setReportingManagerName] = useState<string>('');

  // File drop state reference
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // Establish active category configuration
  const activeCategory = EXPENSE_CATEGORIES.find(c => c.id === parseInt(categoryId));

  // Pre-fill lines if in Edit Mode
  useEffect(() => {
    if (isEditMode && claimToEdit) {
      setLines(claimToEdit.items);
    } else {
      // Seed 1 blank line for new claims
      handleAddLine();
    }
  }, [isEditMode, claimToEdit]);

  // Determine manager name based on org chart rules
  useEffect(() => {
    if (currentUser.role === 'employee') {
      setReportingManagerName('Sarah Connor (Head of Engineering)');
    } else if (currentUser.role === 'manager') {
      setReportingManagerName('Raj Mehta (Finance Representative)');
    } else {
      setReportingManagerName('System Admin Desk');
    }
  }, [currentUser]);

  // Helper to add empty line
  const handleAddLine = () => {
    const newLine: ExpenseItem = {
      id: Date.now() + Math.random(),
      item_date: '',
      expense_type: EXPENSE_TYPES[0],
      title: '',
      amount: 0,
      description: '',
      attachments: [],
      desk_manager_status: null,
      desk_manager_remarks: null,
      desk_finance_status: null,
      desk_finance_remarks: null,
      desk_hr_status: null,
      desk_hr_remarks: null,
      desk_accounts_status: null,
      desk_accounts_remarks: null
    };
    setLines(prev => [...prev, newLine]);
  };

  // Helper to remove item line
  const handleRemoveLine = (id: number) => {
    const lineToRemove = lines.find(l => l.id === id);
    if (lineToRemove && lineToRemove.desk_finance_status === 'approved') {
      alert("This line was already approved in previous audits and cannot be deleted.");
      return;
    }
    setLines(prev => prev.filter(line => line.id !== id));
  };

  // Helper to update individual line field
  const handleUpdateLine = (id: number, key: keyof ExpenseItem, value: any) => {
    setLines(prev => prev.map(line => {
      if (line.id === id) {
        // Safe checks for previously approved lines
        if (line.desk_finance_status === 'approved' && (key === 'amount' || key === 'expense_type' || key === 'item_date')) {
          return line; // Lock important fields of approved lines
        }
        return { ...line, [key]: value };
      }
      return line;
    }));
  };

  // Sanitize line amount input (regex replacement: whole digits only, no decimals)
  const handleAmountInput = (id: number, text: string) => {
    const numeric = text.replace(/\D/g, "");
    const numericValue = parseInt(numeric, 10) || 0;
    handleUpdateLine(id, 'amount', numericValue);
  };

  // Attachment upload simulation
  const handleUploadFiles = (lineId: number, files: FileList | null) => {
    if (!files) return;

    const currentLine = lines.find(l => l.id === lineId);
    if (!currentLine) return;

    if (currentLine.attachments.length + files.length > 3) {
      alert("You can attach a maximum of 3 receipts per item line.");
      return;
    }

    const newAttachments: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 10MB limit.`);
        continue;
      }
      
      // Create mockup URL
      const mockUrl = file.type === 'application/pdf'
        ? "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        : "https://dummyimage.com/600x400/ccc/000.png&text=" + encodeURIComponent(file.name);

      newAttachments.push({
        name: file.name,
        size: file.size,
        url: mockUrl,
        mime_type: file.type || 'image/png'
      });
    }

    handleUpdateLine(lineId, 'attachments', [...currentLine.attachments, ...newAttachments]);
  };

  // Remove attachment helper
  const handleRemoveAttachment = (lineId: number, name: string) => {
    const currentLine = lines.find(l => l.id === lineId);
    if (!currentLine) return;
    const filtered = currentLine.attachments.filter(a => a.name !== name);
    handleUpdateLine(lineId, 'attachments', filtered);
  };

  // Bulk Excel Export Template
  const handleDownloadTemplate = () => {
    const wsData = [
      ["expense type", "item date", "title", "amount", "description"],
      ["Flights & Transport", "2026-07-02", "Indigo flight Delhi to Bangalore", "8500", "Round trip sales travel"],
      ["Hotel & Accommodation", "2026-07-03", "Taj Residency stay", "6000", "Official accommodation"],
      ["Meals & Food", "2026-07-04", "Team lunch with developers", "1500", "Lunch meeting"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Claim Lines Template");
    XLSX.writeFile(wb, "Yolocorp_Expense_Upload_Template.xlsx");
  };

  // Bulk Excel Import Parsing
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet) as any[];

        if (rows.length === 0) {
          alert("The uploaded Excel file has no rows.");
          return;
        }

        const importedLines: ExpenseItem[] = rows.map((row, idx) => {
          const typeStr = (row["expense type"] || row["Expense Type"] || "Office Supplies").toString().trim();
          const matchedType = EXPENSE_TYPES.find(t => t.label.toLowerCase() === typeStr.toLowerCase()) || EXPENSE_TYPES[EXPENSE_TYPES.length - 1];

          let dateStr = (row["item date"] || row["Item Date"] || "2026-07-01").toString().trim();
          // Convert Excel internal serial numbers if needed
          if (/^\d+(\.\d+)?$/.test(dateStr)) {
            const numDate = parseFloat(dateStr);
            const dateObj = new Date(Math.round((numDate - 25569) * 86400 * 1000));
            dateStr = dateObj.toISOString().split('T')[0];
          }

          const rawAmt = parseInt(row["amount"] || row["Amount"] || "0", 10);

          return {
            id: Date.now() + Math.random() + idx,
            item_date: dateStr,
            expense_type: matchedType,
            title: (row["title"] || row["Title"] || "Excel Imported Line").toString(),
            amount: isNaN(rawAmt) ? 0 : rawAmt,
            description: (row["description"] || row["Description"] || "").toString(),
            attachments: [],
            desk_manager_status: null,
            desk_manager_remarks: null,
            desk_finance_status: null,
            desk_finance_remarks: null,
            desk_hr_status: null,
            desk_hr_remarks: null,
            desk_accounts_status: null,
            desk_accounts_remarks: null
          };
        });

        // Filter out completely blank rows
        const validImported = importedLines.filter(l => l.title !== '' || l.amount > 0);
        
        if (validImported.length > 0) {
          // If first line is blank and unedited, replace it
          if (lines.length === 1 && lines[0].title === '' && lines[0].amount === 0) {
            setLines(validImported);
          } else {
            setLines(prev => [...prev, ...validImported]);
          }
        }
      } catch (err) {
        alert("Could not process spreadsheet. Please use the layout provided in the download template.");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ''; // Reset input
  };

  // Core Form Submit Validator
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    // 1. General Info Validation
    if (!title.trim()) errors.push("Claim Title is a mandatory field.");
    if (!city.trim()) errors.push("Travel City / Place is a mandatory field.");

    if (activeCategory?.type === 'trip_expense') {
      if (!fromDate) errors.push("From Date is mandatory for multi-day trips.");
      if (!toDate) errors.push("To Date is mandatory for multi-day trips.");
      if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
        errors.push("Trip From Date cannot be after the To Date.");
      }
    } else {
      if (!transactionDate) errors.push("Transaction Date is mandatory for single receipts.");
    }

    // 2. Lines Validation
    const filledLines = lines.filter(l => l.title.trim() !== '' || l.amount > 0);
    if (filledLines.length === 0) {
      errors.push("The claim must contain at least 1 detailed expense line item.");
    }

    // Check individual line correctness
    filledLines.forEach((line, idx) => {
      const lineNum = idx + 1;
      if (!line.item_date) {
        errors.push(`Item line #${lineNum} is missing an transaction date.`);
      }
      if (!line.title.trim()) {
        errors.push(`Item line #${lineNum} is missing an expense title.`);
      }
      if (line.amount <= 0) {
        errors.push(`Item line #${lineNum} must have a positive whole amount.`);
      }

      // Check current calendar month rule for non-managers
      if (currentUser.role === 'employee' && line.item_date) {
        const itemDateObj = new Date(line.item_date);
        const itemMonth = itemDateObj.getMonth();
        const itemYear = itemDateObj.getFullYear();
        
        // Target: July 2026 (as per system metadata)
        const targetMonth = 6; // 0-indexed is July
        const targetYear = 2026;

        if (itemMonth !== targetMonth || itemYear !== targetYear) {
          errors.push(`Compliance Block: Item line #${lineNum} date (${line.item_date}) falls outside current calendar month (July 2026).`);
        }
      }

      // Trip boundaries rule
      if (activeCategory?.type === 'trip_expense' && line.item_date && fromDate && toDate) {
        const itemDateObj = new Date(line.item_date);
        const fromDateObj = new Date(fromDate);
        const toDateObj = new Date(toDate);
        
        if (itemDateObj < fromDateObj || itemDateObj > toDateObj) {
          errors.push(`Boundary Block: Item line #${lineNum} date (${line.item_date}) must fall between trip range [${fromDate} – ${toDate}].`);
        }
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Pack into clean Partial<ExpenseClaim> payload
    const finalPayload: Partial<ExpenseClaim> = {
      title: title.trim(),
      category: activeCategory,
      city: city.trim(),
      from_date: activeCategory?.type === 'trip_expense' ? fromDate : null,
      to_date: activeCategory?.type === 'trip_expense' ? toDate : null,
      transaction_date: activeCategory?.type === 'trip_expense' ? null : transactionDate,
      items: filledLines,
      // If editing, preserve logs or ID; handled in App orchestration
    };

    onSubmit(finalPayload);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6 pb-12">
      
      {/* Header and Back Link */}
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl" id="form-header-title">
              {isEditMode ? "Edit Expense Claim" : "File Expense Claim"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditMode 
                ? `Modifying expense file ${claimToEdit?.expense_number}`
                : "Submit multi-line expenses and travel bills for review."
              }
            </p>
          </div>
        </div>

        {/* Manager confirmation */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 flex items-center gap-2">
          <Info className="h-4 w-4 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            Approver: <span className="text-slate-800">{reportingManagerName}</span>
          </span>
        </div>
      </div>

      {/* Validation Error Banner */}
      <AnimatePresence>
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4"
            id="validation-error-banner"
          >
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  Compliance Violations ({validationErrors.length})
                </h4>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-rose-800 leading-relaxed">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 1: General Meta Details Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          1. Expense Claim Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Expense Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-2xs focus:border-slate-500 focus:outline-none"
              id="form-category-select"
            >
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Place/City */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Expense City / Location <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <MapPin className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bangalore, Hyderabad, Online"
                className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none shadow-2xs"
                id="form-city-input"
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Claim Title / Purpose <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Client Onboarding Bangalore Travel, AWS Certification Payout"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none shadow-2xs"
              id="form-title-input"
            />
          </div>

          {/* Conditional Dates Renderer */}
          {activeCategory?.type === 'trip_expense' ? (
            <div className="grid grid-cols-2 gap-4 md:col-span-2 p-3 bg-slate-50 border border-slate-150 rounded-xl">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Trip Start Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-slate-500 focus:outline-none"
                  id="form-from-date"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Trip End Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-slate-500 focus:outline-none"
                  id="form-to-date"
                />
              </div>
            </div>
          ) : (
            <div className="md:col-span-2 p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Date of Transaction <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="max-w-xs w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-slate-500 focus:outline-none"
                id="form-transaction-date"
              />
            </div>
          )}

        </div>
      </div>

      {/* STEP 2: Excel Bulk Toolbar & Detailed Line Items */}
      <div className="space-y-4">
        
        {/* Line item toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Detailed Expenses List
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Enter individual expense line items or download our Excel template to import bulk rows.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Download Template */}
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
              id="download-template-btn"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              Template
            </button>

            {/* Upload Excel Selector */}
            <label className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer">
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              <span>Import Sheet</span>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImportExcel}
                className="hidden"
                id="import-excel-file-selector"
              />
            </label>
          </div>
        </div>

        {/* Lines loop */}
        <div className="space-y-4">
          {lines.map((line, index) => {
            const isLineApproved = line.desk_finance_status === 'approved';
            const hasCorrectionRemarks = line.desk_finance_status === 'correction_required' && line.desk_finance_remarks;

            return (
              <div
                key={line.id}
                className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-2xs transition-all ${
                  isLineApproved 
                    ? 'border-emerald-200 bg-emerald-50/5'
                    : hasCorrectionRemarks
                    ? 'border-dashed border-amber-400 bg-amber-50/5 ring-1 ring-amber-100'
                    : 'border-slate-200/80'
                }`}
                id={`line-card-${index}`}
              >
                
                {/* Visual labels */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Expense Line Item
                    </span>
                    {isLineApproved && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                        <CheckCircle2 className="h-3 w-3 fill-emerald-500/10" /> Verified Approved
                      </span>
                    )}
                  </div>

                  {/* Remove line button (locked if previously approved) */}
                  {!isLineApproved && lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(line.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      id={`remove-line-btn-${index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Audit Comments inside card if correction requested */}
                {hasCorrectionRemarks && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex gap-2 text-xs">
                    <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                    <div>
                      <p className="font-bold text-amber-900">Correction Requested by Audit Desk:</p>
                      <p className="text-amber-800 mt-0.5">{line.desk_finance_remarks}</p>
                    </div>
                  </div>
                )}

                {/* Main Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {/* Date */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Item Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={line.item_date}
                      disabled={isLineApproved}
                      onChange={(e) => handleUpdateLine(line.id, 'item_date', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-slate-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>

                  {/* Type */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Type of Spend <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={line.expense_type.id}
                      disabled={isLineApproved}
                      onChange={(e) => {
                        const matched = EXPENSE_TYPES.find(t => t.id === parseInt(e.target.value));
                        if (matched) handleUpdateLine(line.id, 'expense_type', matched);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-slate-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      {EXPENSE_TYPES.map(type => (
                        <option key={type.id} value={type.id}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Item Title */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Item Title / Supplier name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Indigo flight, Hotel stay invoice..."
                      value={line.title}
                      disabled={isLineApproved}
                      onChange={(e) => handleUpdateLine(line.id, 'title', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 sm:col-span-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Item Description
                    </label>
                    <textarea
                      placeholder="Details of expense context, number of people present..."
                      value={line.description}
                      disabled={isLineApproved}
                      onChange={(e) => handleUpdateLine(line.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 resize-none"
                    />
                  </div>

                  {/* Amount (Regex checked - whole numbers only) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Amount (INR) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs font-bold">
                        ₹
                      </span>
                      <input
                        type="text"
                        value={line.amount === 0 ? "" : line.amount}
                        disabled={isLineApproved}
                        onChange={(e) => handleAmountInput(line.id, e.target.value)}
                        placeholder="Whole Rupees"
                        className="w-full rounded-xl border border-slate-200 bg-white pl-7 pr-3 py-2 text-xs font-bold text-slate-800 focus:border-slate-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Attachments Dropzone / Picker */}
                  <div className="sm:col-span-4 mt-2 border-t border-slate-100 pt-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Paperclip className="h-3.5 w-3.5" /> Receipt Attachments (PNG, JPG, PDF - Max 3, up to 10MB)
                        </span>
                        
                        {/* Selected files preview */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {line.attachments.map(att => (
                            <div key={att.name} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700">
                              <span className="truncate max-w-[150px]">{att.name}</span>
                              <span className="text-[9px] text-slate-400">({(att.size / 1024).toFixed(0)}KB)</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveAttachment(line.id, att.name)}
                                className="rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          {line.attachments.length === 0 && (
                            <span className="text-[11px] text-slate-400 italic">No files attached yet.</span>
                          )}
                        </div>
                      </div>

                      {/* Browse triggers */}
                      {line.attachments.length < 3 && (
                        <div>
                          <input
                            type="file"
                            multiple
                            accept="image/png, image/jpeg, application/pdf"
                            ref={(el) => { fileInputRefs.current[line.id] = el; }}
                            onChange={(e) => handleUploadFiles(line.id, e.target.files)}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[line.id]?.click()}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                          >
                            <Upload className="h-3.5 w-3.5 text-slate-500" />
                            Upload Receipt
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

        {/* Add expense button */}
        <button
          type="button"
          onClick={handleAddLine}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-400 bg-white p-4 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all cursor-pointer"
          id="add-blank-line-btn"
        >
          <Plus className="h-4 w-4" />
          Add Another Expense Line Item
        </button>
      </div>

      {/* STEP 3: Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
          id="cancel-form-btn"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-xl bg-slate-900 hover:bg-slate-800 px-6 py-2.5 text-xs font-semibold text-white transition-all shadow-md active:scale-95 cursor-pointer"
          id="submit-form-btn"
        >
          Submit Claim File
        </button>
      </div>

    </form>
  );
}
