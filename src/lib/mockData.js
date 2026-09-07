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
  full_name: 'Kishan Sharma',
  email: 'kishan@gharkharch.app',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
};

export const SAMPLE_HOUSEHOLD = {
  id: 'hh_sharma_family',
  name: 'Sharma Family Household',
  owner_id: 'usr_owner_001',
  created_at: new Date().toISOString(),
};

export const SAMPLE_MEMBERS = [
  {
    id: 'mem_01',
    household_id: 'hh_sharma_family',
    user_id: 'usr_owner_001',
    role: 'owner',
    profile: {
      id: 'usr_owner_001',
      full_name: 'Kishan Sharma',
      email: 'kishan@gharkharch.app',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    }
  },
  {
    id: 'mem_02',
    household_id: 'hh_sharma_family',
    user_id: 'usr_member_002',
    role: 'member',
    profile: {
      id: 'usr_member_002',
      full_name: 'Pooja Sharma',
      email: 'pooja@gharkharch.app',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    }
  }
];

export const SAMPLE_CATEGORIES = DEFAULT_CATEGORIES.map(cat => ({
  ...cat,
  household_id: 'hh_sharma_family',
  is_active: true,
  created_at: new Date().toISOString(),
}));

export const SAMPLE_PAYMENT_MODES = DEFAULT_PAYMENT_MODES.map(pm => ({
  ...pm,
  household_id: 'hh_sharma_family',
  is_active: true,
  created_at: new Date().toISOString(),
}));

const today = new Date();
const formatDateOffset = (daysAgo) => {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const findCategory = (catId) => SAMPLE_CATEGORIES.find(c => c.id === catId);

export const SAMPLE_EXPENSES = [
  {
    id: 'exp_01',
    household_id: 'hh_sharma_family',
    category_id: 'cat_1', // Groceries
    category: findCategory('cat_1'),
    amount: 3450.00,
    description: 'Monthly D-Mart Supermarket Supplies',
    expense_date: formatDateOffset(0),
    payment_mode: 'UPI',
    created_by: 'usr_owner_001',
    profile: { id: 'usr_owner_001', full_name: 'Kishan Sharma' },
    notes: 'Bought pulses, rice, cooking oil & soaps',
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'exp_02',
    household_id: 'hh_sharma_family',
    category_id: 'cat_2', // Milk & Vegetables
    category: findCategory('cat_2'),
    amount: 380.00,
    description: 'Fresh vegetables & 2L Amul Milk',
    expense_date: formatDateOffset(0),
    payment_mode: 'Cash',
    created_by: 'usr_member_002',
    profile: { id: 'usr_member_002', full_name: 'Pooja Sharma' },
    notes: 'Local vegetable vendor',
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'exp_03',
    household_id: 'hh_sharma_family',
    category_id: 'cat_3', // Rent
    category: findCategory('cat_3'),
    amount: 18500.00,
    description: 'Monthly Apartment Rent Payment',
    expense_date: formatDateOffset(2),
    payment_mode: 'Net Banking',
    created_by: 'usr_owner_001',
    profile: { id: 'usr_owner_001', full_name: 'Kishan Sharma' },
    notes: 'Transferred to Landlord via NEFT',
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'exp_04',
    household_id: 'hh_sharma_family',
    category_id: 'cat_4', // Electricity
    category: findCategory('cat_4'),
    amount: 2420.00,
    description: 'MSEDCL Electricity Bill for August',
    expense_date: formatDateOffset(3),
    payment_mode: 'UPI',
    created_by: 'usr_owner_001',
    profile: { id: 'usr_owner_001', full_name: 'Kishan Sharma' },
    notes: 'Paid via PhonePe',
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'exp_05',
    household_id: 'hh_sharma_family',
    category_id: 'cat_5', // Maid
    category: findCategory('cat_5'),
    amount: 4000.00,
    description: 'Househelp & Maid Monthly Salary',
    expense_date: formatDateOffset(5),
    payment_mode: 'Cash',
    created_by: 'usr_member_002',
    profile: { id: 'usr_member_002', full_name: 'Pooja Sharma' },
    notes: 'Sunita maid monthly fee',
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'exp_06',
    household_id: 'hh_sharma_family',
    category_id: 'cat_7', // Medicine
    category: findCategory('cat_7'),
    amount: 1150.00,
    description: 'Monthly BP & Diabetes Medicines',
    expense_date: formatDateOffset(6),
    payment_mode: 'Credit Card',
    created_by: 'usr_owner_001',
    profile: { id: 'usr_owner_001', full_name: 'Kishan Sharma' },
    notes: 'Apollo Pharmacy',
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'exp_07',
    household_id: 'hh_sharma_family',
    category_id: 'cat_9', // Fuel
    category: findCategory('cat_9'),
    amount: 2000.00,
    description: 'Car Petrol Tank Refill',
    expense_date: formatDateOffset(8),
    payment_mode: 'Credit Card',
    created_by: 'usr_owner_001',
    profile: { id: 'usr_owner_001', full_name: 'Kishan Sharma' },
    notes: 'HP Fuel Station',
    is_deleted: false,
    created_at: new Date().toISOString(),
  }
];
