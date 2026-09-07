import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Archive, RefreshCw, Tag, Shield, AlertCircle, Check, X } from 'lucide-react';

export const CategoryManager = () => {
  const { isOwner } = useAuth();
  const { categories, addCategory, toggleArchiveCategory } = useExpenses();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Tag');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const activeCats = categories.filter(c => c.is_active);
  const archivedCats = categories.filter(c => !c.is_active);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setErrorMsg('Category name is required.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);

    const res = await addCategory({
      name: newCatName.trim(),
      icon: selectedIcon,
    });

    setSubmitting(false);

    if (res.success) {
      setNewCatName('');
      setShowAddModal(false);
    } else {
      setErrorMsg(res.error || 'Failed to add category.');
    }
  };

  const iconsList = ['Tag', 'ShoppingCart', 'Apple', 'Home', 'Zap', 'UserCheck', 'Utensils', 'HeartPulse', 'BookOpen', 'Car', 'ShoppingBag', 'Gift', 'Film', 'Briefcase', 'MoreHorizontal'];

  return (
    <div className="space-y-4">
      
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-brand-400" />
            Dynamic Categories ({categories.length})
          </h3>
          <p className="text-[11px] text-slate-400">Custom household expense categories</p>
        </div>

        {isOwner && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {/* ACTIVE CATEGORIES GRID */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-300">Active Categories ({activeCats.length})</h4>
        <div className="grid grid-cols-1 gap-2">
          {activeCats.map(cat => (
            <div
              key={cat.id}
              className="glass-panel rounded-xl p-3 border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-white">{cat.name}</span>
              </div>

              {isOwner && (
                <button
                  onClick={() => toggleArchiveCategory(cat.id, cat.is_active)}
                  className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 font-medium px-2 py-1 rounded bg-slate-900 border border-slate-800 transition-colors"
                  title="Archive category (preserves historic expense records)"
                >
                  <Archive className="w-3 h-3" />
                  <span>Archive</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ARCHIVED CATEGORIES (Historic preservation) */}
      {archivedCats.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Archive className="w-3.5 h-3.5 text-amber-400" />
            Archived Categories ({archivedCats.length})
          </h4>
          <div className="grid grid-cols-1 gap-2 opacity-70">
            {archivedCats.map(cat => (
              <div
                key={cat.id}
                className="glass-panel rounded-xl p-3 border border-slate-800 flex items-center justify-between bg-slate-950/60"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center text-xs">
                    <Tag className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300 line-through">{cat.name}</span>
                </div>

                {isOwner && (
                  <button
                    onClick={() => toggleArchiveCategory(cat.id, cat.is_active)}
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

      {/* ADD CATEGORY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl p-5 max-w-xs w-full space-y-4 border border-slate-800 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Add New Category</h3>
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

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vegetables & Fruits"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Duplicate names inside household are automatically prevented.</p>
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
                  {submitting ? 'Saving...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
