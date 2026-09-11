import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useExpenses } from '../../context/ExpenseContext';
import { IncomeManager } from './IncomeManager';
import { InvestmentManager } from './InvestmentManager';
import { SavingsGoalManager } from './SavingsGoalManager';
import { BudgetRuleManager } from './BudgetRuleManager';
import { formatCurrency, formatMonthYearHeader } from '../../utils/formatters';
import { 
  Lock, 
  Briefcase, 
  TrendingUp, 
  Target, 
  PieChart, 
  ChevronRight, 
  ArrowLeft, 
  ShieldCheck, 
  Wallet, 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownRight,
  Sliders
} from 'lucide-react';

export const WealthDashboard = ({ onBack }) => {
  const { isOwner } = useAuth();
  const { 
    incomes, 
    investments, 
    savingsGoals, 
    expenses, 
    selectedYear, 
    selectedMonth, 
    getFilteredExpenses,
    budgetRatioSettings 
  } = useExpenses();

  const [activeTab, setActiveTab] = useState('hub'); // 'hub' | 'income' | 'investments' | 'goals' | 'budgetRules'

  // Security Check: Gated strictly to Household Owner
  if (!isOwner) {
    return (
      <div className="glass-panel p-8 text-center rounded-2xl border border-rose-500/30 bg-rose-500/10 space-y-3 text-white">
        <Lock className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="font-outfit text-base font-bold">Access Restricted</h2>
        <p className="text-xs text-slate-300 max-w-xs mx-auto">
          The Personal Wealth & Salary Suite is 100% private and exclusively accessible by the Household Owner.
        </p>
      </div>
    );
  }

  // Monthly Expenses Total
  const monthlyExpenses = getFilteredExpenses();
  const totalMonthlySpend = monthlyExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // Monthly Income Total
  const totalMonthlyIncome = incomes.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

  // Net Monthly Cashflow = Income - Spend
  const netMonthlySavings = totalMonthlyIncome - totalMonthlySpend;

  // Total Portfolio Valuation
  const totalPortfolioValue = investments.reduce((sum, i) => sum + (parseFloat(i.current_value) || 0), 0);

  // Total Saved Goals
  const totalSavedGoals = savingsGoals.reduce((sum, g) => sum + (parseFloat(g.current_amount) || 0), 0);

  // Total Net Worth = Investments + Goal Savings
  const totalNetWorth = totalPortfolioValue + totalSavedGoals;

  if (activeTab === 'income') return <IncomeManager onBack={() => setActiveTab('hub')} />;
  if (activeTab === 'investments') return <InvestmentManager onBack={() => setActiveTab('hub')} />;
  if (activeTab === 'goals') return <SavingsGoalManager onBack={() => setActiveTab('hub')} />;
  if (activeTab === 'budgetRules') return <BudgetRuleManager onBack={() => setActiveTab('hub')} />;

  return (
    <div className="space-y-4 pb-20">
      
      {/* Top Header */}
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
              <span>My Wealth & Salary Suite</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              100% Owner Private & Confidential
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
          Owner Secured
        </span>
      </div>

      {/* EXECUTIVE NET WORTH HERO CARD */}
      <div className="glass-panel rounded-2xl p-4 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border border-emerald-500/40 shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
          <span>Personal Net Worth & Investments</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">Total Assets</span>
        </div>

        <div>
          <p className="font-outfit text-3xl font-extrabold text-white tracking-tight">
            {formatCurrency(totalNetWorth)}
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Investments ({formatCurrency(totalPortfolioValue)}) + Goal Savings ({formatCurrency(totalSavedGoals)})
          </p>
        </div>

        {/* Real-time Net Cashflow Meter */}
        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="text-slate-400">
            {formatMonthYearHeader(selectedYear, selectedMonth)} Income: <span className="text-emerald-400 font-bold">+{formatCurrency(totalMonthlyIncome)}</span>
          </div>
          <div className={`font-bold flex items-center gap-1 ${
            netMonthlySavings >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {netMonthlySavings >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>Net Saved: {formatCurrency(netMonthlySavings)}</span>
          </div>
        </div>
      </div>

      {/* WEALTH MODULES NAVIGATION GRID */}
      <div className="grid grid-cols-1 gap-2.5">
        
        {/* Module 1: Salary & Income Register */}
        <button
          onClick={() => setActiveTab('income')}
          className="w-full glass-panel rounded-2xl p-4 border border-slate-800 hover:border-emerald-500/40 text-left flex items-center justify-between transition-all bg-slate-900/80 hover:bg-slate-900"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-outfit text-sm font-bold text-white">Salary & Income Register</h3>
              <p className="text-[11px] text-slate-400">Track salary growth, hikes, bonuses & income trends</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        {/* Module 2: SIPs & Investment Portfolio */}
        <button
          onClick={() => setActiveTab('investments')}
          className="w-full glass-panel rounded-2xl p-4 border border-slate-800 hover:border-blue-500/40 text-left flex items-center justify-between transition-all bg-slate-900/80 hover:bg-slate-900"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-outfit text-sm font-bold text-white">SIPs & Investment Portfolio</h3>
              <p className="text-[11px] text-slate-400">Mutual funds, Stocks, FDs, PPF & net worth log</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        {/* Module 3: Personal Savings Targets */}
        <button
          onClick={() => setActiveTab('goals')}
          className="w-full glass-panel rounded-2xl p-4 border border-slate-800 hover:border-purple-500/40 text-left flex items-center justify-between transition-all bg-slate-900/80 hover:bg-slate-900"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-outfit text-sm font-bold text-white">Savings Target Goals</h3>
              <p className="text-[11px] text-slate-400">Emergency fund, laptop upgrade & savings progress</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        {/* Module 4: Dynamic Budget Rules & Category Caps */}
        <button
          onClick={() => setActiveTab('budgetRules')}
          className="w-full glass-panel rounded-2xl p-4 border border-slate-800 hover:border-teal-500/40 text-left flex items-center justify-between transition-all bg-slate-900/80 hover:bg-slate-900"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-outfit text-sm font-bold text-white">Dynamic Budget Rules</h3>
                <span className="px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 text-[9px] font-bold border border-teal-500/30">
                  {budgetRatioSettings?.needs_pct}/{budgetRatioSettings?.wants_pct}/{budgetRatioSettings?.savings_pct} Custom
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Custom ratio sliders & category spending caps</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

      </div>

    </div>
  );
};
