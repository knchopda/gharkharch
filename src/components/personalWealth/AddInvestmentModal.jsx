import React, { useState, useEffect } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { X, Check, TrendingUp, ShieldCheck, Coins, Landmark, BarChart2, Bitcoin, FileText } from 'lucide-react';

export const INVESTMENT_TYPES = [
  { id: 'sip', name: 'SIP / Mutual Fund', icon: TrendingUp, color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  { id: 'stocks', name: 'Direct Equity / Stocks', icon: BarChart2, color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
  { id: 'ppf_epf', name: 'PPF / EPF / NPS', icon: ShieldCheck, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  { id: 'fixed_deposit', name: 'Fixed Deposit / RD', icon: Landmark, color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  { id: 'gold', name: 'Gold / Sovereign Bond', icon: Coins, color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
  { id: 'crypto', name: 'Crypto / Digital Asset', icon: Bitcoin, color: 'text-rose-400 bg-rose-400/10 border-rose-400/30' },
];

export const AddInvestmentModal = ({ isOpen, onClose, initialData = null }) => {
  const { addInvestment, updateInvestment } = useExpenses();

  const [name, setName] = useState('');
  const [investmentType, setInvestmentType] = useState('sip');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [monthlySipAmount, setMonthlySipAmount] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setInvestmentType(initialData.investment_type || 'sip');
      setInvestedAmount(initialData.invested_amount ? initialData.invested_amount.toString() : '');
      setCurrentValue(initialData.current_value ? initialData.current_value.toString() : '');
      setMonthlySipAmount(initialData.monthly_sip_amount ? initialData.monthly_sip_amount.toString() : '');
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setInvestmentType('sip');
      setInvestedAmount('');
      setCurrentValue('');
      setMonthlySipAmount('');
      setNotes('');
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter investment name (e.g. Nifty 50 Index Fund).');
      return;
    }

    setSubmitting(true);

    const payload = {
      name,
      investment_type: investmentType,
      invested_amount: investedAmount,
      current_value: currentValue || investedAmount,
      monthly_sip_amount: monthlySipAmount,
      notes,
    };

    let result;
    if (initialData?.id) {
      result = await updateInvestment(initialData.id, payload);
    } else {
      result = await addInvestment(payload);
    }

    setSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setErrorMsg(result.error || 'Failed to save investment.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      
      <div className="glass-panel bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto p-5 space-y-4 shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-outfit text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            {initialData ? 'Edit Investment Entry' : 'Log Investment / SIP'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* INVESTMENT NAME */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Investment Name *</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Parag Parikh Flexi Cap SIP, HDFC Bank FD"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* ASSET TYPE SELECTOR */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Asset Type *</label>
            <div className="grid grid-cols-2 gap-2">
              {INVESTMENT_TYPES.map(asset => {
                const isSelected = investmentType === asset.id;
                const Icon = asset.icon;
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setInvestmentType(asset.id)}
                    className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                      isSelected
                        ? 'bg-slate-800 text-white border-blue-400 shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border-slate-800'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${asset.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{asset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* INVESTED AMOUNT vs CURRENT MARKET VALUE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Invested (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={investedAmount}
                onChange={(e) => setInvestedAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-outfit text-white focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Value (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Market value"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-outfit text-white focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* MONTHLY SIP AMOUNT (OPTIONAL) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Auto SIP Amount (₹ INR)</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 5000 (if recurring SIP)"
              value={monthlySipAmount}
              onChange={(e) => setMonthlySipAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-outfit text-white placeholder-slate-600 focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* OPTIONAL NOTES */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Notes / Folio No (Optional)</label>
            <textarea
              rows="2"
              placeholder="e.g. Folio #8932471 / Maturity Date Oct 2027"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>{submitting ? 'Saving...' : initialData ? 'Update Investment' : 'Save Investment Entry'}</span>
          </button>

        </form>

      </div>
    </div>
  );
};
