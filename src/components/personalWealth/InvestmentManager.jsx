import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { AddInvestmentModal, INVESTMENT_TYPES } from './AddInvestmentModal';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, Plus, ArrowLeft, ShieldCheck, Coins, Landmark, BarChart2, Edit3, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const InvestmentManager = ({ onBack }) => {
  const { investments, deleteInvestment } = useExpenses();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);

  // Compute portfolio totals
  const totalInvested = investments.reduce((sum, i) => sum + (parseFloat(i.invested_amount) || 0), 0);
  const totalCurrentValue = investments.reduce((sum, i) => sum + (parseFloat(i.current_value) || 0), 0);
  const totalMonthlySip = investments.reduce((sum, i) => sum + (parseFloat(i.monthly_sip_amount) || 0), 0);
  const totalGainLoss = totalCurrentValue - totalInvested;
  const gainLossPct = totalInvested > 0 ? ((totalGainLoss / totalInvested) * 100).toFixed(1) : '0.0';

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete investment record "${name}"?`)) {
      await deleteInvestment(id);
    }
  };

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
              <span>SIPs & Investments</span>
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </h1>
            <p className="text-xs text-slate-400">Track Mutual Funds, SIPs, FDs, Gold, and Net Worth</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingInvestment(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Investment</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Portfolio Value */}
        <div className="col-span-2 glass-panel p-4 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-300">
            <span>Portfolio Market Valuation</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px]">Net Assets</span>
          </div>
          <p className="font-outfit text-3xl font-extrabold text-white tracking-tight">
            {formatCurrency(totalCurrentValue)}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
            <div className="text-slate-400 font-medium">
              Invested: <span className="text-slate-200 font-bold">{formatCurrency(totalInvested)}</span>
            </div>
            <div className={`font-extrabold flex items-center gap-1 ${
              totalGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {totalGainLoss >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)} ({gainLossPct}%)</span>
            </div>
          </div>
        </div>

        {/* Monthly SIP Commitments */}
        <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 bg-slate-900/80">
          <div className="text-[10px] uppercase font-bold text-slate-400">Monthly SIP Auto-Debit</div>
          <p className="font-outfit text-xl font-extrabold text-blue-400 mt-1">
            {formatCurrency(totalMonthlySip)}
          </p>
          <p className="text-[10px] text-slate-500">Auto recurring SIPs</p>
        </div>

        {/* Investment Count */}
        <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 bg-slate-900/80">
          <div className="text-[10px] uppercase font-bold text-slate-400">Active Portfolios</div>
          <p className="font-outfit text-xl font-extrabold text-white mt-1">
            {investments.length}
          </p>
          <p className="text-[10px] text-slate-500">Asset items logged</p>
        </div>
      </div>

      {/* Investments List */}
      {investments.length === 0 ? (
        <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-blue-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">No investments logged yet</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Add your Mutual Fund SIPs, Stocks, FDs, or PPF accounts to monitor your net worth and portfolio growth!
            </p>
          </div>
          <button
            onClick={() => {
              setEditingInvestment(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Investment</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Investment Portfolio</h3>
          {investments.map(item => {
            const assetObj = INVESTMENT_TYPES.find(a => a.id === item.investment_type) || INVESTMENT_TYPES[0];
            const Icon = assetObj.icon;

            const invAmt = parseFloat(item.invested_amount) || 0;
            const curVal = parseFloat(item.current_value) || invAmt;
            const diff = curVal - invAmt;
            const pct = invAmt > 0 ? ((diff / invAmt) * 100).toFixed(1) : '0.0';

            return (
              <div
                key={item.id}
                className="glass-card bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-2.5 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3 truncate">
                    <div className={`p-2.5 rounded-xl border shrink-0 ${assetObj.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-outfit text-sm font-bold text-white truncate">{item.name}</h4>
                      <p className="text-[11px] text-slate-400">{assetObj.name}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-outfit text-base font-extrabold text-white">
                      {formatCurrency(curVal)}
                    </p>
                    <span className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${
                      diff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {diff >= 0 ? '+' : ''}{formatCurrency(diff)} ({pct}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <div className="text-slate-400 text-[11px]">
                    Invested: <span className="text-slate-300 font-semibold">{formatCurrency(invAmt)}</span>
                    {item.monthly_sip_amount > 0 && (
                      <span className="ml-2 text-blue-400 font-semibold">• SIP: ₹{formatCurrency(item.monthly_sip_amount)}/mo</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingInvestment(item);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white rounded transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddInvestmentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingInvestment(null);
        }}
        initialData={editingInvestment}
      />

    </div>
  );
};
