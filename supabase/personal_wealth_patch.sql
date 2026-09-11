-- ==============================================================================
-- GHARKHARCH: OWNER PERSONAL WEALTH & SALARY SUITE PATCH
-- Run this in Supabase SQL Editor to add personal finance tables with strict RLS
-- ==============================================================================

-- 1. INCOMES TABLE (Salary, bonuses, freelance, etc.)
CREATE TABLE IF NOT EXISTS public.incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  source_type VARCHAR(50) DEFAULT 'salary' CHECK (
    source_type IN ('salary', 'bonus', 'freelance', 'investment_returns', 'rental', 'other')
  ),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  income_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. SAVINGS GOALS TABLE
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(12, 2) DEFAULT 0.00 CHECK (current_amount >= 0),
  target_date DATE,
  icon VARCHAR(50) DEFAULT 'Target',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'paused')),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. INVESTMENTS TABLE (SIPs, Mutual Funds, FDs, Gold, Stocks)
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  investment_type VARCHAR(50) DEFAULT 'mutual_fund' CHECK (
    investment_type IN ('mutual_fund', 'sip', 'stocks', 'ppf_epf', 'fixed_deposit', 'gold', 'crypto', 'other')
  ),
  invested_amount NUMERIC(12, 2) NOT NULL CHECK (invested_amount >= 0),
  current_value NUMERIC(12, 2) DEFAULT 0.00 CHECK (current_value >= 0),
  monthly_sip_amount NUMERIC(12, 2) DEFAULT 0.00,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. CATEGORY BUDGET LIMITS TABLE
CREATE TABLE IF NOT EXISTS public.category_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  monthly_limit NUMERIC(12, 2) NOT NULL CHECK (monthly_limit > 0),
  UNIQUE(household_id, category_id)
);

-- 5. DYNAMIC BUDGET RATIOS SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.budget_ratio_settings (
  household_id UUID PRIMARY KEY REFERENCES public.households(id) ON DELETE CASCADE,
  needs_pct INT DEFAULT 50 CHECK (needs_pct BETWEEN 0 AND 100),
  wants_pct INT DEFAULT 30 CHECK (wants_pct BETWEEN 0 AND 100),
  savings_pct INT DEFAULT 20 CHECK (savings_pct BETWEEN 0 AND 100),
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT check_ratios_sum CHECK (needs_pct + wants_pct + savings_pct = 100)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_incomes_household_id ON public.incomes(household_id);
CREATE INDEX IF NOT EXISTS idx_incomes_income_date ON public.incomes(income_date DESC);
CREATE INDEX IF NOT EXISTS idx_savings_goals_household ON public.savings_goals(household_id);
CREATE INDEX IF NOT EXISTS idx_investments_household ON public.investments(household_id);
CREATE INDEX IF NOT EXISTS idx_category_budgets_household ON public.category_budgets(household_id);

-- Updated_at Trigger for Incomes
DROP TRIGGER IF EXISTS trigger_incomes_updated_at ON public.incomes;
CREATE TRIGGER trigger_incomes_updated_at
  BEFORE UPDATE ON public.incomes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_ratio_settings ENABLE ROW LEVEL SECURITY;

-- POLICIES (RESTRICTED 100% TO HOUSEHOLD OWNER ONLY)
DROP POLICY IF EXISTS "Owner only view incomes" ON public.incomes;
CREATE POLICY "Owner only view incomes" ON public.incomes FOR SELECT TO authenticated USING (public.is_household_owner(household_id));

DROP POLICY IF EXISTS "Owner only insert incomes" ON public.incomes;
CREATE POLICY "Owner only insert incomes" ON public.incomes FOR INSERT TO authenticated WITH CHECK (public.is_household_owner(household_id));

DROP POLICY IF EXISTS "Owner only update incomes" ON public.incomes;
CREATE POLICY "Owner only update incomes" ON public.incomes FOR UPDATE TO authenticated USING (public.is_household_owner(household_id));

DROP POLICY IF EXISTS "Owner only delete incomes" ON public.incomes;
CREATE POLICY "Owner only delete incomes" ON public.incomes FOR DELETE TO authenticated USING (public.is_household_owner(household_id));

DROP POLICY IF EXISTS "Owner only view savings_goals" ON public.savings_goals;
CREATE POLICY "Owner only view savings_goals" ON public.savings_goals FOR SELECT TO authenticated USING (public.is_household_owner(household_id));

DROP POLICY IF EXISTS "Owner only insert savings_goals" ON public.savings_goals;
CREATE POLICY "Owner only insert savings_goals" ON public.savings_goals FOR INSERT TO authenticated WITH CHECK (public.is_household_owner(household_id));

DROP POLICY IF EXISTS "Owner only update savings_goals" ON public.savings_goals;
CREATE POLICY "Owner only update savings_goals" ON public.savings_goals FOR UPDATE TO authenticated USING (public.is_household_owner(household_id));

DROP POLICY IF EXISTS "Owner only delete savings_goals" ON public.savings_goals;
CREATE POLICY "Owner only delete savings_goals" ON public.savings_goals FOR DELETE TO authenticated USING (public.is_household_owner(household_id));

DROP POLICY IF EXISTS "Owner only view investments" ON public.investments;
CREATE POLICY "Owner only view investments" ON public.investments FOR SELECT TO authenticated USING (public.is_household_owner(household_id));

DROP POLICY IF EXISTS "Owner only insert investments" ON public.investments;
CREATE POLICY "Owner only insert investments" ON public.investments FOR INSERT TO authenticated WITH CHECK (public.is_household_owner(household_id));

DROP POLICY IF EXISTS "Owner only update investments" ON public.investments;
CREATE POLICY "Owner only update investments" ON public.investments FOR UPDATE TO authenticated USING (public.is_household_owner(household_id));

DROP POLICY IF EXISTS "Owner only delete investments" ON public.investments;
CREATE POLICY "Owner only delete investments" ON public.investments FOR DELETE TO authenticated USING (public.is_household_owner(household_id));

DROP POLICY IF EXISTS "Owner only view category_budgets" ON public.category_budgets;
CREATE POLICY "Owner only view category_budgets" ON public.category_budgets FOR SELECT TO authenticated USING (public.is_household_owner(household_id));

DROP POLICY IF EXISTS "Owner only insert category_budgets" ON public.category_budgets;
CREATE POLICY "Owner only insert category_budgets" ON public.category_budgets FOR INSERT TO authenticated WITH CHECK (public.is_household_owner(household_id));

DROP POLICY IF EXISTS "Owner only update category_budgets" ON public.category_budgets;
CREATE POLICY "Owner only update category_budgets" ON public.category_budgets FOR UPDATE TO authenticated USING (public.is_household_owner(household_id));

DROP POLICY IF EXISTS "Owner only delete category_budgets" ON public.category_budgets;
CREATE POLICY "Owner only delete category_budgets" ON public.category_budgets FOR DELETE TO authenticated USING (public.is_household_owner(household_id));

DROP POLICY IF EXISTS "Owner only view budget_ratio_settings" ON public.budget_ratio_settings;
CREATE POLICY "Owner only view budget_ratio_settings" ON public.budget_ratio_settings FOR SELECT TO authenticated USING (public.is_household_owner(household_id));

DROP POLICY IF EXISTS "Owner only insert budget_ratio_settings" ON public.budget_ratio_settings;
CREATE POLICY "Owner only insert budget_ratio_settings" ON public.budget_ratio_settings FOR INSERT TO authenticated WITH CHECK (public.is_household_owner(household_id));

DROP POLICY IF EXISTS "Owner only update budget_ratio_settings" ON public.budget_ratio_settings;
CREATE POLICY "Owner only update budget_ratio_settings" ON public.budget_ratio_settings FOR UPDATE TO authenticated USING (public.is_household_owner(household_id));

DROP POLICY IF EXISTS "Owner only delete budget_ratio_settings" ON public.budget_ratio_settings;
CREATE POLICY "Owner only delete budget_ratio_settings" ON public.budget_ratio_settings FOR DELETE TO authenticated USING (public.is_household_owner(household_id));
