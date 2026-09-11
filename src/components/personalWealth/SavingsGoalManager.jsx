import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { AddGoalModal } from './AddGoalModal';
import { formatCurrency, formatDateShort } from '../../utils/formatters';
import { Target, Plus, ArrowLeft, CheckCircle2, Shield, Laptop, Calendar, Edit3, Trash2, Trophy, Clock } from 'lucide-react';

export const SavingsGoalManager = ({ onBack }) => {
  const { savingsGoals, deleteSavingsGoal } = useExpenses();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Compute stats
  const totalTargetAmount = savingsGoals.reduce((sum, g) => sum + (parseFloat(g.target_amount) || 0), 0);
  const totalCurrentSaved = savingsGoals.reduce((sum, g) => sum + (parseFloat(g.current_amount) || 0), 0);
  const achievedGoalsCount = savingsGoals.filter(g => g.status === 'achieved' || parseFloat(g.current_amount) >= parseFloat(g.target_amount)).length;
  const overallProgressPct = totalTargetAmount > 0 ? Math.round((totalCurrentSaved / totalTargetAmount) * 100) : 0;

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete savings goal "${title}"?`)) {
      await deleteSavingsGoal(id);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Top Bar */}
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
              <span>Savings Targets</span>
              <Target className="w-5 h-5 text-purple-400" />
            </h1>
            <p className="text-xs text-slate-400">Track Emergency Reserve, Laptop, & Savings Goals</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Target Progress */}
        <div className="col-span-2 glass-panel p-4 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/40 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
            <span>Overall Savings Target Progress</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px]">{overallProgressPct}% Completed</span>
          </div>

          <div className="flex items-baseline justify-between">
            <p className="font-outfit text-3xl font-extrabold text-white tracking-tight">
              {formatCurrency(totalCurrentSaved)}
            </p>
            <p className="text-xs font-medium text-slate-400">
              Target: <span className="font-bold text-slate-200">{formatCurrency(totalTargetAmount)}</span>
            </p>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-400 h-3 rounded-full transition-all duration-500 shadow-md shadow-purple-500/30"
              style={{ width: `${Math.min(overallProgressPct, 100)}%` }}
            />
          </div>
        </div>

        <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 bg-slate-900/80">
          <div className="text-[10px] uppercase font-bold text-slate-400">Active Goals</div>
          <p className="font-outfit text-xl font-extrabold text-purple-400 mt-1">
            {savingsGoals.length - achievedGoalsCount}
          </p>
          <p className="text-[10px] text-slate-500">In progress</p>
        </div>

        <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 bg-slate-900/80">
          <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
            <Trophy className="w-3 h-3 text-emerald-400" />
            Goals Achieved
          </div>
          <p className="font-outfit text-xl font-extrabold text-emerald-400 mt-1">
            {achievedGoalsCount}
          </p>
          <p className="text-[10px] text-slate-500">Completed targets</p>
        </div>
      </div>

      {/* Goals List */}
      {savingsGoals.length === 0 ? (
        <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-purple-400">
            <Target className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">No savings goals created yet</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Set goals for Emergency Reserve, Vehicle purchase, or Laptop upgrade and track your progress!
            </p>
          </div>
          <button
            onClick={() => {
              setEditingGoal(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Goal</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {savingsGoals.map(goal => {
            const cur = parseFloat(goal.current_amount) || 0;
            const tgt = parseFloat(goal.target_amount) || 1;
            const pct = Math.min(Math.round((cur / tgt) * 100), 100);
            const isAchieved = goal.status === 'achieved' || cur >= tgt;

            return (
              <div
                key={goal.id}
                className="glass-card bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-3 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-xl border shrink-0 ${
                      isAchieved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                    }`}>
                      {isAchieved ? <Trophy className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-outfit text-sm font-bold text-white">{goal.title}</h4>
                      {goal.target_date && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>Target: {formatDateShort(goal.target_date)}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isAchieved ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    }`}>
                      {isAchieved ? '🎉 Achieved!' : `${pct}% Done`}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-purple-300">{formatCurrency(cur)}</span>
                    <span className="text-slate-400">Target: {formatCurrency(tgt)}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        isAchieved ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-purple-500 to-indigo-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-end gap-1 pt-1 border-t border-slate-800/60">
                  <button
                    onClick={() => {
                      setEditingGoal(goal);
                      setIsAddModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white rounded transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id, goal.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddGoalModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingGoal(null);
        }}
        initialData={editingGoal}
      />

    </div>
  );
};
