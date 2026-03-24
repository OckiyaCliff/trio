export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent'

export interface Profile {
  id: string
  school_id: string | null
  role: UserRole
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface School {
  id: string
  name: string
  code: string
  address: string | null
  phone: string | null
  email: string | null
  logo_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AcademicYear {
  id: string
  school_id: string
  name: string
  start_date: string
  end_date: string
  is_current: boolean
  created_at: string
}

export interface Term {
  id: string
  academic_year_id: string
  name: string
  start_date: string
  end_date: string
  is_current: boolean
  created_at: string
}

export interface Grade {
  id: string
  school_id: string
  name: string
  level: number
  created_at: string
}

export interface Subject {
  id: string
  school_id: string
  name: string
  code: string | null
  description: string | null
  created_at: string
}

export interface Class {
  id: string
  school_id: string
  grade_id: string
  academic_year_id: string
  name: string
  capacity: number | null
  created_at: string
}

export interface ClassSubject {
  id: string
  class_id: string
  subject_id: string
  teacher_id: string
  created_at: string
}

export interface ClassStudent {
  id: string
  class_id: string
  student_id: string
  enrolled_at: string
}

export interface Assessment {
  id: string
  class_subject_id: string
  term_id: string
  name: string
  type: 'exam' | 'quiz' | 'assignment' | 'project' | 'other'
  max_score: number
  weight: number
  due_date: string | null
  created_at: string
}

export interface Score {
  id: string
  assessment_id: string
  student_id: string
  score: number | null
  remarks: string | null
  graded_by: string
  graded_at: string
  created_at: string
}

export interface ParentStudent {
  id: string
  parent_id: string
  student_id: string
  relationship: string | null
  created_at: string
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'School Admin',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent',
}

export const ROLE_DASHBOARD_MAP: Record<UserRole, string> = {
  super_admin: '/dashboard/super-admin',
  admin: '/dashboard/admin',
  teacher: '/dashboard/teacher',
  student: '/dashboard/student',
  parent: '/dashboard/parent',
}
