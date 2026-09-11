export const DEFAULT_CATEGORIES = [
  { id: 'cat_1', name: 'Groceries', icon: 'ShoppingCart', sort_order: 1 },
  { id: 'cat_2', name: 'Milk & Vegetables', icon: 'Apple', sort_order: 2 },
  { id: 'cat_3', name: 'House Rent', icon: 'Home', sort_order: 3 },
  { id: 'cat_4', name: 'Electricity & Utilities', icon: 'Zap', sort_order: 4 },
  { id: 'cat_5', name: 'Maid & Domestic Help', icon: 'UserCheck', sort_order: 5 },
  { id: 'cat_6', name: 'Dining & Food Out', icon: 'Utensils', sort_order: 6 },
  { id: 'cat_7', name: 'Medicine & Health', icon: 'HeartPulse', sort_order: 7 },
  { id: 'cat_8', name: 'Education & Books', icon: 'BookOpen', sort_order: 8 },
  { id: 'cat_9', name: 'Transport & Fuel', icon: 'Car', sort_order: 9 },
  { id: 'cat_10', name: 'Shopping & Clothes', icon: 'ShoppingBag', sort_order: 10 },
  { id: 'cat_11', name: 'Miscellaneous', icon: 'MoreHorizontal', sort_order: 11 },
];

export const DEFAULT_PAYMENT_MODES = [
  { id: 'pm_1', name: 'Cash', sort_order: 1 },
  { id: 'pm_2', name: 'UPI', sort_order: 2 },
  { id: 'pm_3', name: 'Credit Card', sort_order: 3 },
  { id: 'pm_4', name: 'Debit Card', sort_order: 4 },
  { id: 'pm_5', name: 'Net Banking', sort_order: 5 },
];

export const SAMPLE_USER = {
  id: 'usr_owner_001',
  full_name: 'Household Owner',
  email: 'owner@gharkharch.app',
  avatar_url: null,
};

export const SAMPLE_HOUSEHOLD = {
  id: 'hh_clean_household',
  name: 'My Household',
  owner_id: 'usr_owner_001',
  created_at: new Date().toISOString(),
};

export const SAMPLE_MEMBERS = [
  {
    id: 'mem_01',
    household_id: 'hh_clean_household',
    user_id: 'usr_owner_001',
    role: 'owner',
    profile: SAMPLE_USER,
  }
];

export const SAMPLE_CATEGORIES = DEFAULT_CATEGORIES.map(cat => ({
  ...cat,
  household_id: 'hh_clean_household',
  is_active: true,
  created_at: new Date().toISOString(),
}));

export const SAMPLE_PAYMENT_MODES = DEFAULT_PAYMENT_MODES.map(pm => ({
  ...pm,
  household_id: 'hh_clean_household',
  is_active: true,
  created_at: new Date().toISOString(),
}));

// Clean expense register with ZERO dummy expense records
export const SAMPLE_EXPENSES = [];

// Sample Reminders for Local Mock Mode
export const SAMPLE_REMINDERS = [
  {
    id: 'rem_1',
    household_id: 'hh_clean_household',
    title: 'Car Vehicle PUC Certificate',
    category_type: 'vehicle_puc',
    due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days from now
    estimated_cost: 150.00,
    reminder_days_before: 7,
    notes: 'Check emissions center near main highway junction',
    status: 'active',
    created_by: 'usr_owner_001',
    created_at: new Date().toISOString(),
  },
  {
    id: 'rem_2',
    household_id: 'hh_clean_household',
    title: 'Antivirus & System Protection License',
    category_type: 'software_renewal',
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
    estimated_cost: 1299.00,
    reminder_days_before: 7,
    notes: 'Auto-renew or upgrade 3-device family pack',
    status: 'active',
    created_by: 'usr_owner_001',
    created_at: new Date().toISOString(),
  },
  {
    id: 'rem_3',
    household_id: 'hh_clean_household',
    title: 'Family Health Mediclaim Policy',
    category_type: 'health_mediclaim',
    due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days from now
    estimated_cost: 18500.00,
    reminder_days_before: 15,
    notes: 'Star Health Family Optima Policy #9823471',
    status: 'active',
    created_by: 'usr_owner_001',
    created_at: new Date().toISOString(),
  }
];

// Sample Incomes for Local Mock Mode
export const SAMPLE_INCOMES = [
  {
    id: 'inc_1',
    household_id: 'hh_clean_household',
    title: 'Monthly Salary Credit',
    source_type: 'salary',
    amount: 85000.00,
    income_date: new Date().toISOString().split('T')[0],
    notes: 'Monthly Net Take Home Salary',
    created_by: 'usr_owner_001',
    created_at: new Date().toISOString(),
  },
  {
    id: 'inc_2',
    household_id: 'hh_clean_household',
    title: 'Freelance Software Project Bonus',
    source_type: 'freelance',
    amount: 15000.00,
    income_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Mobile app consulting payout',
    created_by: 'usr_owner_001',
    created_at: new Date().toISOString(),
  }
];

// Sample Investments for Local Mock Mode
export const SAMPLE_INVESTMENTS = [
  {
    id: 'inv_1',
    household_id: 'hh_clean_household',
    name: 'Nifty 50 Index Fund SIP',
    investment_type: 'sip',
    invested_amount: 120000.00,
    current_value: 142500.00,
    monthly_sip_amount: 10000.00,
    notes: 'Monthly auto-debit on 5th',
    created_by: 'usr_owner_001',
    created_at: new Date().toISOString(),
  },
  {
    id: 'inv_2',
    household_id: 'hh_clean_household',
    name: 'Public Provident Fund (PPF)',
    investment_type: 'ppf_epf',
    invested_amount: 80000.00,
    current_value: 88500.00,
    monthly_sip_amount: 5000.00,
    notes: 'Tax saving 80C long term fund',
    created_by: 'usr_owner_001',
    created_at: new Date().toISOString(),
  }
];

// Sample Savings Goals for Local Mock Mode
export const SAMPLE_SAVINGS_GOALS = [
  {
    id: 'goal_1',
    household_id: 'hh_clean_household',
    title: 'Emergency Reserve Fund',
    target_amount: 150000.00,
    current_amount: 95000.00,
    target_date: '2026-12-31',
    icon: 'Shield',
    status: 'active',
    created_by: 'usr_owner_001',
    created_at: new Date().toISOString(),
  },
  {
    id: 'goal_2',
    household_id: 'hh_clean_household',
    title: 'New M3 Laptop Upgrade',
    target_amount: 90000.00,
    current_amount: 45000.00,
    target_date: '2026-11-15',
    icon: 'Laptop',
    status: 'active',
    created_by: 'usr_owner_001',
    created_at: new Date().toISOString(),
  }
];

// Sample Category Budgets for Local Mock Mode
export const SAMPLE_CATEGORY_BUDGETS = [
  { id: 'cb_1', household_id: 'hh_clean_household', category_id: 'cat_1', monthly_limit: 15000.00 },
  { id: 'cb_2', household_id: 'hh_clean_household', category_id: 'cat_6', monthly_limit: 6000.00 },
];

// Sample Dynamic Budget Ratio Settings
export const SAMPLE_BUDGET_RATIO_SETTINGS = {
  household_id: 'hh_clean_household',
  needs_pct: 50,
  wants_pct: 30,
  savings_pct: 20,
};


