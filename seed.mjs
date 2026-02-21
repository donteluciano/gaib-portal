import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pdxipbbaidzgetxduahz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkeGlwYmJhaWR6Z2V0eGR1YWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1ODMyMDIsImV4cCI6MjA4NzE1OTIwMn0.GS-If_KYV1b7qR404iXdftrLoxFIthgdbpX4DvE8IM8'
);

async function seed() {
  console.log('🌱 Seeding GAIB database...\n');

  // Insert test sites
  const sites = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Permian Basin Alpha',
      city: 'Midland',
      state: 'TX',
      stage: 3,
      status: 'active',
      inputs: { gasVolume: 15000, gasPressure: 850, phaseIStatus: 'complete', waterSource: 'municipal', politicalClimate: 'favorable', airPermitPathway: 'minor' }
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Eagle Ford Site B',
      city: 'San Antonio',
      state: 'TX',
      stage: 5,
      status: 'active',
      inputs: { gasVolume: 22000, gasPressure: 920, phaseIStatus: 'complete', waterSource: 'well', politicalClimate: 'neutral', airPermitPathway: 'major' }
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Bakken North',
      city: 'Williston',
      state: 'ND',
      stage: 2,
      status: 'active',
      inputs: { gasVolume: 8000, gasPressure: 650, phaseIStatus: 'pending', waterSource: 'TBD', politicalClimate: 'favorable', airPermitPathway: 'minor' }
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      name: 'Marcellus East',
      city: 'Pittsburgh',
      state: 'PA',
      stage: 1,
      status: 'active',
      inputs: { gasVolume: 12000, gasPressure: 780 }
    }
  ];

  const { error: sitesError } = await supabase.from('sites').upsert(sites);
  if (sitesError) {
    console.log('❌ Sites error:', sitesError.message);
    console.log('   (Table may not exist yet - run the schema SQL in Supabase first)');
  } else {
    console.log('✅ Sites: 4 inserted');
  }

  // Insert test leads
  const leads = [
    { first_name: 'John', last_name: 'Richardson', email: 'john.r@energyland.com', phone: '(432) 555-0101', company: 'Richardson Energy LLC', city: 'Odessa', state: 'TX', county: 'Ector', acreage: '640', asking_price: '$2,500,000', lead_status: 'qualified', lead_score: 85, relationship: 'landowner', current_use: 'Oil & Gas' },
    { first_name: 'Maria', last_name: 'Santos', email: 'msantos@texasranch.co', phone: '(210) 555-0202', company: 'Santos Ranch Holdings', city: 'Laredo', state: 'TX', county: 'Webb', acreage: '1200', asking_price: '$4,800,000', lead_status: 'reviewing', lead_score: 72, relationship: 'broker', current_use: 'Agricultural' },
    { first_name: 'Robert', last_name: 'Chen', email: 'rchen@midwestdev.com', phone: '(701) 555-0303', company: 'Midwest Development Corp', city: 'Bismarck', state: 'ND', county: 'Burleigh', acreage: '320', asking_price: '$850,000', lead_status: 'new', lead_score: 45, relationship: 'developer', current_use: 'Industrial' },
    { first_name: 'Sarah', last_name: 'Williams', email: 'swilliams@appalachianinv.com', phone: '(412) 555-0404', company: 'Appalachian Investors', city: 'Morgantown', state: 'WV', county: 'Monongalia', acreage: '480', asking_price: '$1,200,000', lead_status: 'new', lead_score: 60, relationship: 'landowner', current_use: 'Timber' }
  ];

  const { error: leadsError } = await supabase.from('leads').upsert(leads, { onConflict: 'email' });
  if (leadsError) {
    console.log('❌ Leads error:', leadsError.message);
  } else {
    console.log('✅ Leads: 4 inserted');
  }

  // Insert test activities
  const activities = [
    { site_id: '11111111-1111-1111-1111-111111111111', action: 'Phase I Environmental completed', date: new Date(Date.now() - 3*24*60*60*1000).toISOString() },
    { site_id: '11111111-1111-1111-1111-111111111111', action: 'Gas interconnect agreement signed', date: new Date(Date.now() - 1*24*60*60*1000).toISOString() },
    { site_id: '22222222-2222-2222-2222-222222222222', action: 'Community meeting held', date: new Date(Date.now() - 2*24*60*60*1000).toISOString() },
    { site_id: '22222222-2222-2222-2222-222222222222', action: 'Political support letter received', date: new Date().toISOString() },
    { site_id: '33333333-3333-3333-3333-333333333333', action: 'Initial site visit completed', date: new Date(Date.now() - 4*24*60*60*1000).toISOString() }
  ];

  const { error: activitiesError } = await supabase.from('activities').insert(activities);
  if (activitiesError) {
    console.log('❌ Activities error:', activitiesError.message);
  } else {
    console.log('✅ Activities: 5 inserted');
  }

  // Insert test checklist items
  const checklistItems = [
    // Permian Basin Alpha (Stage 3)
    { site_id: '11111111-1111-1111-1111-111111111111', stage: 1, item: 'LOI Signed', status: 'complete' },
    { site_id: '11111111-1111-1111-1111-111111111111', stage: 1, item: 'Title Search', status: 'complete' },
    { site_id: '11111111-1111-1111-1111-111111111111', stage: 1, item: 'Survey Complete', status: 'complete' },
    { site_id: '11111111-1111-1111-1111-111111111111', stage: 2, item: 'Gas Volume Confirmed', status: 'complete' },
    { site_id: '11111111-1111-1111-1111-111111111111', stage: 2, item: 'Interconnect Agreement', status: 'complete' },
    { site_id: '11111111-1111-1111-1111-111111111111', stage: 2, item: 'Power Study', status: 'complete' },
    { site_id: '11111111-1111-1111-1111-111111111111', stage: 3, item: 'Phase I Environmental', status: 'complete' },
    { site_id: '11111111-1111-1111-1111-111111111111', stage: 3, item: 'Water Rights', status: 'in_progress' },
    { site_id: '11111111-1111-1111-1111-111111111111', stage: 3, item: 'Air Permit Application', status: 'pending' },
    // Eagle Ford Site B (Stage 5)
    { site_id: '22222222-2222-2222-2222-222222222222', stage: 1, item: 'LOI Signed', status: 'complete' },
    { site_id: '22222222-2222-2222-2222-222222222222', stage: 1, item: 'Title Search', status: 'complete' },
    { site_id: '22222222-2222-2222-2222-222222222222', stage: 2, item: 'Gas Volume Confirmed', status: 'complete' },
    { site_id: '22222222-2222-2222-2222-222222222222', stage: 3, item: 'Phase I Environmental', status: 'complete' },
    { site_id: '22222222-2222-2222-2222-222222222222', stage: 4, item: 'Fiber Agreement', status: 'complete' },
    { site_id: '22222222-2222-2222-2222-222222222222', stage: 5, item: 'Community Outreach', status: 'complete' },
    { site_id: '22222222-2222-2222-2222-222222222222', stage: 5, item: 'Political Support', status: 'in_progress' },
    // Bakken North (Stage 2)
    { site_id: '33333333-3333-3333-3333-333333333333', stage: 1, item: 'LOI Signed', status: 'complete' },
    { site_id: '33333333-3333-3333-3333-333333333333', stage: 1, item: 'Title Search', status: 'in_progress' },
    { site_id: '33333333-3333-3333-3333-333333333333', stage: 2, item: 'Gas Volume Assessment', status: 'in_progress' },
    // Marcellus East (Stage 1)
    { site_id: '44444444-4444-4444-4444-444444444444', stage: 1, item: 'Initial Contact', status: 'complete' },
    { site_id: '44444444-4444-4444-4444-444444444444', stage: 1, item: 'LOI Draft', status: 'pending' }
  ];

  const { error: checklistError } = await supabase.from('checklist_items').insert(checklistItems);
  if (checklistError) {
    console.log('❌ Checklist error:', checklistError.message);
  } else {
    console.log('✅ Checklist items: 22 inserted');
  }

  console.log('\n🎉 Done! Refresh the portal to see your data.');
}

seed();
