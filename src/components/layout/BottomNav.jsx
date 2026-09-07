import React from 'react';
import { LayoutDashboard, BookOpen, Plus, PieChart, Menu } from 'lucide-react';

export const BottomNav = ({ activeTab, setActiveTab, onOpenAddModal }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'ledger', label: 'Expenses', icon: BookOpen },
    { id: 'add', label: 'Add', icon: Plus, isAction: true },
    { id: 'reports', label: 'Reports', icon: PieChart },
    { id: 'more', label: 'More', icon: Menu },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 text-slate-300 pb-safe shadow-2xl">
      <div className="max-w-md mx-auto px-2 h-14 grid grid-cols-5 items-center justify-items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                onClick={onOpenAddModal}
                className="flex flex-col items-center justify-center h-full w-full group transition-all duration-150"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 via-brand-500 to-emerald-400 text-white flex items-center justify-center shadow-md shadow-brand-500/40 group-active:scale-95 transition-transform mb-0.5">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <span className="text-[10px] font-bold text-brand-400 tracking-tight">Add</span>
              </button>
            );
          }

          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center h-full w-full transition-all duration-150 relative ${
                isActive ? 'text-brand-400 font-bold' : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 rounded-b-full bg-brand-400 shadow-sm shadow-brand-400/50" />
              )}
              <Icon className={`w-4.5 h-4.5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
