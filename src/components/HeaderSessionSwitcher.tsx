/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MOCK_USERS } from '../data';
import { UserProfile } from '../types';
import { Shield, ChevronDown, User, CheckCircle2, UserCheck, CreditCard, HeartHandshake } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderSessionSwitcherProps {
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
  onViewPolicy: () => void;
}

export default function HeaderSessionSwitcher({
  currentUser,
  onUserChange,
  onViewPolicy
}: HeaderSessionSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get matching icon for role
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'employee':
        return <User className="h-4 w-4 text-slate-500" />;
      case 'manager':
        return <UserCheck className="h-4 w-4 text-emerald-600" />;
      case 'finance_desk':
        return <Shield className="h-4 w-4 text-indigo-600" />;
      case 'human_resources_desk':
        return <HeartHandshake className="h-4 w-4 text-pink-600" />;
      case 'accounts_desk':
        return <CreditCard className="h-4 w-4 text-amber-600" />;
      default:
        return <User className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full h-20 border-b border-slate-200 bg-white/95 backdrop-blur-md flex items-center shadow-xs">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 transition-all hover:scale-105 duration-300">
            <Shield className="h-5.5 w-5.5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-800 leading-tight">
              Yolocorp Claims
            </h1>
            <p className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase">
              Expense Desk Engine
            </p>
          </div>
        </div>

        {/* Right Side: Identity Switcher & Policy trigger */}
        <div className="flex items-center gap-4">
          <button
            onClick={onViewPolicy}
            className="hidden text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all md:block px-3 py-2 rounded-lg"
            id="view-policy-trigger"
          >
            Expense Policy
          </button>

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              id="role-switcher-btn"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-50 border border-slate-150">
                  {getRoleIcon(currentUser.role)}
                </span>
                <div className="hidden sm:block">
                  <div className="font-bold text-slate-900 leading-3">{currentUser.name}</div>
                  <div className="text-[9px] text-slate-500 font-medium leading-3 mt-0.5">{currentUser.roleLabel}</div>
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <AnimatePresence>
              {isOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                  
                  {/* Dropdown Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 z-50 w-72 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
                  >
                    <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                      <p className="text-[10px] font-bold tracking-wider text-indigo-600 uppercase">
                        Switch Workspace Session
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Test approvals across different organizational desks.
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      {MOCK_USERS.map((user) => {
                        const isSelected = user.id === currentUser.id;
                        return (
                          <button
                            key={user.id}
                            onClick={() => {
                              onUserChange(user);
                              setIsOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                              isSelected
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'text-slate-700 hover:bg-indigo-50/50 hover:text-indigo-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                                isSelected ? 'bg-white/20' : 'bg-slate-100 border border-slate-200'
                              }`}>
                                {getRoleIcon(user.role)}
                              </span>
                              <div>
                                <p className={`font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                  {user.name}
                                </p>
                                <p className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                                  {user.roleLabel}
                                </p>
                              </div>
                            </div>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-white fill-white/10 stroke-[2.5]" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </header>
  );
}
