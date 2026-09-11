import React, { useState, useEffect } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { X, Check, Target, Calendar, Shield, Laptop, Car, Home, Plane, HeartPulse } from 'lucide-react';

export const AddGoalModal = ({ isOpen, onClose, initialData = null }) => {
  const { addSavingsGoal, updateSavingsGoal } = useExpenses();

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState('active');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setTargetAmount(initialData.target_amount ? initialData.target_amount.toString() : '');
      setCurrentAmount(initialData.current_amount ? initialData.current_amount.toString() : '0');
      setTargetDate(initialData.target_date || '');
      setStatus(initialData.status || 'active');
    } else {
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('0');
      setTargetDate('');
      setStatus('active');
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter goal title (e.g. Emergency Reserve Fund).');
      return;
    }

    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      setErrorMsg('Please enter a valid target amount.');
      return;
    }

    setSubmitting(true);

    const payload = {
      title,
      target_amount: targetAmount,
      current_amount: currentAmount,
      target_date: targetDate,
      status,
    };

    let result;
    if (initialData?.id) {
      result = await updateSavingsGoal(initialData.id, payload);
    } else {
      result = await addSavingsGoal(payload);
    }

    setSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setErrorMsg(result.error || 'Failed to save savings goal.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      
      <div className="glass-panel bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto p-5 space-y-4 shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-outfit text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            {initialData ? 'Edit Savings Target Goal' : 'Create Savings Goal Target'}
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
          
          {/* TITLE INPUT */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Goal Target Title *</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Emergency Reserve Fund, New Laptop, Buy Bike"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>

          {/* TARGET vs CURRENT SAVED */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="100000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-outfit font-bold text-white focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Saved (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-outfit text-purple-400 font-bold focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* TARGET DATE */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Completion Date (Optional)</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* STATUS SELECTOR */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
            >
              <option value="active">🟢 Active Goal</option>
              <option value="achieved">🎉 Goal Achieved!</option>
              <option value="paused">⏸️ Paused</option>
            </select>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>{submitting ? 'Saving...' : initialData ? 'Update Goal' : 'Create Savings Target'}</span>
          </button>

        </form>

      </div>
    </div>
  );
};
