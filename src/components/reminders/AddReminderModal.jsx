import React, { useState, useEffect } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { X, Check, Calendar, IndianRupee, Bell, Tag, ShieldCheck, Car, Laptop, HeartPulse, Zap, FileText } from 'lucide-react';

export const REMINDER_CATEGORIES = [
  { id: 'vehicle_puc', name: 'Vehicle & PUC', icon: Car, color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  { id: 'insurance', name: 'Vehicle Insurance', icon: ShieldCheck, color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  { id: 'software_renewal', name: 'Software & Apps', icon: Laptop, color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
  { id: 'health_mediclaim', name: 'Health & Mediclaim', icon: HeartPulse, color: 'text-rose-400 bg-rose-400/10 border-rose-400/30' },
  { id: 'household_bill', name: 'Bills & Utilities', icon: Zap, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  { id: 'other', name: 'Other Document', icon: FileText, color: 'text-slate-400 bg-slate-400/10 border-slate-400/30' },
];

export const AddReminderModal = ({ isOpen, onClose, initialData = null }) => {
  const { addReminder, updateReminder } = useExpenses();

  const [title, setTitle] = useState('');
  const [categoryType, setCategoryType] = useState('vehicle_puc');
  const [dueDate, setDueDate] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [reminderDaysBefore, setReminderDaysBefore] = useState('7');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setCategoryType(initialData.category_type || 'vehicle_puc');
      setDueDate(initialData.due_date || '');
      setEstimatedCost(initialData.estimated_cost ? initialData.estimated_cost.toString() : '');
      setReminderDaysBefore(initialData.reminder_days_before ? initialData.reminder_days_before.toString() : '7');
      setNotes(initialData.notes || '');
    } else {
      setTitle('');
      setCategoryType('vehicle_puc');
      // Default to 1 month from today for new reminders
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      setDueDate(d.toISOString().split('T')[0]);
      setEstimatedCost('');
      setReminderDaysBefore('7');
      setNotes('');
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter a reminder title (e.g. Car PUC Expiry).');
      return;
    }

    if (!dueDate) {
      setErrorMsg('Please select a valid expiry date.');
      return;
    }

    setSubmitting(true);

    const payload = {
      title,
      category_type: categoryType,
      due_date: dueDate,
      estimated_cost: estimatedCost,
      reminder_days_before: reminderDaysBefore,
      notes,
    };

    let result;
    if (initialData?.id) {
      result = await updateReminder(initialData.id, payload);
    } else {
      result = await addReminder(payload);
    }

    setSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setErrorMsg(result.error || 'Failed to save reminder item.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      
      {/* Modal Bottom Sheet Container */}
      <div className="glass-panel bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto p-5 space-y-4 shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-outfit text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            {initialData ? 'Edit Reminder Item' : 'New Renewal & Expiry Reminder'}
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">Document / Renewal Title *</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Car PUC Certificate, Antivirus License, Mediclaim"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* CATEGORY GRID SELECTOR */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category *</label>
            <div className="grid grid-cols-2 gap-2">
              {REMINDER_CATEGORIES.map(cat => {
                const isSelected = categoryType === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryType(cat.id)}
                    className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                      isSelected
                        ? 'bg-slate-800 text-white border-amber-400 shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border-slate-800'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${cat.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* EXPIRY DUE DATE */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Expiry / Due Date *</label>
            <div className="relative">
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* ESTIMATED COST (₹ INR) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Renewal Cost (₹ INR)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-outfit text-sm font-bold">₹</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00 (e.g. 150 for PUC)"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-sm font-outfit font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* REMINDER ALERT ADVANCE DAYS */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Alert Notification Timing</label>
            <select
              value={reminderDaysBefore}
              onChange={(e) => setReminderDaysBefore(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="3">3 Days Before Expiry</option>
              <option value="7">7 Days Before Expiry (Recommended)</option>
              <option value="15">15 Days Before Expiry</option>
              <option value="30">30 Days Before Expiry</option>
            </select>
          </div>

          {/* OPTIONAL NOTES / POLICY NO */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Notes / Policy No / Reference (Optional)</label>
            <textarea
              rows="2"
              placeholder="e.g. Policy #9823471 or Link: example.com/renew"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>{submitting ? 'Saving...' : initialData ? 'Update Reminder' : 'Save Reminder Item'}</span>
          </button>

        </form>

      </div>
    </div>
  );
};
