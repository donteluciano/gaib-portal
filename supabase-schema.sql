-- GAIB Portal Database Schema
-- Run this in Supabase SQL Editor

-- Sites table
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  stage INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  inputs JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT,
  city TEXT,
  state TEXT,
  county TEXT,
  acreage TEXT,
  asking_price TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  lead_status TEXT DEFAULT 'new',
  lead_score INTEGER DEFAULT 0,
  relationship TEXT,
  current_use TEXT,
  additional_notes TEXT,
  converted_site_id UUID REFERENCES sites(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checklist items table
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  stage INTEGER NOT NULL,
  item TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fund settings table
CREATE TABLE IF NOT EXISTS fund_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site actuals table
CREATE TABLE IF NOT EXISTS site_actuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  category TEXT,
  amount DECIMAL,
  date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DD Answers table
CREATE TABLE IF NOT EXISTS dd_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  question_id TEXT,
  answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site incentives table
CREATE TABLE IF NOT EXISTS site_incentives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  incentive_type TEXT,
  amount DECIMAL,
  status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (but allow all for now)
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_actuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dd_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_incentives ENABLE ROW LEVEL SECURITY;

-- Policies to allow all access (for development)
CREATE POLICY "Allow all" ON sites FOR ALL USING (true);
CREATE POLICY "Allow all" ON leads FOR ALL USING (true);
CREATE POLICY "Allow all" ON activities FOR ALL USING (true);
CREATE POLICY "Allow all" ON checklist_items FOR ALL USING (true);
CREATE POLICY "Allow all" ON fund_settings FOR ALL USING (true);
CREATE POLICY "Allow all" ON site_actuals FOR ALL USING (true);
CREATE POLICY "Allow all" ON dd_answers FOR ALL USING (true);
CREATE POLICY "Allow all" ON site_incentives FOR ALL USING (true);

-- =====================
-- TEST DATA
-- =====================

-- Insert test sites
INSERT INTO sites (id, name, city, state, stage, status, inputs, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Permian Basin Alpha', 'Midland', 'TX', 3, 'active', 
   '{"gasVolume": 15000, "gasPressure": 850, "phaseIStatus": "complete", "waterSource": "municipal", "politicalClimate": "favorable", "airPermitPathway": "minor"}',
   NOW() - INTERVAL '2 days'),
  ('22222222-2222-2222-2222-222222222222', 'Eagle Ford Site B', 'San Antonio', 'TX', 5, 'active',
   '{"gasVolume": 22000, "gasPressure": 920, "phaseIStatus": "complete", "waterSource": "well", "politicalClimate": "neutral", "airPermitPathway": "major"}',
   NOW() - INTERVAL '1 day'),
  ('33333333-3333-3333-3333-333333333333', 'Bakken North', 'Williston', 'ND', 2, 'active',
   '{"gasVolume": 8000, "gasPressure": 650, "phaseIStatus": "pending", "waterSource": "TBD", "politicalClimate": "favorable", "airPermitPathway": "minor"}',
   NOW()),
  ('44444444-4444-4444-4444-444444444444', 'Marcellus East', 'Pittsburgh', 'PA', 1, 'active',
   '{"gasVolume": 12000, "gasPressure": 780}',
   NOW() - INTERVAL '5 days');

-- Insert test leads
INSERT INTO leads (first_name, last_name, email, phone, company, city, state, county, acreage, asking_price, lead_status, lead_score, relationship, current_use) VALUES
  ('John', 'Richardson', 'john.r@energyland.com', '(432) 555-0101', 'Richardson Energy LLC', 'Odessa', 'TX', 'Ector', '640', '$2,500,000', 'qualified', 85, 'landowner', 'Oil & Gas'),
  ('Maria', 'Santos', 'msantos@texasranch.co', '(210) 555-0202', 'Santos Ranch Holdings', 'Laredo', 'TX', 'Webb', '1200', '$4,800,000', 'reviewing', 72, 'broker', 'Agricultural'),
  ('Robert', 'Chen', 'rchen@midwestdev.com', '(701) 555-0303', 'Midwest Development Corp', 'Bismarck', 'ND', 'Burleigh', '320', '$850,000', 'new', 45, 'developer', 'Industrial'),
  ('Sarah', 'Williams', 'swilliams@appalachianinv.com', '(412) 555-0404', 'Appalachian Investors', 'Morgantown', 'WV', 'Monongalia', '480', '$1,200,000', 'new', 60, 'landowner', 'Timber');

-- Insert test activities
INSERT INTO activities (site_id, action, date) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Phase I Environmental completed', NOW() - INTERVAL '3 days'),
  ('11111111-1111-1111-1111-111111111111', 'Gas interconnect agreement signed', NOW() - INTERVAL '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'Community meeting held', NOW() - INTERVAL '2 days'),
  ('22222222-2222-2222-2222-222222222222', 'Political support letter received', NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Initial site visit completed', NOW() - INTERVAL '4 days');

-- Insert test checklist items
INSERT INTO checklist_items (site_id, stage, item, status) VALUES
  -- Permian Basin Alpha (Stage 3)
  ('11111111-1111-1111-1111-111111111111', 1, 'LOI Signed', 'complete'),
  ('11111111-1111-1111-1111-111111111111', 1, 'Title Search', 'complete'),
  ('11111111-1111-1111-1111-111111111111', 1, 'Survey Complete', 'complete'),
  ('11111111-1111-1111-1111-111111111111', 2, 'Gas Volume Confirmed', 'complete'),
  ('11111111-1111-1111-1111-111111111111', 2, 'Interconnect Agreement', 'complete'),
  ('11111111-1111-1111-1111-111111111111', 2, 'Power Study', 'complete'),
  ('11111111-1111-1111-1111-111111111111', 3, 'Phase I Environmental', 'complete'),
  ('11111111-1111-1111-1111-111111111111', 3, 'Water Rights', 'in_progress'),
  ('11111111-1111-1111-1111-111111111111', 3, 'Air Permit Application', 'pending'),
  -- Eagle Ford Site B (Stage 5)
  ('22222222-2222-2222-2222-222222222222', 1, 'LOI Signed', 'complete'),
  ('22222222-2222-2222-2222-222222222222', 1, 'Title Search', 'complete'),
  ('22222222-2222-2222-2222-222222222222', 2, 'Gas Volume Confirmed', 'complete'),
  ('22222222-2222-2222-2222-222222222222', 3, 'Phase I Environmental', 'complete'),
  ('22222222-2222-2222-2222-222222222222', 4, 'Fiber Agreement', 'complete'),
  ('22222222-2222-2222-2222-222222222222', 5, 'Community Outreach', 'complete'),
  ('22222222-2222-2222-2222-222222222222', 5, 'Political Support', 'in_progress'),
  -- Bakken North (Stage 2)
  ('33333333-3333-3333-3333-333333333333', 1, 'LOI Signed', 'complete'),
  ('33333333-3333-3333-3333-333333333333', 1, 'Title Search', 'in_progress'),
  ('33333333-3333-3333-3333-333333333333', 2, 'Gas Volume Assessment', 'in_progress'),
  -- Marcellus East (Stage 1)
  ('44444444-4444-4444-4444-444444444444', 1, 'Initial Contact', 'complete'),
  ('44444444-4444-4444-4444-444444444444', 1, 'LOI Draft', 'pending');
