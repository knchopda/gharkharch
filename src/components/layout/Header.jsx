import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useExpenses } from '../../context/ExpenseContext';
import { formatMonthYearHeader } from '../../utils/formatters';
import { isSupabaseConfigured } from '../../lib/supabase';
import { BookOpen, ChevronLeft, ChevronRight, Home, Shield, Sparkles } from 'lucide-react';

export const Header = () => {
  const { household, userRole } = useAuth();
  const { selectedYear, selectedMonth, navigateMonth } = useExpenses();

  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 text-white px-3.5 py-2.5 pt-safe shadow-lg">
      <div className="max-w-md mx-auto space-y-1.5">
        
        {/* TOP ROW: LOGO & MONTH SWITCHER */}
        <div className="flex items-center justify-between">
          
          {/* Logo & App Title */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-emerald-400 flex items-center justify-center shadow-md shadow-brand-500/30">
              <BookOpen className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-outfit font-extrabold text-base tracking-tight text-white">
                Gharkharch
              </h1>
              {isSupabaseConfigured ? (
                <span title="Supabase Live DB" className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ) : (
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Demo
                </span>
              )}
            </div>
          </div>

          {/* Month Switcher Drawer */}
          <div className="flex items-center bg-slate-900/90 rounded-full border border-slate-800 p-0.5 shadow-inner">
            <button
              onClick={() => navigateMonth('PREV')}
              className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            
            <button 
              onClick={() => navigateMonth('TODAY')}
              className="px-2 py-0.5 text-xs font-bold text-brand-300 hover:text-white transition-colors"
              title="Reset to Current Month"
            >
              {formatMonthYearHeader(selectedYear, selectedMonth)}
            </button>

            <button
              onClick={() => navigateMonth('NEXT')}
              className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* BOTTOM ROW: HOUSEHOLD NAME & ROLE BADGE */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
          <span className="font-medium flex items-center gap-1 truncate text-slate-300">
            <Home className="w-3 h-3 text-brand-400 shrink-0" />
            <span className="truncate">{household?.name || 'My Household'}</span>
          </span>

          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border shrink-0 ${
            userRole === 'owner' 
              ? 'bg-brand-500/20 text-brand-300 border-brand-500/30' 
              : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
          }`}>
            {userRole || 'Member'}
          </span>
        </div>

      </div>
    </header>
  );
};
