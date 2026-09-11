import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { AddIncomeModal, INCOME_SOURCES } from './AddIncomeModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Briefcase, Plus, ArrowLeft, TrendingUp, Calendar, Trash2, Edit3, DollarSign, Award, ChevronRight } from 'lucide-react';

export const IncomeManager = ({ onBack }) => {
  const { incomes, deleteIncome } = useExpenses();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  // Compute stats
  const totalIncomeAllTime = incomes.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
  const salaryIncomes = incomes.filter(i => i.source_type === 'salary');
  const latestSalary = salaryIncomes.length > 0 ? parseFloat(salaryIncomes[0].amount) : 0;

  // Compute Salary Growth Trend (Group by Month & Year)
  const monthlySalaryMap = {};
  incomes.forEach(inc => {
    const date = new Date(inc.income_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    if (!monthlySalaryMap[key]) {
      monthlySalaryMap[key] = { label, key, total: 0 };
    }
    monthlySalaryMap[key].total += parseFloat(inc.amount) || 0;
  });

  const salaryTrends = Object.values(monthlySalaryMap)
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(-6); // Last 6 months

  const maxMonthTotal = Math.max(...salaryTrends.map(t => t.total), 1);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete income entry "${title}"?`)) {
      await deleteIncome(id);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="font-outfit text-xl font-bold text-white flex items-center gap-2">
              <span>Salary & Income Register</span>
              <Briefcase className="w-5 h-5 text-emerald-400" />
            </h1>
            <p className="text-xs text-slate-400">Track salary growth, hikes, and side income credits</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingIncome(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Income</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 bg-slate-900/80">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            Latest In-Hand Salary
          </div>
          <p className="font-outfit text-2xl font-extrabold text-emerald-400 mt-1">
            {formatCurrency(latestSalary)}
          </p>
          <p className="text-[10px] text-slate-400">Net take-home salary credit</p>
        </div>

        <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 bg-slate-900/80">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-teal-400" />
            Total Earnings Logged
          </div>
          <p className="font-outfit text-2xl font-extrabold text-white mt-1">
            {formatCurrency(totalIncomeAllTime)}
          </p>
          <p className="text-[10px] text-slate-400">{incomes.length} credit record(s)</p>
        </div>
      </div>

      {/* SALARY GROWTH & INCOME TREND VISUAL GRAPH */}
      {salaryTrends.length > 0 && (
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Salary & Income Growth Trend
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Last {salaryTrends.length} Months</span>
          </div>

          {/* Bar Chart Visual */}
          <div className="flex items-end justify-between gap-2 h-32 pt-4 px-2 border-b border-slate-800/80 pb-2">
            {salaryTrends.map(trend => {
              const heightPct = Math.round((trend.total / maxMonthTotal) * 100);
              return (
                <div key={trend.key} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[9px] font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{Math.round(trend.total / 1000)}k
                  </span>
                  <div className="w-full max-w-[28px] bg-slate-800 rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                    <div
                      className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg transition-all duration-500 shadow-md shadow-emerald-500/20"
                      style={{ height: `${Math.max(heightPct, 8)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 truncate">{trend.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Incomes List */}
      {incomes.length === 0 ? (
        <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-emerald-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">No salary or income records yet</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Add your monthly take-home salary, bonus, or freelance credits to track your income growth over time!
            </p>
          </div>
          <button
            onClick={() => {
              setEditingIncome(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Record First Salary</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Income Ledger</h3>
          {incomes.map(item => {
            const sourceObj = INCOME_SOURCES.find(s => s.id === item.source_type) || INCOME_SOURCES[5];
            const Icon = sourceObj.icon;

            return (
              <div
                key={item.id}
                className="glass-card bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 flex items-center justify-between transition-all"
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${sourceObj.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h4 className="font-outfit text-sm font-bold text-white truncate">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <span>{sourceObj.name}</span>
                      <span>•</span>
                      <span>{formatDate(item.income_date)}</span>
                    </p>
                    {item.notes && <p className="text-[10px] text-slate-500 truncate mt-0.5">{item.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <p className="font-outfit text-sm font-extrabold text-emerald-400">
                    +{formatCurrency(item.amount)}
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingIncome(item);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddIncomeModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingIncome(null);
        }}
        initialData={editingIncome}
      />

    </div>
  );
};
