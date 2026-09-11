-- ==============================================================================
-- GHARKHARCH (DIGITAL HOUSEHOLD EXPENSE BOOK) - FULL SUPABASE DATABASE SCHEMA
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Tied to Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger Function: Auto-populate profile when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. HOUSEHOLDS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. HOUSEHOLD MEMBERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(household_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 4. HOUSEHOLD INVITATIONS TABLE (Family Invite System)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.household_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  invite_code VARCHAR(20) NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'cancelled', 'expired')),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days') NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 5. CATEGORIES TABLE (Dynamic & Soft Archivable)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) DEFAULT 'Tag' NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  sort_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_category_name_per_household 
  ON public.categories(household_id, LOWER(name));

-- Helper function: Seed default categories for a new household
CREATE OR REPLACE FUNCTION public.seed_default_categories(h_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.categories (household_id, name, icon, sort_order) VALUES
    (h_id, 'Groceries', 'ShoppingCart', 1),
    (h_id, 'Milk & Vegetables', 'Apple', 2),
    (h_id, 'House Rent', 'Home', 3),
    (h_id, 'Electricity & Utilities', 'Zap', 4),
    (h_id, 'Maid & Domestic Help', 'UserCheck', 5),
    (h_id, 'Dining & Food Out', 'Utensils', 6),
    (h_id, 'Medicine & Health', 'HeartPulse', 7),
    (h_id, 'Education & Books', 'BookOpen', 8),
    (h_id, 'Transport & Fuel', 'Car', 9),
    (h_id, 'Shopping & Clothes', 'ShoppingBag', 10),
    (h_id, 'Miscellaneous', 'MoreHorizontal', 11)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 6. PAYMENT MODES TABLE (Fully Dynamic per Household)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  sort_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_payment_mode_name_per_household 
  ON public.payment_modes(household_id, LOWER(name));

-- Helper function: Seed default payment modes for a new household
CREATE OR REPLACE FUNCTION public.seed_default_payment_modes(h_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.payment_modes (household_id, name, sort_order) VALUES
    (h_id, 'Cash', 1),
    (h_id, 'UPI', 2),
    (h_id, 'Credit Card', 3),
    (h_id, 'Debit Card', 4),
    (h_id, 'Net Banking', 5)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 7. EXPENSES TABLE (Soft Delete & Exact Numeric Decimal Precision)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  description VARCHAR(255) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_mode VARCHAR(100) DEFAULT 'Cash' NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  notes TEXT,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for lightning fast mobile queries
CREATE INDEX IF NOT EXISTS idx_expenses_household_id ON public.expenses(household_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON public.expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON public.expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON public.expenses(created_by);
CREATE INDEX IF NOT EXISTS idx_expenses_is_deleted ON public.expenses(is_deleted);
CREATE INDEX IF NOT EXISTS idx_household_members_user_id ON public.household_members(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_code ON public.household_invitations(invite_code);

-- Updated_at Trigger for Expenses
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_expenses_updated_at ON public.expenses;
CREATE TRIGGER trigger_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & AUTHORIZATION POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Helper Functions
CREATE OR REPLACE FUNCTION public.is_household_member(_household_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = _household_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_household_owner(_household_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = _household_id AND user_id = auth.uid() AND role = 'owner'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Households Policies (Owner or Member can view)
DROP POLICY IF EXISTS "Members can view household" ON public.households;
CREATE POLICY "Members or owner can view household" ON public.households FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.is_household_member(id));
CREATE POLICY "Authenticated users can create household" ON public.households FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner can update household" ON public.households FOR UPDATE TO authenticated USING (owner_id = auth.uid());

-- Household Members Policies
CREATE POLICY "Members can view co-members" ON public.household_members FOR SELECT TO authenticated USING (public.is_household_member(household_id));
CREATE POLICY "Owners or self can insert member" ON public.household_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_household_owner(household_id));
CREATE POLICY "Owner can delete members" ON public.household_members FOR DELETE TO authenticated USING (public.is_household_owner(household_id));

-- Invitations Policies
CREATE POLICY "Members can view invitations" ON public.household_invitations FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Owners can create invitations" ON public.household_invitations FOR INSERT TO authenticated WITH CHECK (public.is_household_owner(household_id));
CREATE POLICY "Owners or claimers can update invitations" ON public.household_invitations FOR UPDATE TO authenticated USING (TRUE);

-- Categories Policies
CREATE POLICY "Members can view categories" ON public.categories FOR SELECT TO authenticated USING (public.is_household_member(household_id));
CREATE POLICY "Owners can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (public.is_household_owner(household_id));
CREATE POLICY "Owners can update categories" ON public.categories FOR UPDATE TO authenticated USING (public.is_household_owner(household_id));
CREATE POLICY "Owners can delete categories" ON public.categories FOR DELETE TO authenticated USING (public.is_household_owner(household_id));

-- Payment Modes Policies
CREATE POLICY "Members can view payment modes" ON public.payment_modes FOR SELECT TO authenticated USING (public.is_household_member(household_id));
CREATE POLICY "Owners can insert payment modes" ON public.payment_modes FOR INSERT TO authenticated WITH CHECK (public.is_household_owner(household_id));
CREATE POLICY "Owners can update payment modes" ON public.payment_modes FOR UPDATE TO authenticated USING (public.is_household_owner(household_id));
CREATE POLICY "Owners can delete payment modes" ON public.payment_modes FOR DELETE TO authenticated USING (public.is_household_owner(household_id));

-- Expenses Policies
CREATE POLICY "Members view active expenses, Owners view all" ON public.expenses FOR SELECT TO authenticated USING (public.is_household_member(household_id) AND (is_deleted = FALSE OR public.is_household_owner(household_id)));
CREATE POLICY "Members can create expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (public.is_household_member(household_id) AND created_by = auth.uid());
CREATE POLICY "Owner updates any, Member updates own expense" ON public.expenses FOR UPDATE TO authenticated USING (public.is_household_member(household_id) AND (public.is_household_owner(household_id) OR created_by = auth.uid()));
CREATE POLICY "Owner only hard delete" ON public.expenses FOR DELETE TO authenticated USING (public.is_household_owner(household_id));

-- ------------------------------------------------------------------------------
-- 8. REMINDERS & RENEWALS REGISTER TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category_type VARCHAR(50) DEFAULT 'other' CHECK (
    category_type IN ('vehicle_puc', 'insurance', 'software_renewal', 'health_mediclaim', 'household_bill', 'other')
  ),
  due_date DATE NOT NULL,
  estimated_cost NUMERIC(12, 2) DEFAULT 0.00 CHECK (estimated_cost >= 0),
  reminder_days_before INT DEFAULT 7 CHECK (reminder_days_before >= 1),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'renewed', 'archived')),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reminders_household_id ON public.reminders(household_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due_date ON public.reminders(due_date ASC);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON public.reminders(status);

DROP TRIGGER IF EXISTS trigger_reminders_updated_at ON public.reminders;
CREATE TRIGGER trigger_reminders_updated_at
  BEFORE UPDATE ON public.reminders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view household reminders" ON public.reminders FOR SELECT TO authenticated USING (public.is_household_member(household_id));
CREATE POLICY "Members insert reminders" ON public.reminders FOR INSERT TO authenticated WITH CHECK (public.is_household_member(household_id) AND created_by = auth.uid());
CREATE POLICY "Members update household reminders" ON public.reminders FOR UPDATE TO authenticated USING (public.is_household_member(household_id));
CREATE POLICY "Owners delete reminders" ON public.reminders FOR DELETE TO authenticated USING (public.is_household_owner(household_id));

