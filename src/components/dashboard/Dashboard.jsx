import React from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatCurrency, formatMonthYearHeader, formatDateShort } from '../../utils/formatters';
import { Wallet, Calendar, TrendingUp, Plus, ArrowUpRight, Tag } from 'lucide-react';

export const Dashboard = ({ onOpenAddModal, onNavigateToLedger }) => {
  const { expenses, categories, selectedYear, selectedMonth, getFilteredExpenses } = useExpenses();

  const monthlyExpenses = getFilteredExpenses();

  // 1. Current Month Total
  const currentMonthTotal = monthlyExpenses.reduce((sum, item) => sum + Number(item.amount), 0);

  // 2. Today's Spend
  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpenses = monthlyExpenses.filter(item => item.expense_date === todayStr);
  const todayTotal = todayExpenses.reduce((sum, item) => sum + Number(item.amount), 0);

  // 3. Category Breakdown Calculation
  const categoryTotals = {};
  monthlyExpenses.forEach(exp => {
    const catName = exp.category?.name || 'Uncategorized';
    categoryTotals[catName] = (categoryTotals[catName] || 0) + Number(exp.amount);
  });

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Top 5 categories

  // 4. Recent Expenses
  const recentExpenses = [...monthlyExpenses].slice(0, 5);

  return (
    <div className="space-y-4 pb-32 px-3.5 pt-3.5 max-w-md mx-auto">
      
      {/* EXECUTIVE STATS CARDS */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Card 1: Current Month Total */}
        <div className="col-span-2 glass-panel rounded-2xl p-4 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950/50 border border-brand-500/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Wallet className="w-28 h-28 text-brand-400" />
          </div>
          <div className="space-y-1 relative z-10">
            <div className="flex items-center justify-between text-xs font-semibold text-brand-300">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatMonthYearHeader(selectedYear, selectedMonth)}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[10px]">Total Spend</span>
            </div>
            <p className="font-outfit text-3xl font-extrabold text-white tracking-tight pt-1">
              {formatCurrency(currentMonthTotal, true)}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              {monthlyExpenses.length} expense record{monthlyExpenses.length === 1 ? '' : 's'} logged this month
            </p>
          </div>
        </div>

        {/* Card 2: Today's Spend */}
        <div className="glass-panel rounded-2xl p-3.5 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Today's Spend</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <p className="font-outfit text-xl font-bold text-emerald-400">
            {formatCurrency(todayTotal)}
          </p>
          <p className="text-[10px] text-slate-500 font-medium">
            {todayExpenses.length} transaction{todayExpenses.length === 1 ? '' : 's'} today
          </p>
        </div>

        {/* Card 3: Quick Add Action Card */}
        <button
          onClick={onOpenAddModal}
          className="glass-panel rounded-2xl p-3.5 border border-brand-500/30 bg-brand-600/10 hover:bg-brand-600/20 active:scale-95 transition-all text-left flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-brand-300 text-xs font-semibold">
            <span>Add Expense</span>
            <Plus className="w-4 h-4 text-brand-300" />
          </div>
          <p className="text-xs font-bold text-white pt-2">
            Record Spend →
          </p>
          <p className="text-[10px] text-slate-400">Takes only 3 seconds</p>
        </button>

      </div>

      {/* TOP SPENDING CATEGORIES */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-brand-400" />
            Top Category Summary
          </h2>
          <span className="text-[10px] text-slate-400 font-medium">Monthly Breakdown</span>
        </div>

        {sortedCategories.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-4">No expenses recorded for this month yet.</p>
        ) : (
          <div className="space-y-2.5 pt-1">
            {sortedCategories.map(([catName, amount]) => {
              const percentage = currentMonthTotal > 0 ? Math.round((amount / currentMonthTotal) * 100) : 0;
              return (
                <div key={catName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200 truncate">{catName}</span>
                    <div className="space-x-1.5 font-medium">
                      <span className="text-white font-bold">{formatCurrency(amount)}</span>
                      <span className="text-slate-400 text-[10px]">({percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-brand-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-white">Recent Transactions</h2>
          <button
            onClick={onNavigateToLedger}
            className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-0.5"
          >
            <span>View Full Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-xs text-slate-400">Your digital expense book is empty for this month.</p>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow transition-colors"
            >
              + Record First Expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recentExpenses.map((exp) => (
              <div key={exp.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-3 truncate">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-brand-400 shrink-0">
                    <Tag className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-white truncate">{exp.description}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                      <span>{exp.category?.name || 'General'}</span>
                      <span>•</span>
                      <span>{formatDateShort(exp.expense_date)}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-rose-400">-{formatCurrency(exp.amount)}</p>
                  <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {exp.payment_mode || 'Cash'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
