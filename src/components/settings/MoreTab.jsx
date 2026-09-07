import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useExpenses } from '../../context/ExpenseContext';
import { exportExpensesToCSV } from '../../lib/exportUtils';
import { isSupabaseConfigured } from '../../lib/supabase';
import { CategoryManager } from '../categories/CategoryManager';
import { PaymentModeManager } from '../paymentModes/PaymentModeManager';
import { InviteModal } from '../members/InviteModal';
import { TrashManager } from '../trash/TrashManager';
import { Users, Tag, CreditCard, Trash2, Download, LogOut, Shield, Database, ChevronRight, Home } from 'lucide-react';

export const MoreTab = () => {
  const { user, profile, household, userRole, isOwner, logout } = useAuth();
  const { expenses } = useExpenses();

  const [activeSection, setActiveSection] = useState('menu'); // 'menu' | 'members' | 'categories' | 'paymentModes' | 'trash'

  const handleExportAll = () => {
    exportExpensesToCSV(expenses, `Gharkharch_Full_Ledger_Backup.csv`);
  };

  return (
    <div className="space-y-4 pb-32 px-3.5 pt-3.5 max-w-md mx-auto">
      
      {/* USER & HOUSEHOLD HEADER CARD */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-brand-500/20 uppercase overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{profile?.full_name?.charAt(0) || 'U'}</span>
            )}
          </div>

          <div className="flex-1 truncate">
            <h2 className="text-sm font-bold text-white leading-tight truncate">{profile?.full_name || 'User'}</h2>
            <p className="text-xs text-slate-400 truncate">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-semibold text-slate-300 flex items-center gap-1">
                <Home className="w-3 h-3 text-brand-400" />
                {household?.name || 'Household'}
              </span>
              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${
                isOwner
                  ? 'bg-brand-500/20 text-brand-300 border-brand-500/30'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              }`}>
                {userRole}
              </span>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-brand-400" />
            Database Source:
          </span>
          <span className="font-semibold text-slate-200">
            {isSupabaseConfigured ? 'Supabase Live Postgres (RLS Enforced)' : 'Demo Preview Engine'}
          </span>
        </div>
      </div>

      {/* SECTION NAVIGATOR */}
      {activeSection === 'menu' ? (
        <div className="space-y-2">
          
          {/* Option 1: Family Members */}
          <button
            onClick={() => setActiveSection('members')}
            className="w-full glass-panel rounded-xl p-3.5 border border-slate-800 hover:border-slate-700 text-left flex items-center justify-between transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Family Members & Invites</p>
                <p className="text-[10px] text-slate-400">Manage who can log household expenses</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* Option 2: Dynamic Categories */}
          <button
            onClick={() => setActiveSection('categories')}
            className="w-full glass-panel rounded-xl p-3.5 border border-slate-800 hover:border-slate-700 text-left flex items-center justify-between transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Dynamic Categories</p>
                <p className="text-[10px] text-slate-400">Add, edit or archive expense categories</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* Option 3: Dynamic Payment Modes */}
          <button
            onClick={() => setActiveSection('paymentModes')}
            className="w-full glass-panel rounded-xl p-3.5 border border-slate-800 hover:border-slate-700 text-left flex items-center justify-between transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Dynamic Payment Modes</p>
                <p className="text-[10px] text-slate-400">Manage payment options (Cash, UPI, Cards)</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* Option 4: Trash Bin (Owner ONLY) */}
          {isOwner && (
            <button
              onClick={() => setActiveSection('trash')}
              className="w-full glass-panel rounded-xl p-3.5 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-left flex items-center justify-between transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Owner Trash Bin</p>
                  <p className="text-[10px] text-slate-400">Recover soft-deleted expense records</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          )}

          {/* Option 5: Full CSV Ledger Download */}
          <button
            onClick={handleExportAll}
            className="w-full glass-panel rounded-xl p-3.5 border border-slate-800 hover:border-slate-700 text-left flex items-center justify-between transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Download Full CSV Backup</p>
                <p className="text-[10px] text-slate-400">1-click Excel spreadsheet export</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-rose-400 border border-slate-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 mt-4"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

        </div>
      ) : (
        /* SUB-SECTION VIEWS WITH BACK BUTTON */
        <div className="space-y-4">
          <button
            onClick={() => setActiveSection('menu')}
            className="text-xs text-brand-400 hover:underline font-semibold flex items-center gap-1"
          >
            ← Back to More Menu
          </button>

          {activeSection === 'members' && <InviteModal />}
          {activeSection === 'categories' && <CategoryManager />}
          {activeSection === 'paymentModes' && <PaymentModeManager />}
          {activeSection === 'trash' && <TrashManager />}
        </div>
      )}

    </div>
  );
};
