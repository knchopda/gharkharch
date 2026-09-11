import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { AddReminderModal, REMINDER_CATEGORIES } from './AddReminderModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { 
  Bell, 
  Plus, 
  Search, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Share2, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  ArrowLeft,
  Calendar,
  ExternalLink,
  IndianRupee,
  ShieldAlert
} from 'lucide-react';

export const ReminderManager = ({ onBack }) => {
  const { reminders, deleteReminder, renewReminder } = useExpenses();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'OVERDUE' | 'DUE_SOON' | 'ACTIVE'

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Renew Confirmation Modal State
  const [renewingItem, setRenewingItem] = useState(null);
  const [renewYears, setRenewYears] = useState(1);
  const [autoLogExpense, setAutoLogExpense] = useState(true);
  const [renewSubmitting, setRenewSubmitting] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Helper to compute countdown status
  const getCountdownStatus = (dueDateStr) => {
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        type: 'OVERDUE',
        label: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}!`,
        badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        icon: AlertTriangle,
      };
    } else if (diffDays <= 7) {
      return {
        type: 'DUE_SOON',
        label: diffDays === 0 ? 'Expires Today!' : `Expires in ${diffDays} day${diffDays === 1 ? '' : 's'}!`,
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        icon: Clock,
      };
    } else {
      return {
        type: 'ACTIVE',
        label: `Expires in ${diffDays} days`,
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        icon: CheckCircle2,
      };
    }
  };

  // Filtered List
  const filteredReminders = reminders.filter(item => {
    const status = getCountdownStatus(item.due_date);

    if (filterTab === 'OVERDUE' && status.type !== 'OVERDUE') return false;
    if (filterTab === 'DUE_SOON' && status.type !== 'DUE_SOON') return false;
    if (filterTab === 'ACTIVE' && status.type !== 'ACTIVE') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = item.title.toLowerCase().includes(q);
      const notesMatch = item.notes ? item.notes.toLowerCase().includes(q) : false;
      return titleMatch || notesMatch;
    }

    return true;
  });

  // Calculate summary counts
  const overdueCount = reminders.filter(r => getCountdownStatus(r.due_date).type === 'OVERDUE').length;
  const dueSoonCount = reminders.filter(r => getCountdownStatus(r.due_date).type === 'DUE_SOON').length;
  const totalCost = reminders.reduce((sum, r) => sum + (parseFloat(r.estimated_cost) || 0), 0);

  // WhatsApp Share Helper
  const handleShareWhatsApp = (item) => {
    const status = getCountdownStatus(item.due_date);
    const catObj = REMINDER_CATEGORIES.find(c => c.id === item.category_type) || REMINDER_CATEGORIES[5];
    
    const message = `🔔 *Gharkharch Expiry Alert*\n\n` +
      `📌 *Item:* ${item.title}\n` +
      `📂 *Category:* ${catObj.name}\n` +
      `📅 *Due Date:* ${formatDate(item.due_date)}\n` +
      `⏳ *Status:* ${status.label}\n` +
      (item.estimated_cost > 0 ? `💰 *Est. Cost:* ₹${formatCurrency(item.estimated_cost)}\n` : '') +
      (item.notes ? `📝 *Notes:* ${item.notes}\n` : '') +
      `\nSent via Gharkharch Household App 🏠`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Open Renew Modal
  const handleOpenRenew = (item) => {
    setRenewingItem(item);
    setRenewYears(1);
    setAutoLogExpense(true);
  };

  const handleConfirmRenew = async () => {
    if (!renewingItem) return;
    setRenewSubmitting(true);
    await renewReminder(renewingItem.id, renewYears, autoLogExpense);
    setRenewSubmitting(false);
    setRenewingItem(null);
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete reminder for "${title}"?`)) {
      await deleteReminder(id);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Top Header Bar */}
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
              <span>Renewals & Reminders</span>
              <Bell className="w-5 h-5 text-amber-400" />
            </h1>
            <p className="text-xs text-slate-400">Track PUC, Insurance, Software, and Mediclaim expirations</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        
        {/* Total Active */}
        <div className="glass-card p-3 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Items</div>
          <div className="font-outfit text-xl font-extrabold text-white mt-0.5">{reminders.length}</div>
        </div>

        {/* Overdue Alert */}
        <div className={`glass-card p-3 rounded-xl border transition-all ${
          overdueCount > 0 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1">
            <span>Overdue</span>
            {overdueCount > 0 && <AlertTriangle className="w-3 h-3 text-rose-400" />}
          </div>
          <div className="font-outfit text-xl font-extrabold text-rose-400 mt-0.5">{overdueCount}</div>
        </div>

        {/* Due Soon (<7 days) */}
        <div className={`glass-card p-3 rounded-xl border transition-all ${
          dueSoonCount > 0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
            <span>Due &lt; 7 Days</span>
            {dueSoonCount > 0 && <Clock className="w-3 h-3 text-amber-400" />}
          </div>
          <div className="font-outfit text-xl font-extrabold text-amber-400 mt-0.5">{dueSoonCount}</div>
        </div>

      </div>

      {/* Search Bar & Filter Pills */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search PUC, Insurance, Antivirus, Policy No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all ${
              filterTab === 'ALL'
                ? 'bg-slate-800 text-white border-amber-400'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'
            }`}
          >
            All ({reminders.length})
          </button>
          <button
            onClick={() => setFilterTab('OVERDUE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all ${
              filterTab === 'OVERDUE'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                : 'bg-slate-950 text-rose-400/80 border-slate-800 hover:bg-slate-900'
            }`}
          >
            🔴 Overdue ({overdueCount})
          </button>
          <button
            onClick={() => setFilterTab('DUE_SOON')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all ${
              filterTab === 'DUE_SOON'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-950 text-amber-400/80 border-slate-800 hover:bg-slate-900'
            }`}
          >
            🟠 Due Soon ({dueSoonCount})
          </button>
          <button
            onClick={() => setFilterTab('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all ${
              filterTab === 'ACTIVE'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-950 text-emerald-400/80 border-slate-800 hover:bg-slate-900'
            }`}
          >
            🟢 Safe / Active
          </button>
        </div>
      </div>

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
            <Bell className="w-6 h-6 text-amber-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">No reminders found</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Add your vehicle PUC, insurance policies, antivirus licenses, or mediclaim due dates to get automatic reminders!
            </p>
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Reminder</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReminders.map(item => {
            const status = getCountdownStatus(item.due_date);
            const catObj = REMINDER_CATEGORIES.find(c => c.id === item.category_type) || REMINDER_CATEGORIES[5];
            const Icon = catObj.icon;
            const StatusIcon = status.icon;

            return (
              <div
                key={item.id}
                className="glass-card bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-3 transition-all shadow-lg"
              >
                {/* Card Top: Category Icon + Title + Countdown Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl border shrink-0 ${catObj.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-outfit text-sm font-bold text-white">{item.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>Due: {formatDate(item.due_date)}</span>
                        </span>
                        {item.estimated_cost > 0 && (
                          <span className="font-outfit font-semibold text-slate-300">
                            • ₹{formatCurrency(item.estimated_cost)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Countdown Badge */}
                  <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 shrink-0 ${status.badgeClass}`}>
                    <StatusIcon className="w-3 h-3" />
                    <span>{status.label}</span>
                  </div>
                </div>

                {/* Notes Snippet if present */}
                {item.notes && (
                  <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80 text-xs text-slate-300">
                    <span className="text-slate-500 font-semibold">Notes: </span>
                    {item.notes}
                  </div>
                )}

                {/* Card Actions Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  
                  {/* Left Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* 1-Click Renew Button */}
                    <button
                      onClick={() => handleOpenRenew(item)}
                      className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-semibold flex items-center gap-1 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Renew</span>
                    </button>

                    {/* WhatsApp Share Button */}
                    <button
                      onClick={() => handleShareWhatsApp(item)}
                      className="px-2.5 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg font-semibold flex items-center gap-1 transition-all"
                      title="Share alert on WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  {/* Right Action Buttons: Edit & Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit reminder"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete reminder"
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

      {/* Add / Edit Modal */}
      <AddReminderModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        initialData={editingItem}
      />

      {/* 1-Click Renew Confirmation Dialog */}
      {renewingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl text-white">
            
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <RefreshCw className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-outfit text-base font-bold">Renew Document</h3>
                <p className="text-xs text-slate-400 truncate">{renewingItem.title}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Advance Next Due Date By:</label>
                <select
                  value={renewYears}
                  onChange={(e) => setRenewYears(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value={1}>+1 Year (Recommended for PUC/Insurance)</option>
                  <option value={0.5}>+6 Months</option>
                  <option value={0.0833}>+1 Month</option>
                </select>
              </div>

              {renewingItem.estimated_cost > 0 && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={autoLogExpense}
                      onChange={(e) => setAutoLogExpense(e.target.checked)}
                      className="w-4 h-4 rounded accent-emerald-500"
                    />
                    <span className="font-semibold">Auto-log ₹{formatCurrency(renewingItem.estimated_cost)} expense to ledger</span>
                  </label>
                  <p className="text-[11px] text-slate-400 pl-6">
                    Creates an expense entry under your household ledger so your monthly reports stay accurate.
                  </p>
                </div>
              )}

            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRenewingItem(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={renewSubmitting}
                onClick={handleConfirmRenew}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{renewSubmitting ? 'Updating...' : 'Confirm Renewal'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
