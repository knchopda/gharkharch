import React, { useState, useEffect } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { X, Check, Tag, Calendar, CreditCard, Plus, IndianRupee } from 'lucide-react';

export const AddExpenseModal = ({ isOpen, onClose, initialData = null }) => {
  const { activeCategories, activePaymentModes, addExpense, updateExpense } = useExpenses();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const defaultPM = activePaymentModes[0]?.name || 'Cash';
    if (initialData) {
      setAmount(initialData.amount.toString());
      setDescription(initialData.description || '');
      setCategoryId(initialData.category_id || (activeCategories[0]?.id || ''));
      setExpenseDate(initialData.expense_date || new Date().toISOString().split('T')[0]);
      setPaymentMode(initialData.payment_mode || defaultPM);
      setNotes(initialData.notes || '');
    } else {
      setAmount('');
      setDescription('');
      setCategoryId(activeCategories[0]?.id || '');
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setPaymentMode(defaultPM);
      setNotes('');
    }
    setErrorMsg('');
  }, [initialData, isOpen, activeCategories, activePaymentModes]);

  if (!isOpen) return null;

  // Preset Amount Quick Adders
  const addQuickAmount = (val) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMsg('Please enter a valid expense amount.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Please enter where money was spent (e.g. Milk & Eggs).');
      return;
    }

    if (!categoryId) {
      setErrorMsg('Please select a category.');
      return;
    }

    setSubmitting(true);

    const payload = {
      amount,
      description,
      category_id: categoryId,
      expense_date: expenseDate,
      payment_mode: paymentMode,
      notes,
    };

    let result;
    if (initialData?.id) {
      result = await updateExpense(initialData.id, payload);
    } else {
      result = await addExpense(payload);
    }

    setSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setErrorMsg(result.error || 'Failed to save expense.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      
      {/* Modal Bottom Sheet Container */}
      <div className="glass-panel bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto p-5 space-y-4 shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-outfit text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-400" />
            {initialData ? 'Edit Expense Record' : 'Record New Expense'}
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
          
          {/* AMOUNT INPUT + PRESETS */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Amount (₹ INR) *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400 font-outfit text-xl font-bold">₹</span>
              <input
                type="number"
                step="0.01"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border-2 border-brand-500/40 rounded-xl pl-9 pr-4 py-3 text-2xl font-outfit font-extrabold text-white placeholder-slate-600 focus:outline-none focus:border-brand-400 transition-colors"
              />
            </div>

            {/* Quick Chips (+₹50, +₹100, +₹500, +₹1,000) */}
            <div className="flex items-center space-x-1.5 pt-1">
              {[50, 100, 500, 1000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => addQuickAmount(val)}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-brand-300 text-xs font-bold rounded-lg border border-slate-700 transition-all"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Spent On *</label>
            <input
              type="text"
              required
              placeholder="e.g. Milk & Eggs from local dairy"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* CATEGORY GRID SELECTOR */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category *</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
              {activeCategories.map(cat => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`p-2.5 rounded-lg text-xs text-left font-semibold flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow border border-brand-400'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DYNAMIC HOUSEHOLD PAYMENT MODES */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Payment Mode *</label>
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              {activePaymentModes.map(pm => {
                const isSelected = paymentMode === pm.name;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMode(pm.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow border border-brand-400'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <span>{pm.name}</span>
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* EXPENSE DATE */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Date</label>
            <input
              type="date"
              required
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* OPTIONAL NOTES */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Notes (Optional)</label>
            <textarea
              rows="2"
              placeholder="e.g. Purchased with 10% cash discount"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>{submitting ? 'Saving...' : initialData ? 'Update Expense' : 'Save Expense Record'}</span>
          </button>

        </form>

      </div>
    </div>
  );
};
