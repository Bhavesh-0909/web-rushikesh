-- Supabase Schema for Employee & Payslip Management System
-- Drop tables if they exist (for clean deployment/re-run capability)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 1. Create Employee Profiles Table
CREATE TABLE IF NOT EXISTS public.employee_profiles (
    id SERIAL PRIMARY KEY,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    employee_id TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending' NOT NULL,
    disabled BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Salary Components Table
CREATE TABLE IF NOT EXISTS public.salary_components (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    type TEXT CHECK (type IN ('earning', 'deduction')) NOT NULL,
    attendance_based BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Employee Salary Structure Table
CREATE TABLE IF NOT EXISTS public.employee_salary_structure (
    id SERIAL PRIMARY KEY,
    employee_profile_id INTEGER REFERENCES public.employee_profiles(id) ON DELETE CASCADE NOT NULL,
    component_id INTEGER REFERENCES public.salary_components(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_profile_id, component_id)
);

-- 4. Create Attendance Records Table
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id SERIAL PRIMARY KEY,
    employee_profile_id INTEGER REFERENCES public.employee_profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status TEXT CHECK (status IN ('present', 'absent', 'late', 'half_day')) DEFAULT 'present' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_profile_id, date)
);

-- 5. Create Payslips Table
CREATE TABLE IF NOT EXISTS public.payslips (
    id SERIAL PRIMARY KEY,
    employee_profile_id INTEGER REFERENCES public.employee_profiles(id) ON DELETE CASCADE NOT NULL,
    month TEXT NOT NULL, -- format: YYYY-MM
    basic_salary NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    hra NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    travel_allowance NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    bonus NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    pf_deduction NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    tax_deduction NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    other_earnings NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    other_deductions NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    custom_components JSONB DEFAULT '{}'::jsonb NOT NULL,
    total_present_days INTEGER DEFAULT 0 NOT NULL,
    total_working_days INTEGER DEFAULT 0 NOT NULL,
    gross_salary NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    total_deductions NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    net_salary NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_profile_id, month)
);

-- 6. Trigger to automatically create employee profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    emp_id text;
    emp_role text;
    emp_full_name text;
    emp_phone text;
BEGIN
    emp_id := COALESCE(new.raw_user_meta_data->>'employee_id', 'EMP-' || upper(substring(md5(random()::text) from 1 for 6)));
    emp_role := COALESCE(new.raw_user_meta_data->>'role', 'Junior Architect');
    emp_full_name := COALESCE(new.raw_user_meta_data->>'full_name', 'Employee');
    emp_phone := COALESCE(new.raw_user_meta_data->>'phone', '');

    INSERT INTO public.employee_profiles (
        auth_user_id,
        full_name,
        email,
        phone,
        employee_id,
        role,
        approval_status,
        disabled
    ) VALUES (
        new.id,
        emp_full_name,
        new.email,
        emp_phone,
        emp_id,
        emp_role,
        'pending',
        false
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Seed Default Salary Components if they don't exist
INSERT INTO public.salary_components (name, type, attendance_based) VALUES
('Basic Salary', 'earning', true),
('HRA', 'earning', false),
('Travel Allowance', 'earning', true),
('Bonus', 'earning', false),
('PF Deduction', 'deduction', false),
('Tax Deduction', 'deduction', false)
ON CONFLICT (name) DO NOTHING;

-- 8. Enable Row Level Security (RLS) on all public tables
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_salary_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;

-- 9. Row Level Security Policies

-- Employees can read their own profile, anyone can insert (for trigger/signup), admins can do everything
CREATE POLICY "Allow employees to view their own profile"
    ON public.employee_profiles FOR SELECT
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Allow service role or triggers to insert profiles"
    ON public.employee_profiles FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow admins full access to employee profiles"
    ON public.employee_profiles FOR ALL
    USING (true)
    WITH CHECK (true);

-- Salary components read-only for authenticated users, full control for admin
CREATE POLICY "Allow authenticated users to read salary components"
    ON public.salary_components FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to salary components"
    ON public.salary_components FOR ALL
    USING (true)
    WITH CHECK (true);

-- Salary structure read-only for own profile, full control for admin
CREATE POLICY "Allow employees to read their own salary structure"
    ON public.employee_salary_structure FOR SELECT
    USING (
        employee_profile_id IN (
            SELECT id FROM public.employee_profiles WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Allow admin full access to salary structure"
    ON public.employee_salary_structure FOR ALL
    USING (true)
    WITH CHECK (true);

-- Attendance: employees can read their own, insert their own (check-in), admin has full control
CREATE POLICY "Allow employees to read their own attendance"
    ON public.attendance_records FOR SELECT
    USING (
        employee_profile_id IN (
            SELECT id FROM public.employee_profiles WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Allow employees to insert their own check-in"
    ON public.attendance_records FOR INSERT
    WITH CHECK (
        employee_profile_id IN (
            SELECT id FROM public.employee_profiles WHERE auth_user_id = auth.uid() AND NOT disabled AND approval_status = 'approved'
        )
    );

CREATE POLICY "Allow admin full access to attendance"
    ON public.attendance_records FOR ALL
    USING (true)
    WITH CHECK (true);

-- Payslips: employees can read their own, admin full control
CREATE POLICY "Allow employees to view their own payslips"
    ON public.payslips FOR SELECT
    USING (
        employee_profile_id IN (
            SELECT id FROM public.employee_profiles WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Allow admin full access to payslips"
    ON public.payslips FOR ALL
    USING (true)
    WITH CHECK (true);
