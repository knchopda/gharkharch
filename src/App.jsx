import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { Onboarding } from './components/onboarding/Onboarding';
import { Dashboard } from './components/dashboard/Dashboard';
import { ExpenseBook } from './components/expenses/ExpenseBook';
import { ReportsView } from './components/reports/ReportsView';
import { MoreTab } from './components/settings/MoreTab';
import { AddExpenseModal } from './components/expenses/AddExpenseModal';
import { BookOpen } from 'lucide-react';

const AppContent = () => {
  const { user, household, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  // Add / Edit Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center animate-bounce shadow-lg shadow-brand-500/30">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <p className="font-outfit text-sm font-semibold tracking-wide text-brand-300">Loading Gharkharch...</p>
      </div>
    );
  }

  // If user is not authenticated or hasn't created/joined a household yet, show Onboarding
  if (!user || !household) {
    return <Onboarding />;
  }

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setIsAddModalOpen(true);
  };

  const handleEditExpense = (expenseItem) => {
    setEditingExpense(expenseItem);
    setIsAddModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased relative">
      
      {/* Sticky App Header */}
      <Header />

      {/* Main Tab Content View */}
      <main className="max-w-md mx-auto min-h-[calc(100vh-8rem)]">
        {activeTab === 'home' && (
          <Dashboard
            onOpenAddModal={handleOpenAddModal}
            onNavigateToLedger={() => setActiveTab('ledger')}
          />
        )}

        {activeTab === 'ledger' && (
          <ExpenseBook
            onEditExpense={handleEditExpense}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView />
        )}

        {activeTab === 'more' && (
          <MoreTab />
        )}
      </main>

      {/* Touch-Friendly Sticky 5-Tab Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Touch Quick Add / Edit Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingExpense(null);
        }}
        initialData={editingExpense}
      />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <AppContent />
      </ExpenseProvider>
    </AuthProvider>
  );
}
