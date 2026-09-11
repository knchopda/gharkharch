import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { SAMPLE_EXPENSES, SAMPLE_CATEGORIES, SAMPLE_PAYMENT_MODES, SAMPLE_REMINDERS } from '../lib/mockData';
import { generateInviteCode } from '../utils/formatters';

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const { user, household, isOwner } = useAuth();

  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth()); // 0-indexed (0 = Jan, 8 = Sep)

  const [expenses, setExpenses] = useState([]);
  const [deletedExpenses, setDeletedExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState('ALL');
  const [selectedPaymentModeFilter, setSelectedPaymentModeFilter] = useState('ALL');

  // Request browser notification permission on mount if available
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Load data whenever household or active month changes
  useEffect(() => {
    if (!household) {
      setExpenses([]);
      setCategories([]);
      setPaymentModes([]);
      setReminders([]);
      setLoading(false);
      return;
    }

    fetchHouseholdData();
  }, [household?.id, selectedYear, selectedMonth]);

  const fetchHouseholdData = async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      // Local fallback dataset for instant preview
      setCategories(SAMPLE_CATEGORIES);
      setPaymentModes(SAMPLE_PAYMENT_MODES);
      setReminders(SAMPLE_REMINDERS);
      
      const enrichExpense = (exp) => ({
        ...exp,
        category: exp.category || SAMPLE_CATEGORIES.find(c => c.id === exp.category_id),
      });

      const active = SAMPLE_EXPENSES.filter(e => !e.is_deleted).map(enrichExpense);
      const deleted = SAMPLE_EXPENSES.filter(e => e.is_deleted).map(enrichExpense);
      setExpenses(active);
      setDeletedExpenses(deleted);
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch Categories
      const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .eq('household_id', household.id)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (catErr) throw catErr;
      const currentCats = catData || [];
      setCategories(currentCats);

      // 2. Fetch Payment Modes
      const { data: pmData, error: pmErr } = await supabase
        .from('payment_modes')
        .select('*')
        .eq('household_id', household.id)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (pmErr) throw pmErr;
      setPaymentModes(pmData || []);

      // 3. Fetch Reminders / Expiry Register
      const { data: remData, error: remErr } = await supabase
        .from('reminders')
        .select('*')
        .eq('household_id', household.id)
        .order('due_date', { ascending: true });

      if (remErr) {
        console.warn('Reminders table might not be patched yet:', remErr.message);
      } else {
        setReminders(remData || []);
        
        // Trigger browser notification for urgent items (< 7 days) if permitted
        if ('Notification' in window && Notification.permission === 'granted' && remData) {
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const urgent = remData.filter(r => {
            if (r.status !== 'active') return false;
            const due = new Date(r.due_date);
            const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 7;
          });

          if (urgent.length > 0) {
            try {
              new Notification('Gharkharch Expiry Reminder 🔔', {
                body: `You have ${urgent.length} document/renewal item(s) expiring within 7 days!`,
                icon: '/icon-192.png',
              });
            } catch (e) {
              // Ignore notification errors in unsupported webview environments
            }
          }
        }
      }

      // 4. Fetch Active Expenses (is_deleted = false)
      const { data: expData, error: expErr } = await supabase
        .from('expenses')
        .select('*, category:categories(*), profile:profiles!created_by(*)')
        .eq('household_id', household.id)
        .eq('is_deleted', false)
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (expErr) throw expErr;

      const enrichedExp = (expData || []).map(exp => ({
        ...exp,
        category: exp.category || currentCats.find(c => c.id === exp.category_id),
      }));

      setExpenses(enrichedExp);

      // 5. Fetch Soft-Deleted Expenses (Owner ONLY for Trash Bin)
      if (isOwner) {
        const { data: delData } = await supabase
          .from('expenses')
          .select('*, category:categories(*), profile:profiles!created_by(*), deleted_by_profile:profiles!deleted_by(*)')
          .eq('household_id', household.id)
          .eq('is_deleted', true)
          .order('deleted_at', { ascending: false });

        setDeletedExpenses(delData || []);

        // Load active invitations
        const { data: inviteData } = await supabase
          .from('household_invitations')
          .select('*')
          .eq('household_id', household.id)
          .eq('status', 'pending');

        setInvitations(inviteData || []);
      }
    } catch (err) {
      console.error('Error fetching expense ledger data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Month Navigation (← Prev Month | Next Month →)
  const navigateMonth = (direction) => {
    if (direction === 'PREV') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(prev => prev - 1);
      } else {
        setSelectedMonth(prev => prev - 1);
      }
    } else if (direction === 'NEXT') {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(prev => prev + 1);
      } else {
        setSelectedMonth(prev => prev + 1);
      }
    } else if (direction === 'TODAY') {
      setSelectedYear(today.getFullYear());
      setSelectedMonth(today.getMonth());
    }
  };

  // Add New Expense
  const addExpense = async (expensePayload) => {
    const amountVal = parseFloat(expensePayload.amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      return { success: false, error: 'Please enter a valid amount greater than zero.' };
    }

    const payload = {
      household_id: household.id,
      category_id: expensePayload.category_id,
      amount: amountVal,
      description: expensePayload.description.trim(),
      expense_date: expensePayload.expense_date || new Date().toISOString().split('T')[0],
      payment_mode: expensePayload.payment_mode || 'Cash',
      created_by: user.id,
      notes: expensePayload.notes ? expensePayload.notes.trim() : null,
      is_deleted: false,
    };

    const targetCategory = categories.find(c => c.id === payload.category_id);

    if (!isSupabaseConfigured) {
      const newExp = {
        ...payload,
        id: `exp_${Date.now()}`,
        created_at: new Date().toISOString(),
        category: targetCategory,
        profile: { id: user.id, full_name: user.full_name || user.email },
      };
      setExpenses(prev => [newExp, ...prev]);
      return { success: true };
    }

    try {
      const { data, error: insertErr } = await supabase
        .from('expenses')
        .insert(payload)
        .select('*, category:categories(*), profile:profiles!created_by(*)')
        .single();

      if (insertErr) throw insertErr;

      const fullExp = {
        ...data,
        category: data.category || targetCategory,
      };

      setExpenses(prev => [fullExp, ...prev]);
      return { success: true };
    } catch (err) {
      console.error('Error adding expense:', err);
      return { success: false, error: err.message };
    }
  };

  // Edit Expense
  const updateExpense = async (id, updatePayload) => {
    const amountVal = parseFloat(updatePayload.amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      return { success: false, error: 'Please enter a valid amount.' };
    }

    const payload = {
      category_id: updatePayload.category_id,
      amount: amountVal,
      description: updatePayload.description.trim(),
      expense_date: updatePayload.expense_date,
      payment_mode: updatePayload.payment_mode,
      notes: updatePayload.notes ? updatePayload.notes.trim() : null,
    };

    const targetCategory = categories.find(c => c.id === payload.category_id);

    if (!isSupabaseConfigured) {
      setExpenses(prev => prev.map(e => (e.id === id ? { ...e, ...payload, category: targetCategory } : e)));
      return { success: true };
    }

    try {
      const { data, error: updateErr } = await supabase
        .from('expenses')
        .update(payload)
        .eq('id', id)
        .select('*, category:categories(*), profile:profiles!created_by(*)')
        .single();

      if (updateErr) throw updateErr;

      const fullExp = {
        ...data,
        category: data.category || targetCategory,
      };

      setExpenses(prev => prev.map(e => (e.id === id ? fullExp : e)));
      return { success: true };
    } catch (err) {
      console.error('Error updating expense:', err);
      return { success: false, error: err.message };
    }
  };

  // Soft Delete Expense
  const deleteExpense = async (id) => {
    const target = expenses.find(e => e.id === id);
    if (!target) return { success: false, error: 'Expense not found.' };

    const deletePayload = {
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
    };

    if (!isSupabaseConfigured) {
      const softDeletedItem = { ...target, ...deletePayload };
      setExpenses(prev => prev.filter(e => e.id !== id));
      setDeletedExpenses(prev => [softDeletedItem, ...prev]);
      return { success: true };
    }

    try {
      const { error: delErr } = await supabase
        .from('expenses')
        .update(deletePayload)
        .eq('id', id);

      if (delErr) throw delErr;

      setExpenses(prev => prev.filter(e => e.id !== id));
      await fetchHouseholdData(); // Refresh trash bin
      return { success: true };
    } catch (err) {
      console.error('Error soft deleting expense:', err);
      return { success: false, error: err.message };
    }
  };

  // Restore Soft-Deleted Expense (Owner ONLY)
  const restoreExpense = async (id) => {
    if (!isOwner) return { success: false, error: 'Only Household Owner can restore deleted expenses.' };

    const restorePayload = {
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
    };

    if (!isSupabaseConfigured) {
      const restoredItem = deletedExpenses.find(e => e.id === id);
      if (restoredItem) {
        setDeletedExpenses(prev => prev.filter(e => e.id !== id));
        setExpenses(prev => [{ ...restoredItem, ...restorePayload }, ...prev]);
      }
      return { success: true };
    }

    try {
      const { error: resErr } = await supabase
        .from('expenses')
        .update(restorePayload)
        .eq('id', id);

      if (resErr) throw resErr;

      await fetchHouseholdData();
      return { success: true };
    } catch (err) {
      console.error('Error restoring expense:', err);
      return { success: false, error: err.message };
    }
  };

  // Permanently Purge Expense (Owner ONLY)
  const permanentlyDeleteExpense = async (id) => {
    if (!isOwner) return { success: false, error: 'Only Household Owner can permanently delete expenses.' };

    if (!isSupabaseConfigured) {
      setDeletedExpenses(prev => prev.filter(e => e.id !== id));
      return { success: true };
    }

    try {
      const { error: purgeErr } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (purgeErr) throw purgeErr;

      setDeletedExpenses(prev => prev.filter(e => e.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error purging expense:', err);
      return { success: false, error: err.message };
    }
  };

  // Add Category (Owner ONLY with Case-Insensitive Duplicate Validation)
  const addCategory = async ({ name, icon }) => {
    if (!isOwner) return { success: false, error: 'Only Owner can add categories.' };

    const cleanName = name.trim();
    if (!cleanName) return { success: false, error: 'Category name cannot be empty.' };

    const duplicate = categories.some(
      c => c.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (duplicate) {
      return { success: false, error: `Category "${cleanName}" already exists in this household!` };
    }

    const nextSortOrder = categories.length > 0 ? Math.max(...categories.map(c => c.sort_order || 0)) + 1 : 1;

    if (!isSupabaseConfigured) {
      const newCat = {
        id: `cat_${Date.now()}`,
        household_id: household.id,
        name: cleanName,
        icon: icon || 'Tag',
        is_active: true,
        sort_order: nextSortOrder,
        created_at: new Date().toISOString(),
      };
      setCategories(prev => [...prev, newCat]);
      return { success: true };
    }

    try {
      const { data, error: catErr } = await supabase
        .from('categories')
        .insert({
          household_id: household.id,
          name: cleanName,
          icon: icon || 'Tag',
          sort_order: nextSortOrder,
          is_active: true,
        })
        .select()
        .single();

      if (catErr) {
        if (catErr.message.includes('unique') || catErr.code === '23505') {
          return { success: false, error: `Category "${cleanName}" already exists in this household!` };
        }
        throw catErr;
      }

      setCategories(prev => [...prev, data]);
      return { success: true };
    } catch (err) {
      console.error('Error adding category:', err);
      return { success: false, error: err.message };
    }
  };

  // Soft Archive / Restore Category (Owner ONLY)
  const toggleArchiveCategory = async (id, currentStatus) => {
    if (!isOwner) return { success: false, error: 'Only Owner can archive categories.' };

    const newStatus = !currentStatus;

    if (!isSupabaseConfigured) {
      setCategories(prev => prev.map(c => (c.id === id ? { ...c, is_active: newStatus } : c)));
      return { success: true };
    }

    try {
      const { error: catErr } = await supabase
        .from('categories')
        .update({ is_active: newStatus })
        .eq('id', id);

      if (catErr) throw catErr;

      setCategories(prev => prev.map(c => (c.id === id ? { ...c, is_active: newStatus } : c)));
      return { success: true };
    } catch (err) {
      console.error('Error archiving category:', err);
      return { success: false, error: err.message };
    }
  };

  // Add Dynamic Payment Mode (Owner ONLY)
  const addPaymentMode = async ({ name }) => {
    if (!isOwner) return { success: false, error: 'Only Owner can add payment modes.' };

    const cleanName = name.trim();
    if (!cleanName) return { success: false, error: 'Payment Mode name cannot be empty.' };

    const duplicate = paymentModes.some(
      pm => pm.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (duplicate) {
      return { success: false, error: `Payment Mode "${cleanName}" already exists in this household!` };
    }

    const nextSortOrder = paymentModes.length > 0 ? Math.max(...paymentModes.map(pm => pm.sort_order || 0)) + 1 : 1;

    if (!isSupabaseConfigured) {
      const newPM = {
        id: `pm_${Date.now()}`,
        household_id: household.id,
        name: cleanName,
        is_active: true,
        sort_order: nextSortOrder,
        created_at: new Date().toISOString(),
      };
      setPaymentModes(prev => [...prev, newPM]);
      return { success: true };
    }

    try {
      const { data, error: pmErr } = await supabase
        .from('payment_modes')
        .insert({
          household_id: household.id,
          name: cleanName,
          sort_order: nextSortOrder,
          is_active: true,
        })
        .select()
        .single();

      if (pmErr) {
        if (pmErr.message.includes('unique') || pmErr.code === '23505') {
          return { success: false, error: `Payment Mode "${cleanName}" already exists!` };
        }
        throw pmErr;
      }

      setPaymentModes(prev => [...prev, data]);
      return { success: true };
    } catch (err) {
      console.error('Error adding payment mode:', err);
      return { success: false, error: err.message };
    }
  };

  // Soft Archive / Restore Payment Mode (Owner ONLY)
  const toggleArchivePaymentMode = async (id, currentStatus) => {
    if (!isOwner) return { success: false, error: 'Only Owner can archive payment modes.' };

    const newStatus = !currentStatus;

    if (!isSupabaseConfigured) {
      setPaymentModes(prev => prev.map(pm => (pm.id === id ? { ...pm, is_active: newStatus } : pm)));
      return { success: true };
    }

    try {
      const { error: pmErr } = await supabase
        .from('payment_modes')
        .update({ is_active: newStatus })
        .eq('id', id);

      if (pmErr) throw pmErr;

      setPaymentModes(prev => prev.map(pm => (pm.id === id ? { ...pm, is_active: newStatus } : pm)));
      return { success: true };
    } catch (err) {
      console.error('Error archiving payment mode:', err);
      return { success: false, error: err.message };
    }
  };

  // Generate Family Member Invite Code (Owner ONLY)
  const createFamilyInvitation = async () => {
    if (!isOwner) return { success: false, error: 'Only Owner can invite family members.' };

    const code = generateInviteCode();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    if (!isSupabaseConfigured) {
      const newInvite = {
        id: `inv_${Date.now()}`,
        household_id: household.id,
        invite_code: code,
        status: 'pending',
        expires_at: expiresAt,
      };
      setInvitations(prev => [newInvite, ...prev]);
      return { success: true, inviteCode: code };
    }

    try {
      const { data, error: invErr } = await supabase
        .from('household_invitations')
        .insert({
          household_id: household.id,
          invite_code: code,
          created_by: user.id,
          status: 'pending',
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (invErr) throw invErr;
      setInvitations(prev => [data, ...prev]);
      return { success: true, inviteCode: code };
    } catch (err) {
      console.error('Error creating invitation:', err);
      return { success: false, error: err.message };
    }
  };

  // ----------------------------------------------------------------------------
  // REMINDERS & RENEWALS MANAGEMENT
  // ----------------------------------------------------------------------------
  const addReminder = async (payload) => {
    if (!payload.title || !payload.title.trim()) {
      return { success: false, error: 'Please enter a reminder title.' };
    }
    if (!payload.due_date) {
      return { success: false, error: 'Please select a due date.' };
    }

    const item = {
      household_id: household.id,
      title: payload.title.trim(),
      category_type: payload.category_type || 'other',
      due_date: payload.due_date,
      estimated_cost: parseFloat(payload.estimated_cost) || 0,
      reminder_days_before: parseInt(payload.reminder_days_before) || 7,
      notes: payload.notes ? payload.notes.trim() : null,
      status: 'active',
      created_by: user.id,
    };

    if (!isSupabaseConfigured) {
      const newRem = {
        ...item,
        id: `rem_${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      setReminders(prev => [...prev, newRem].sort((a, b) => new Date(a.due_date) - new Date(b.due_date)));
      return { success: true };
    }

    try {
      const { data, error: insertErr } = await supabase
        .from('reminders')
        .insert(item)
        .select()
        .single();

      if (insertErr) throw insertErr;

      setReminders(prev => [...prev, data].sort((a, b) => new Date(a.due_date) - new Date(b.due_date)));
      return { success: true };
    } catch (err) {
      console.error('Error adding reminder:', err);
      return { success: false, error: err.message };
    }
  };

  const updateReminder = async (id, updatePayload) => {
    if (!updatePayload.title || !updatePayload.title.trim()) {
      return { success: false, error: 'Please enter a reminder title.' };
    }

    const item = {
      title: updatePayload.title.trim(),
      category_type: updatePayload.category_type || 'other',
      due_date: updatePayload.due_date,
      estimated_cost: parseFloat(updatePayload.estimated_cost) || 0,
      reminder_days_before: parseInt(updatePayload.reminder_days_before) || 7,
      notes: updatePayload.notes ? updatePayload.notes.trim() : null,
    };

    if (!isSupabaseConfigured) {
      setReminders(prev =>
        prev
          .map(r => (r.id === id ? { ...r, ...item } : r))
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      );
      return { success: true };
    }

    try {
      const { data, error: updateErr } = await supabase
        .from('reminders')
        .update(item)
        .eq('id', id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      setReminders(prev =>
        prev
          .map(r => (r.id === id ? data : r))
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      );
      return { success: true };
    } catch (err) {
      console.error('Error updating reminder:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteReminder = async (id) => {
    if (!isSupabaseConfigured) {
      setReminders(prev => prev.filter(r => r.id !== id));
      return { success: true };
    }

    try {
      const { error: delErr } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (delErr) throw delErr;

      setReminders(prev => prev.filter(r => r.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting reminder:', err);
      return { success: false, error: err.message };
    }
  };

  // 1-Click Renew Action: advances due date (+1 year, +6 months, or +1 month) and optionally logs an expense
  const renewReminder = async (id, advanceYears = 1, logExpense = false, paymentMode = 'Cash') => {
    const target = reminders.find(r => r.id === id);
    if (!target) return { success: false, error: 'Reminder item not found.' };

    const currentDueDate = new Date(target.due_date);
    const nextDueDate = new Date(currentDueDate);
    nextDueDate.setFullYear(nextDueDate.getFullYear() + advanceYears);
    const newDueDateStr = nextDueDate.toISOString().split('T')[0];

    // Optionally log expense
    if (logExpense && target.estimated_cost > 0) {
      // Find suitable category or default to Miscellaneous / Transport
      let matchingCat = categories.find(c => {
        const name = c.name.toLowerCase();
        if (target.category_type === 'vehicle_puc' && (name.includes('transport') || name.includes('vehicle') || name.includes('car'))) return true;
        if (target.category_type === 'health_mediclaim' && (name.includes('medicine') || name.includes('health'))) return true;
        if (target.category_type === 'household_bill' && (name.includes('electricity') || name.includes('utility'))) return true;
        return false;
      });

      if (!matchingCat && categories.length > 0) {
        matchingCat = categories[0];
      }

      if (matchingCat) {
        await addExpense({
          category_id: matchingCat.id,
          amount: target.estimated_cost,
          description: `Renewal: ${target.title}`,
          expense_date: new Date().toISOString().split('T')[0],
          payment_mode: paymentMode,
          notes: target.notes ? `Auto-logged on renewal. ${target.notes}` : 'Auto-logged on renewal.',
        });
      }
    }

    return await updateReminder(id, {
      ...target,
      due_date: newDueDateStr,
    });
  };

  // Filtered Expenses Computation
  const getFilteredExpenses = () => {
    return expenses.filter(exp => {
      // Month & Year Filter
      const expDate = new Date(exp.expense_date);
      const isSelectedMonth = expDate.getFullYear() === selectedYear && expDate.getMonth() === selectedMonth;
      if (!isSelectedMonth) return false;

      // Text Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const descMatch = exp.description.toLowerCase().includes(query);
        const notesMatch = exp.notes ? exp.notes.toLowerCase().includes(query) : false;
        const catMatch = exp.category ? exp.category.name.toLowerCase().includes(query) : false;
        if (!descMatch && !notesMatch && !catMatch) return false;
      }

      // Category Filter
      if (selectedCategoryFilter !== 'ALL' && exp.category_id !== selectedCategoryFilter) {
        return false;
      }

      // Member Filter
      if (selectedMemberFilter !== 'ALL' && exp.created_by !== selectedMemberFilter) {
        return false;
      }

      // Payment Mode Filter
      if (selectedPaymentModeFilter !== 'ALL' && exp.payment_mode !== selectedPaymentModeFilter) {
        return false;
      }

      return true;
    });
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        deletedExpenses,
        categories,
        activeCategories: categories.filter(c => c.is_active),
        paymentModes,
        activePaymentModes: paymentModes.filter(pm => pm.is_active),
        invitations,
        reminders,
        selectedYear,
        selectedMonth,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        selectedCategoryFilter,
        setSelectedCategoryFilter,
        selectedMemberFilter,
        setSelectedMemberFilter,
        selectedPaymentModeFilter,
        setSelectedPaymentModeFilter,
        navigateMonth,
        addExpense,
        updateExpense,
        deleteExpense,
        restoreExpense,
        permanentlyDeleteExpense,
        addCategory,
        toggleArchiveCategory,
        addPaymentMode,
        toggleArchivePaymentMode,
        createFamilyInvitation,
        addReminder,
        updateReminder,
        deleteReminder,
        renewReminder,
        getFilteredExpenses,
        refreshData: fetchHouseholdData,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

