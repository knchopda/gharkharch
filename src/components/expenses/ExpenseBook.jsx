import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDateGroupHeader } from '../../utils/formatters';
import { Search, Filter, Trash2, Edit3, Tag, Calendar, User, CreditCard, ChevronDown, X, ShieldAlert } from 'lucide-react';

export const ExpenseBook = ({ onEditExpense }) => {
  const { user, isOwner } = useAuth();
  const {
    categories,
    activePaymentModes,
    searchQuery,
    setSearchQuery,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    selectedMemberFilter,
    setSelectedMemberFilter,
    selectedPaymentModeFilter,
    setSelectedPaymentModeFilter,
    getFilteredExpenses,
    deleteExpense,
  } = useExpenses();

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filteredExpenses = getFilteredExpenses();

  // Group Expenses by Date string
  const groupedExpenses = {};
  filteredExpenses.forEach(exp => {
    const dateKey = exp.expense_date;
    if (!groupedExpenses[dateKey]) {
      groupedExpenses[dateKey] = [];
    }
    groupedExpenses[dateKey].push(exp);
  });

  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => new Date(b) - new Date(a));
  const monthTotal = filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);

  const handleConfirmDelete = async (id) => {
    setDeleting(true);
    await deleteExpense(id);
    setDeleting(false);
    setDeleteConfirmId(null);
  };

  const hasActiveFilters = selectedCategoryFilter !== 'ALL' || selectedMemberFilter !== 'ALL' || selectedPaymentModeFilter !== 'ALL' || searchQuery.trim() !== '';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategoryFilter('ALL');
    setSelectedMemberFilter('ALL');
    setSelectedPaymentModeFilter('ALL');
  };

  return (
    <div className="space-y-4 pb-32 px-3.5 pt-3.5 max-w-md mx-auto">
      
      {/* SEARCH BAR & FILTER TRIGGER */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search description, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
            hasActiveFilters
              ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-600/30'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Filter className="w-4 h-4" />
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-amber-400" />}
        </button>
      </div>

      {/* FILTER DRAWER */}
      {showFilterDrawer && (
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3 shadow-xl text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-white">Filter Expense Ledger</span>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-brand-400 hover:underline text-[11px] font-semibold">
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category Filter */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Category</label>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="ALL">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Dynamic Payment Mode Filter */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Payment Mode</label>
              <select
                value={selectedPaymentModeFilter}
                onChange={(e) => setSelectedPaymentModeFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="ALL">All Modes</option>
                {activePaymentModes.map(pm => (
                  <option key={pm.id} value={pm.name}>{pm.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* MONTH TOTAL HEADER */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-xs">
        <span className="text-slate-400 font-medium">Filtered Ledger Total:</span>
        <span className="font-outfit font-extrabold text-white text-sm">{formatCurrency(monthTotal, true)}</span>
      </div>

      {/* DATE-GROUPED LEDGER ENTRIES */}
      {sortedDates.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center space-y-2 border border-slate-800">
          <p className="text-sm font-semibold text-slate-300">No expenses logged for this period.</p>
          <p className="text-xs text-slate-500">Tap the green "+" button at the bottom to add an expense.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((dateStr) => {
            const dayExpenses = groupedExpenses[dateStr];
            const dayTotal = dayExpenses.reduce((sum, item) => sum + Number(item.amount), 0);

            return (
              <div key={dateStr} className="space-y-2">
                {/* DATE GROUP HEADER */}
                <div className="flex items-center justify-between text-xs font-semibold px-1 text-slate-400 border-b border-slate-800/60 pb-1">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-brand-400" />
                    {formatDateGroupHeader(dateStr)}
                  </span>
                  <span className="text-white font-bold">{formatCurrency(dayTotal)}</span>
                </div>

                {/* DAY EXPENSES CARDS */}
                <div className="space-y-2">
                  {dayExpenses.map((exp) => {
                    const isCreator = exp.created_by === user?.id;
                    const canEditOrDelete = isOwner || isCreator;

                    return (
                      <div
                        key={exp.id}
                        className="glass-panel rounded-xl p-3 border border-slate-800/90 hover:border-slate-700/80 transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 shrink-0 mt-0.5">
                              <Tag className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">{exp.description}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                <span className="text-brand-300 font-medium">{exp.category?.name || 'General'}</span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 text-slate-400">
                                  <User className="w-3 h-3" />
                                  {exp.profile?.full_name?.split(' ')[0] || 'Member'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-outfit font-bold text-sm text-rose-400">-{formatCurrency(exp.amount)}</p>
                            <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/80">
                              {exp.payment_mode || 'Cash'}
                            </span>
                          </div>
                        </div>

                        {/* Optional Notes */}
                        {exp.notes && (
                          <p className="text-[11px] text-slate-400 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800/50 italic">
                            "{exp.notes}"
                          </p>
                        )}

                        {/* Owner / Member Actions */}
                        {canEditOrDelete && (
                          <div className="flex items-center justify-end space-x-3 pt-1 border-t border-slate-800/60 text-[11px]">
                            <button
                              onClick={() => onEditExpense(exp)}
                              className="text-slate-400 hover:text-brand-300 flex items-center gap-1 font-medium transition-colors"
                            >
                              <Edit3 className="w-3 h-3" />
                              Edit
                            </button>

                            <button
                              onClick={() => setDeleteConfirmId(exp.id)}
                              className="text-slate-400 hover:text-rose-400 flex items-center gap-1 font-medium transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl p-5 max-w-xs w-full space-y-4 border border-rose-500/30 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Soft Delete Expense?</h3>
              <p className="text-xs text-slate-400">
                This expense will be moved to the Owner's Trash Bin and excluded from monthly totals.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(deleteConfirmId)}
                disabled={deleting}
                className="py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow shadow-rose-600/30"
              >
                {deleting ? 'Deleting...' : 'Move to Trash'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
