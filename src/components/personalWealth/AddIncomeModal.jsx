import React, { useState, useEffect } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { X, Check, DollarSign, Calendar, IndianRupee, Briefcase, Gift, Laptop, TrendingUp, Home, FileText } from 'lucide-react';

export const INCOME_SOURCES = [
  { id: 'salary', name: 'Monthly Salary', icon: Briefcase, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  { id: 'bonus', name: 'Bonus / Incentive', icon: Gift, color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
  { id: 'freelance', name: 'Freelance / Side Gig', icon: Laptop, color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  { id: 'investment_returns', name: 'Dividends & Interest', icon: TrendingUp, color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  { id: 'rental', name: 'Rental Income', icon: Home, color: 'text-teal-400 bg-teal-400/10 border-teal-400/30' },
  { id: 'other', name: 'Other Income', icon: FileText, color: 'text-slate-400 bg-slate-400/10 border-slate-400/30' },
];

export const AddIncomeModal = ({ isOpen, onClose, initialData = null }) => {
  const { addIncome, updateIncome } = useExpenses();

  const [title, setTitle] = useState('');
  const [sourceType, setSourceType] = useState('salary');
  const [amount, setAmount] = useState('');
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setSourceType(initialData.source_type || 'salary');
      setAmount(initialData.amount ? initialData.amount.toString() : '');
      setIncomeDate(initialData.income_date || new Date().toISOString().split('T')[0]);
      setNotes(initialData.notes || '');
    } else {
      setTitle('');
      setSourceType('salary');
      setAmount('');
      setIncomeDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter income title (e.g. Monthly Net Salary).');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMsg('Please enter a valid income amount greater than 0.');
      return;
    }

    setSubmitting(true);

    const payload = {
      title,
      source_type: sourceType,
      amount,
      income_date: incomeDate,
      notes,
    };

    let result;
    if (initialData?.id) {
      result = await updateIncome(initialData.id, payload);
    } else {
      result = await addIncome(payload);
    }

    setSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setErrorMsg(result.error || 'Failed to save income record.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      
      <div className="glass-panel bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto p-5 space-y-4 shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-outfit text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            {initialData ? 'Edit Salary / Income Record' : 'Record Salary / Income'}
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
          
          {/* AMOUNT INPUT */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Income Amount (₹ INR) *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-outfit text-xl font-bold">₹</span>
              <input
                type="number"
                step="0.01"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border-2 border-emerald-500/40 rounded-xl pl-9 pr-4 py-3 text-2xl font-outfit font-extrabold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          {/* TITLE INPUT */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Title / Description *</label>
            <input
              type="text"
              required
              placeholder="e.g. September Salary Credit, Q3 Bonus"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          {/* SOURCE TYPE SELECTOR GRID */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Income Category *</label>
            <div className="grid grid-cols-2 gap-2">
              {INCOME_SOURCES.map(source => {
                const isSelected = sourceType === source.id;
                const Icon = source.icon;
                return (
                  <button
                    key={source.id}
                    type="button"
                    onClick={() => setSourceType(source.id)}
                    className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                      isSelected
                        ? 'bg-slate-800 text-white border-emerald-400 shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border-slate-800'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${source.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{source.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* INCOME DATE */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Income Credit Date *</label>
            <input
              type="date"
              required
              value={incomeDate}
              onChange={(e) => setIncomeDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* OPTIONAL NOTES */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Notes / Payslip Ref (Optional)</label>
            <textarea
              rows="2"
              placeholder="e.g. Net in-hand after EPF & Tax deductions"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 resize-none"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>{submitting ? 'Saving...' : initialData ? 'Update Income Record' : 'Save Income Record'}</span>
          </button>

        </form>

      </div>
    </div>
  );
};
