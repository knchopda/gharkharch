import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatMonthYearHeader, formatDateShort } from '../../utils/formatters';
import { exportExpensesToCSV } from '../../lib/exportUtils';
import { PieChart, TrendingUp, Calendar, Download, Users, Layers, Filter } from 'lucide-react';

export const ReportsView = () => {
  const { members } = useAuth();
  const { expenses, categories, selectedYear, selectedMonth, getFilteredExpenses } = useExpenses();

  const [activeReportTab, setActiveReportTab] = useState('category'); // 'category' | 'member' | 'comparison' | 'custom'
  
  // Custom Date Range State
  const [startDate, setStartDate] = useState(new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const monthlyExpenses = getFilteredExpenses();
  const monthTotal = monthlyExpenses.reduce((sum, item) => sum + Number(item.amount), 0);

  // 1. Category Breakdown
  const categoryTotals = {};
  monthlyExpenses.forEach(exp => {
    const catName = exp.category?.name || 'Uncategorized';
    categoryTotals[catName] = (categoryTotals[catName] || 0) + Number(exp.amount);
  });
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  // 2. Member Breakdown
  const memberTotals = {};
  monthlyExpenses.forEach(exp => {
    const memberName = exp.profile?.full_name || 'Member';
    memberTotals[memberName] = (memberTotals[memberName] || 0) + Number(exp.amount);
  });
  const sortedMembers = Object.entries(memberTotals).sort((a, b) => b[1] - a[1]);

  // 3. Monthly Comparison (Current Month vs Previous Month)
  const prevMonthIndex = selectedMonth === 0 ? 11 : selectedMonth - 1;
  const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;

  const prevMonthExpenses = expenses.filter(exp => {
    const d = new Date(exp.expense_date);
    return d.getFullYear() === prevYear && d.getMonth() === prevMonthIndex;
  });
  const prevMonthTotal = prevMonthExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const monthDiff = monthTotal - prevMonthTotal;

  // 4. Custom Date Range Computation
  const customRangeExpenses = expenses.filter(exp => {
    return exp.expense_date >= startDate && exp.expense_date <= endDate;
  });
  const customRangeTotal = customRangeExpenses.reduce((sum, item) => sum + Number(item.amount), 0);

  // CSV Export Trigger
  const handleExportCSV = () => {
    const filename = `Gharkharch_${formatMonthYearHeader(selectedYear, selectedMonth).replace(' ', '_')}.csv`;
    exportExpensesToCSV(monthlyExpenses, filename);
  };

  return (
    <div className="space-y-4 pb-24 px-4 pt-4 max-w-md mx-auto">
      
      {/* HEADER & CSV EXPORT BUTTON */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-1.5 font-outfit">
            <PieChart className="w-5 h-5 text-brand-400" />
            Household Expense Reports
          </h2>
          <p className="text-xs text-slate-400">
            {formatMonthYearHeader(selectedYear, selectedMonth)} Summary
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow transition-colors flex items-center gap-1.5"
          title="Download Excel CSV Spreadsheet"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* REPORT TABS */}
      <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded-xl text-xs font-semibold border border-slate-800">
        <button
          onClick={() => setActiveReportTab('category')}
          className={`py-2 rounded-lg transition-all ${
            activeReportTab === 'category' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Categories
        </button>

        <button
          onClick={() => setActiveReportTab('member')}
          className={`py-2 rounded-lg transition-all ${
            activeReportTab === 'member' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          By Person
        </button>

        <button
          onClick={() => setActiveReportTab('comparison')}
          className={`py-2 rounded-lg transition-all ${
            activeReportTab === 'comparison' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Compare
        </button>

        <button
          onClick={() => setActiveReportTab('custom')}
          className={`py-2 rounded-lg transition-all ${
            activeReportTab === 'custom' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Custom
        </button>
      </div>

      {/* TAB 1: CATEGORY BREAKDOWN */}
      {activeReportTab === 'category' && (
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-300">Category Expense Share</span>
            <span className="font-outfit font-extrabold text-sm text-white">{formatCurrency(monthTotal)}</span>
          </div>

          {sortedCategories.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-6">No category data recorded for this month.</p>
          ) : (
            <div className="space-y-3">
              {sortedCategories.map(([catName, amt]) => {
                const pct = monthTotal > 0 ? Math.round((amt / monthTotal) * 100) : 0;
                return (
                  <div key={catName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                      <span>{catName}</span>
                      <div className="space-x-1">
                        <span className="text-brand-300">{formatCurrency(amt)}</span>
                        <span className="text-slate-400 text-[10px]">({pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-brand-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PERSON-WISE BREAKDOWN */}
      {activeReportTab === 'member' && (
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-300">Expense Incurred By Member</span>
            <span className="font-outfit font-extrabold text-sm text-white">{formatCurrency(monthTotal)}</span>
          </div>

          {sortedMembers.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-6">No member expenses logged for this month.</p>
          ) : (
            <div className="space-y-3">
              {sortedMembers.map(([memberName, amt]) => {
                const pct = monthTotal > 0 ? Math.round((amt / monthTotal) * 100) : 0;
                return (
                  <div key={memberName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        {memberName}
                      </span>
                      <div className="space-x-1">
                        <span className="text-blue-300">{formatCurrency(amt)}</span>
                        <span className="text-slate-400 text-[10px]">({pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MONTHLY COMPARISON */}
      {activeReportTab === 'comparison' && (
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-4 shadow-xl">
          <div className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
            Month-over-Month Comparison
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400">Previous Month</span>
              <p className="font-outfit font-bold text-sm text-slate-200">
                {formatCurrency(prevMonthTotal)}
              </p>
              <p className="text-[10px] text-slate-500">
                {formatMonthYearHeader(prevYear, prevMonthIndex)}
              </p>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400">Selected Month</span>
              <p className="font-outfit font-bold text-sm text-brand-400">
                {formatCurrency(monthTotal)}
              </p>
              <p className="text-[10px] text-slate-500">
                {formatMonthYearHeader(selectedYear, selectedMonth)}
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-400">Net Difference:</span>
            <span className={`font-bold font-outfit ${monthDiff > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {monthDiff > 0 ? `+${formatCurrency(monthDiff)} (+Spend)` : `${formatCurrency(monthDiff)} (-Savings)`}
            </span>
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOM DATE RANGE REPORT */}
      {activeReportTab === 'custom' && (
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-4 shadow-xl text-xs">
          <div className="font-bold text-slate-300 border-b border-slate-800 pb-2">
            Custom Date Range Summary
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Custom Range Total:</span>
              <span className="font-outfit font-extrabold text-base text-brand-400">
                {formatCurrency(customRangeTotal, true)}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              {customRangeExpenses.length} expense record{customRangeExpenses.length === 1 ? '' : 's'} found
            </p>
          </div>

          <button
            onClick={() => exportExpensesToCSV(customRangeExpenses, `Gharkharch_Report_${startDate}_to_${endDate}.csv`)}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Range CSV</span>
          </button>
        </div>
      )}

    </div>
  );
};
