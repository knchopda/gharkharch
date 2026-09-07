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
