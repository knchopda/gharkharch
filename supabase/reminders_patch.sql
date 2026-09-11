-- ==============================================================================
-- GHARKHARCH: RENEWALS & DOCUMENT REMINDERS REGISTER PATCH
-- Run this in Supabase SQL Editor to add the reminders table to your live database
-- ==============================================================================

-- 1. Create Reminders Table
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

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_reminders_household_id ON public.reminders(household_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due_date ON public.reminders(due_date ASC);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON public.reminders(status);

-- 3. Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_reminders_updated_at ON public.reminders;
CREATE TRIGGER trigger_reminders_updated_at
  BEFORE UPDATE ON public.reminders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- 5. Security Policies
DROP POLICY IF EXISTS "Members view household reminders" ON public.reminders;
CREATE POLICY "Members view household reminders" 
  ON public.reminders FOR SELECT 
  TO authenticated 
  USING (public.is_household_member(household_id));

DROP POLICY IF EXISTS "Members insert reminders" ON public.reminders;
CREATE POLICY "Members insert reminders" 
  ON public.reminders FOR INSERT 
  TO authenticated 
  WITH CHECK (public.is_household_member(household_id) AND created_by = auth.uid());

DROP POLICY IF EXISTS "Members update household reminders" ON public.reminders;
CREATE POLICY "Members update household reminders" 
  ON public.reminders FOR UPDATE 
  TO authenticated 
  USING (public.is_household_member(household_id));

DROP POLICY IF EXISTS "Owners delete reminders" ON public.reminders;
CREATE POLICY "Owners delete reminders" 
  ON public.reminders FOR DELETE 
  TO authenticated 
  USING (public.is_household_owner(household_id));
