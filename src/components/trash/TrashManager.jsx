import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { useAuth } from '../../context/AuthContext';
import { Trash2, RotateCcw, ShieldAlert, Tag, Calendar, User, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDateShort } from '../../utils/formatters';

export const TrashManager = () => {
  const { isOwner } = useAuth();
  const { deletedExpenses, restoreExpense, permanentlyDeleteExpense } = useExpenses();

  const [processingId, setProcessingId] = useState(null);

  if (!isOwner) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center space-y-2 border border-slate-800 text-xs">
        <ShieldAlert className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="font-bold text-white">Access Restricted</h3>
        <p className="text-slate-400">Only Household Owners can access the deleted expense Trash Bin.</p>
      </div>
    );
  }

  const handleRestore = async (id) => {
    setProcessingId(id);
    await restoreExpense(id);
    setProcessingId(null);
  };

  const handlePermanentPurge = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this expense record? This action cannot be undone.')) {
      setProcessingId(id);
      await permanentlyDeleteExpense(id);
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Trash2 className="w-4 h-4 text-rose-400" />
            Trash Bin ({deletedExpenses.length})
          </h3>
          <p className="text-[11px] text-slate-400">Recover soft-deleted household expenses</p>
        </div>
      </div>

      {deletedExpenses.length === 0 ? (
        <div className="glass-panel rounded-2xl p-6 text-center space-y-1 border border-slate-800">
          <p className="text-xs font-medium text-slate-400">Trash Bin is empty.</p>
          <p className="text-[11px] text-slate-500">Deleted expenses will appear here for recovery.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {deletedExpenses.map(exp => (
            <div
              key={exp.id}
              className="glass-panel rounded-xl p-3 border border-rose-500/20 bg-rose-500/5 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{exp.description}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                      <span>{exp.category?.name || 'General'}</span>
                      <span>•</span>
                      <span>{formatDateShort(exp.expense_date)}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-outfit font-bold text-xs text-rose-400 line-through">-{formatCurrency(exp.amount)}</p>
                  <span className="text-[9px] text-slate-500">Deleted</span>
                </div>
              </div>

              {/* Deletion Info */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-500" />
                  Deleted by: {exp.deleted_by_profile?.full_name || 'Owner'}
                </span>

                <div className="flex items-center space-x-2 font-medium">
                  <button
                    onClick={() => handleRestore(exp.id)}
                    disabled={processingId === exp.id}
                    className="text-brand-400 hover:text-brand-300 flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restore
                  </button>

                  <button
                    onClick={() => handlePermanentPurge(exp.id)}
                    disabled={processingId === exp.id}
                    className="text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Purge
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
