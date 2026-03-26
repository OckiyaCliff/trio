-- Seed Data for TRIO

-- 1. Create a sample school
INSERT INTO public.schools (id, name, code, is_active)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'TRIO Academy', 'TRIO001', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

-- 2. Create an Academic Year
INSERT INTO public.academic_years (id, school_id, name, start_date, end_date, is_current)
VALUES 
  ('b1ef0c99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-2025', '2024-09-01', '2025-06-30', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Create a Term
INSERT INTO public.terms (id, academic_year_id, name, start_date, end_date, is_current)
VALUES 
  ('c2f01d99-9c0b-4ef8-bb6d-6bb9bd380a33', 'b1ef0c99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Term 1', '2024-09-01', '2024-12-20', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Create Grade Levels
INSERT INTO public.grade_levels (id, school_id, name, order_index)
VALUES 
  ('d3f12e99-9c0b-4ef8-bb6d-6bb9bd380a44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Grade 1', 1),
  ('e4f23e99-9c0b-4ef8-bb6d-6bb9bd380a55', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Grade 2', 2),
  ('f5f34d99-9c0b-4ef8-bb6d-6bb9bd380a66', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Grade 3', 3)
ON CONFLICT (id) DO NOTHING;

-- 5. Create Subjects
INSERT INTO public.subjects (id, school_id, name, code, description)
VALUES 
  ('06a45b99-9c0b-4ef8-bb6d-6bb9bd380a77', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mathematics', 'MATH01', 'Basic Mathematics'),
  ('17b56c99-9c0b-4ef8-bb6d-6bb9bd380a88', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'English Language', 'ENG01', 'English Grammar and Literature'),
  ('28c67d99-9c0b-4ef8-bb6d-6bb9bd380a99', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Science', 'SCI01', 'General Science')
ON CONFLICT (school_id, code) DO NOTHING;

-- 6. Create a Class
INSERT INTO public.classes (id, school_id, grade_level_id, academic_year_id, name, capacity)
VALUES 
  ('39d78e99-9c0b-4ef8-bb6d-6bb9bd380aaa', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd3f12e99-9c0b-4ef8-bb6d-6bb9bd380a44', 'b1ef0c99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Grade 1A', 30)
ON CONFLICT (id) DO NOTHING;

-- Note for Super Admin:
-- To set an existing user as a Super Admin, run the following SQL in Supabase SQL Editor:
-- UPDATE public.profiles SET role = 'super_admin' WHERE email = 'your-email@example.com';
