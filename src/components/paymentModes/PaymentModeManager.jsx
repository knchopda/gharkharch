import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Archive, RefreshCw, CreditCard, AlertCircle, X } from 'lucide-react';

export const PaymentModeManager = () => {
  const { isOwner } = useAuth();
  const { paymentModes, addPaymentMode, toggleArchivePaymentMode } = useExpenses();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newModeName, setNewModeName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const activeModes = paymentModes.filter(pm => pm.is_active);
  const archivedModes = paymentModes.filter(pm => !pm.is_active);

  const handleCreatePaymentMode = async (e) => {
    e.preventDefault();
    if (!newModeName.trim()) {
      setErrorMsg('Payment Mode name is required.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);

    const res = await addPaymentMode({ name: newModeName.trim() });
    setSubmitting(false);

    if (res.success) {
      setNewModeName('');
      setShowAddModal(false);
    } else {
      setErrorMsg(res.error || 'Failed to add payment mode.');
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-brand-400" />
            Dynamic Payment Modes ({paymentModes.length})
          </h3>
          <p className="text-[11px] text-slate-400">Custom payment options for your household</p>
        </div>

        {isOwner && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Mode</span>
          </button>
        )}
      </div>

      {/* ACTIVE MODES */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-300">Active Modes ({activeModes.length})</h4>
        <div className="grid grid-cols-1 gap-2">
          {activeModes.map(pm => (
            <div
              key={pm.id}
              className="glass-panel rounded-xl p-3 border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-white">{pm.name}</span>
              </div>

              {isOwner && (
                <button
                  onClick={() => toggleArchivePaymentMode(pm.id, pm.is_active)}
                  className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 font-medium px-2 py-1 rounded bg-slate-900 border border-slate-800 transition-colors"
                >
                  <Archive className="w-3 h-3" />
                  <span>Archive</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ARCHIVED MODES */}
      {archivedModes.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Archive className="w-3.5 h-3.5 text-amber-400" />
            Archived Payment Modes ({archivedModes.length})
          </h4>
          <div className="grid grid-cols-1 gap-2 opacity-70">
            {archivedModes.map(pm => (
              <div
                key={pm.id}
                className="glass-panel rounded-xl p-3 border border-slate-800 flex items-center justify-between bg-slate-950/60"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center text-xs">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300 line-through">{pm.name}</span>
                </div>

                {isOwner && (
                  <button
                    onClick={() => toggleArchivePaymentMode(pm.id, pm.is_active)}
                    className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium px-2 py-1 rounded bg-slate-900 border border-slate-800 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Restore</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD PAYMENT MODE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl p-5 max-w-xs w-full space-y-4 border border-slate-800 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Add New Payment Mode</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-2.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreatePaymentMode} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Payment Mode Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google Pay or HDFC Credit Card"
                  value={newModeName}
                  onChange={(e) => setNewModeName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow shadow-brand-600/30"
                >
                  {submitting ? 'Saving...' : 'Add Mode'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
