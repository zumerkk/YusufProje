// User roles
export type UserRole = 'student' | 'teacher' | 'admin'

// Profile type for auth user
export interface Profile {
  role: UserRole
  fullName: string
}

// Auth user type
export interface AuthUser {
  id: string
  email: string
  profile?: Profile
}

// Authentication types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  fullName: string
  role: UserRole
  phone?: string
  gradeLevel?: string
  schoolName?: string
  subjects?: string[]
  experienceYears?: number
  hourlyRate?: number
  bio?: string
}

// Form error types
export interface FormErrors {
  [key: string]: string
}

// User profile types
export interface UserProfile {
  id: string
  email: string
  fullName: string
  role: UserRole
  avatarUrl?: string
  phone?: string
  address?: string
  birthDate?: string
  gender?: string
  createdAt: string
  updatedAt: string
}

// Teacher specific types
export interface TeacherProfile extends UserProfile {
  subjects: string[]
  experienceYears: number
  hourlyRate: number
  bio?: string
  education?: string
  certifications?: string[]
  rating?: number
  totalStudents?: number
}

// Student specific types
export interface StudentProfile extends UserProfile {
  gradeLevel?: string
  schoolName?: string
  parentName?: string
  parentPhone?: string
  parentEmail?: string
}

// Lesson types
export interface Lesson {
  id: string
  teacherId: string
  studentId: string
  subject: string
  dateTime: string
  lesson_date?: string
  start_time?: string
  end_time?: string
  durationMinutes: number
  price: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'confirmed' | 'pending'
  notes?: string
  rating?: number
  student_name?: string
  location?: string
  review?: string
  createdAt: string
  updatedAt: string
}

// Lesson review types
export interface LessonReview {
  id: string
  lessonId: string
  studentId: string
  rating: number
  comment?: string
  createdAt: string
}

// API response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

// Export database types
export * from './database'