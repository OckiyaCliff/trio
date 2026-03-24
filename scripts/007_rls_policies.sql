-- Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Helper function to get user school
CREATE OR REPLACE FUNCTION public.get_user_school_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid();
$$;

-- =====================
-- SCHOOLS POLICIES
-- =====================
DROP POLICY IF EXISTS "Super admins can do everything on schools" ON public.schools;
CREATE POLICY "Super admins can do everything on schools"
  ON public.schools FOR ALL
  USING (public.get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "Users can view their own school" ON public.schools;
CREATE POLICY "Users can view their own school"
  ON public.schools FOR SELECT
  USING (id = public.get_user_school_id());

-- =====================
-- PROFILES POLICIES
-- =====================
DROP POLICY IF EXISTS "Super admins can do everything on profiles" ON public.profiles;
CREATE POLICY "Super admins can do everything on profiles"
  ON public.profiles FOR ALL
  USING (public.get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "School admins can manage their school profiles" ON public.profiles;
CREATE POLICY "School admins can manage their school profiles"
  ON public.profiles FOR ALL
  USING (
    public.get_user_role() = 'school_admin' 
    AND school_id = public.get_user_school_id()
  );

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Teachers can view students in their classes" ON public.profiles;
CREATE POLICY "Teachers can view students in their classes"
  ON public.profiles FOR SELECT
  USING (
    public.get_user_role() = 'teacher'
    AND role = 'student'
    AND id IN (
      SELECT sc.student_id FROM public.student_classes sc
      JOIN public.class_subjects cs ON cs.class_id = sc.class_id
      WHERE cs.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Parents can view their children" ON public.profiles;
CREATE POLICY "Parents can view their children"
  ON public.profiles FOR SELECT
  USING (
    public.get_user_role() = 'parent'
    AND id IN (
      SELECT student_id FROM public.parent_students WHERE parent_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "School users can view school profiles" ON public.profiles;
CREATE POLICY "School users can view school profiles"
  ON public.profiles FOR SELECT
  USING (school_id = public.get_user_school_id());

-- =====================
-- ACADEMIC YEARS POLICIES
-- =====================
DROP POLICY IF EXISTS "Users can view their school academic years" ON public.academic_years;
CREATE POLICY "Users can view their school academic years"
  ON public.academic_years FOR SELECT
  USING (school_id = public.get_user_school_id() OR public.get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "Admins can manage academic years" ON public.academic_years;
CREATE POLICY "Admins can manage academic years"
  ON public.academic_years FOR ALL
  USING (
    public.get_user_role() = 'super_admin' 
    OR (public.get_user_role() = 'school_admin' AND school_id = public.get_user_school_id())
  );

-- =====================
-- TERMS POLICIES
-- =====================
DROP POLICY IF EXISTS "Users can view their school terms" ON public.terms;
CREATE POLICY "Users can view their school terms"
  ON public.terms FOR SELECT
  USING (
    academic_year_id IN (
      SELECT id FROM public.academic_years WHERE school_id = public.get_user_school_id()
    )
    OR public.get_user_role() = 'super_admin'
  );

DROP POLICY IF EXISTS "Admins can manage terms" ON public.terms;
CREATE POLICY "Admins can manage terms"
  ON public.terms FOR ALL
  USING (
    public.get_user_role() = 'super_admin'
    OR (
      public.get_user_role() = 'school_admin'
      AND academic_year_id IN (
        SELECT id FROM public.academic_years WHERE school_id = public.get_user_school_id()
      )
    )
  );

-- =====================
-- GRADE LEVELS POLICIES
-- =====================
DROP POLICY IF EXISTS "Users can view their school grade levels" ON public.grade_levels;
CREATE POLICY "Users can view their school grade levels"
  ON public.grade_levels FOR SELECT
  USING (school_id = public.get_user_school_id() OR public.get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "Admins can manage grade levels" ON public.grade_levels;
CREATE POLICY "Admins can manage grade levels"
  ON public.grade_levels FOR ALL
  USING (
    public.get_user_role() = 'super_admin'
    OR (public.get_user_role() = 'school_admin' AND school_id = public.get_user_school_id())
  );

-- =====================
-- SUBJECTS POLICIES
-- =====================
DROP POLICY IF EXISTS "Users can view their school subjects" ON public.subjects;
CREATE POLICY "Users can view their school subjects"
  ON public.subjects FOR SELECT
  USING (school_id = public.get_user_school_id() OR public.get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "Admins can manage subjects" ON public.subjects;
CREATE POLICY "Admins can manage subjects"
  ON public.subjects FOR ALL
  USING (
    public.get_user_role() = 'super_admin'
    OR (public.get_user_role() = 'school_admin' AND school_id = public.get_user_school_id())
  );

-- =====================
-- CLASSES POLICIES
-- =====================
DROP POLICY IF EXISTS "Users can view their school classes" ON public.classes;
CREATE POLICY "Users can view their school classes"
  ON public.classes FOR SELECT
  USING (school_id = public.get_user_school_id() OR public.get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "Admins can manage classes" ON public.classes;
CREATE POLICY "Admins can manage classes"
  ON public.classes FOR ALL
  USING (
    public.get_user_role() = 'super_admin'
    OR (public.get_user_role() = 'school_admin' AND school_id = public.get_user_school_id())
  );

-- =====================
-- CLASS SUBJECTS POLICIES
-- =====================
DROP POLICY IF EXISTS "Users can view class subjects in their school" ON public.class_subjects;
CREATE POLICY "Users can view class subjects in their school"
  ON public.class_subjects FOR SELECT
  USING (
    class_id IN (
      SELECT id FROM public.classes WHERE school_id = public.get_user_school_id()
    )
    OR public.get_user_role() = 'super_admin'
  );

DROP POLICY IF EXISTS "Admins can manage class subjects" ON public.class_subjects;
CREATE POLICY "Admins can manage class subjects"
  ON public.class_subjects FOR ALL
  USING (
    public.get_user_role() = 'super_admin'
    OR (
      public.get_user_role() = 'school_admin'
      AND class_id IN (
        SELECT id FROM public.classes WHERE school_id = public.get_user_school_id()
      )
    )
  );

-- =====================
-- STUDENT CLASSES POLICIES
-- =====================
DROP POLICY IF EXISTS "Students can view their own enrollments" ON public.student_classes;
CREATE POLICY "Students can view their own enrollments"
  ON public.student_classes FOR SELECT
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can view enrollments in their classes" ON public.student_classes;
CREATE POLICY "Teachers can view enrollments in their classes"
  ON public.student_classes FOR SELECT
  USING (
    class_id IN (
      SELECT class_id FROM public.class_subjects WHERE teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage student classes" ON public.student_classes;
CREATE POLICY "Admins can manage student classes"
  ON public.student_classes FOR ALL
  USING (
    public.get_user_role() = 'super_admin'
    OR (
      public.get_user_role() = 'school_admin'
      AND class_id IN (
        SELECT id FROM public.classes WHERE school_id = public.get_user_school_id()
      )
    )
  );

-- =====================
-- ASSESSMENTS POLICIES
-- =====================
DROP POLICY IF EXISTS "Teachers can manage assessments for their subjects" ON public.assessments;
CREATE POLICY "Teachers can manage assessments for their subjects"
  ON public.assessments FOR ALL
  USING (
    class_subject_id IN (
      SELECT id FROM public.class_subjects WHERE teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can view assessments for their classes" ON public.assessments;
CREATE POLICY "Students can view assessments for their classes"
  ON public.assessments FOR SELECT
  USING (
    class_subject_id IN (
      SELECT cs.id FROM public.class_subjects cs
      JOIN public.student_classes sc ON sc.class_id = cs.class_id
      WHERE sc.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage all assessments" ON public.assessments;
CREATE POLICY "Admins can manage all assessments"
  ON public.assessments FOR ALL
  USING (
    public.get_user_role() = 'super_admin'
    OR (
      public.get_user_role() = 'school_admin'
      AND class_subject_id IN (
        SELECT cs.id FROM public.class_subjects cs
        JOIN public.classes c ON c.id = cs.class_id
        WHERE c.school_id = public.get_user_school_id()
      )
    )
  );

-- =====================
-- STUDENT SCORES POLICIES
-- =====================
DROP POLICY IF EXISTS "Teachers can manage scores for their assessments" ON public.student_scores;
CREATE POLICY "Teachers can manage scores for their assessments"
  ON public.student_scores FOR ALL
  USING (
    assessment_id IN (
      SELECT a.id FROM public.assessments a
      JOIN public.class_subjects cs ON cs.id = a.class_subject_id
      WHERE cs.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can view their own scores" ON public.student_scores;
CREATE POLICY "Students can view their own scores"
  ON public.student_scores FOR SELECT
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Parents can view their children scores" ON public.student_scores;
CREATE POLICY "Parents can view their children scores"
  ON public.student_scores FOR SELECT
  USING (
    student_id IN (
      SELECT student_id FROM public.parent_students WHERE parent_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage all scores" ON public.student_scores;
CREATE POLICY "Admins can manage all scores"
  ON public.student_scores FOR ALL
  USING (
    public.get_user_role() = 'super_admin'
    OR (
      public.get_user_role() = 'school_admin'
      AND assessment_id IN (
        SELECT a.id FROM public.assessments a
        JOIN public.class_subjects cs ON cs.id = a.class_subject_id
        JOIN public.classes c ON c.id = cs.class_id
        WHERE c.school_id = public.get_user_school_id()
      )
    )
  );

-- =====================
-- PARENT STUDENTS POLICIES
-- =====================
DROP POLICY IF EXISTS "Parents can view their own relationships" ON public.parent_students;
CREATE POLICY "Parents can view their own relationships"
  ON public.parent_students FOR SELECT
  USING (parent_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage parent-student relationships" ON public.parent_students;
CREATE POLICY "Admins can manage parent-student relationships"
  ON public.parent_students FOR ALL
  USING (
    public.get_user_role() IN ('super_admin', 'school_admin')
  );
