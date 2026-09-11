import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/formatters';
import { PieChart, Sliders, ArrowLeft, Check, AlertCircle, ShieldAlert, Tag, Save, Info } from 'lucide-react';

export const BudgetRuleManager = ({ onBack }) => {
  const { 
    incomes, 
    expenses, 
    categories, 
    categoryBudgets, 
    setCategoryBudget, 
    budgetRatioSettings, 
    updateBudgetRatioSettings,
    getFilteredExpenses 
  } = useExpenses();

  const [needsPct, setNeedsPct] = useState(budgetRatioSettings?.needs_pct || 50);
  const [wantsPct, setWantsPct] = useState(budgetRatioSettings?.wants_pct || 30);
  const [savingsPct, setSavingsPct] = useState(budgetRatioSettings?.savings_pct || 20);

  const [savingRatios, setSavingRatios] = useState(false);
  const [ratioMsg, setRatioMsg] = useState({ text: '', type: '' });

  // Category Limit Edit State
  const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id || '');
  const [limitInput, setLimitInput] = useState('');
  const [savingCap, setSavingCap] = useState(false);

  // Compute total monthly income
  const totalMonthlyIncome = incomes.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
  const monthlyExpenses = getFilteredExpenses();

  // Dynamic Ratio Calculations
  const calculatedNeedsVal = (totalMonthlyIncome * needsPct) / 100;
  const calculatedWantsVal = (totalMonthlyIncome * wantsPct) / 100;
  const calculatedSavingsVal = (totalMonthlyIncome * savingsPct) / 100;

  const sumPct = parseInt(needsPct || 0) + parseInt(wantsPct || 0) + parseInt(savingsPct || 0);

  const handleSaveRatios = async (e) => {
    e.preventDefault();
    setRatioMsg({ text: '', type: '' });

    if (sumPct !== 100) {
      setRatioMsg({ text: `Percentages must total exactly 100%! (Current: ${sumPct}%)`, type: 'error' });
      return;
    }

    setSavingRatios(true);
    const res = await updateBudgetRatioSettings({
      needs_pct: needsPct,
      wants_pct: wantsPct,
      savings_pct: savingsPct,
    });
    setSavingRatios(false);

    if (res.success) {
      setRatioMsg({ text: 'Budget ratios updated successfully!', type: 'success' });
    } else {
      setRatioMsg({ text: res.error || 'Failed to update budget ratios.', type: 'error' });
    }
  };

  const handleSaveCategoryCap = async (e) => {
    e.preventDefault();
    if (!selectedCatId) return;

    setSavingCap(true);
    await setCategoryBudget(selectedCatId, limitInput);
    setSavingCap(false);
    setLimitInput('');
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Header */}
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
              <span>Dynamic Budget Rules</span>
              <PieChart className="w-5 h-5 text-teal-400" />
            </h1>
            <p className="text-xs text-slate-400">Customizable budget ratios and category spending caps</p>
          </div>
        </div>
      </div>

      {/* DYNAMIC RATIOS CUSTOMIZATION CARD */}
      <div className="glass-panel p-4 rounded-2xl border border-teal-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/40 shadow-xl space-y-4">
        
        <div className="flex items-center justify-between">
          <h3 className="font-outfit text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-400" />
            <span>Customize Your Budget Allocation Ratios</span>
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            sumPct === 100 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          }`}>
            Total: {sumPct}%
          </span>
        </div>

        {ratioMsg.text && (
          <div className={`p-2.5 rounded-xl text-xs ${
            ratioMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
          }`}>
            {ratioMsg.text}
          </div>
        )}

        <form onSubmit={handleSaveRatios} className="space-y-3">
          
          {/* Sliders Grid */}
          <div className="space-y-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
            
            {/* Needs Ratio */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-emerald-400">Needs (Rent, Groceries, PUC, Utilities):</span>
                <span className="text-white font-bold">{needsPct}% → {formatCurrency(calculatedNeedsVal)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={needsPct}
                onChange={(e) => setNeedsPct(e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Wants Ratio */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-purple-400">Wants (Dining out, Shopping, Subscriptions):</span>
                <span className="text-white font-bold">{wantsPct}% → {formatCurrency(calculatedWantsVal)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={wantsPct}
                onChange={(e) => setWantsPct(e.target.value)}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Savings Ratio */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-blue-400">Savings & Investments (SIPs, FDs, PPF):</span>
                <span className="text-white font-bold">{savingsPct}% → {formatCurrency(calculatedSavingsVal)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={savingsPct}
                onChange={(e) => setSavingsPct(e.target.value)}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={savingRatios || sumPct !== 100}
            className="w-full py-2.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{savingRatios ? 'Saving Ratios...' : 'Save Dynamic Ratios'}</span>
          </button>

        </form>

      </div>

      {/* CATEGORY SPENDING LIMIT CAPS */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
        
        <h3 className="font-outfit text-sm font-bold text-white flex items-center gap-2">
          <Tag className="w-4 h-4 text-brand-400" />
          <span>Category Monthly Spending Caps</span>
        </h3>

        {/* Set Cap Form */}
        <form onSubmit={handleSaveCategoryCap} className="flex items-center gap-2">
          <select
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-400"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Limit ₹ (e.g. 5000)"
            value={limitInput}
            onChange={(e) => setLimitInput(e.target.value)}
            className="w-32 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-outfit font-bold text-white focus:outline-none focus:border-brand-400"
          />

          <button
            type="submit"
            disabled={savingCap}
            className="px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition-all shrink-0"
          >
            Set Cap
          </button>
        </form>

        {/* Configured Category Caps List */}
        {categoryBudgets.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-2">No category caps set yet. Set a monthly limit above!</p>
        ) : (
          <div className="space-y-3 pt-1">
            {categoryBudgets.map(bud => {
              const cat = categories.find(c => c.id === bud.category_id);
              if (!cat) return null;

              // Compute spend for this category in current month
              const spent = monthlyExpenses
                .filter(e => e.category_id === cat.id)
                .reduce((sum, e) => sum + Number(e.amount), 0);

              const limit = parseFloat(bud.monthly_limit) || 1;
              const pct = Math.round((spent / limit) * 100);

              let badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
              let barClass = 'bg-gradient-to-r from-emerald-500 to-teal-400';

              if (pct >= 100) {
                badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                barClass = 'bg-gradient-to-r from-rose-600 to-red-500';
              } else if (pct >= 80) {
                badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                barClass = 'bg-gradient-to-r from-amber-500 to-orange-400';
              }

              return (
                <div key={bud.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{cat.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                      {pct >= 100 ? '🔴 Cap Exceeded!' : `${pct}% Used`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Spent: <strong className="text-white">{formatCurrency(spent)}</strong></span>
                    <span>Cap: <strong className="text-slate-300">{formatCurrency(limit)}</strong></span>
                  </div>

                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${barClass}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
