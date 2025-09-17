// Shared types for Atlas Derslik application

export interface User {
  id: string;
  email: string;
  phone?: string;
  verified_email?: boolean;
  verified_phone?: boolean;
  total_lessons?: number;
  average_rating?: number;
  profile_completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  role: 'student' | 'teacher' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  profile_id: string;
  full_name?: string;
  bio?: string;
  experience_years?: number;
  hourly_rate?: number;
  is_verified: boolean;
  rating?: number;
  total_lessons: number;
  total_reviews?: number;
  subjects?: string[];
  availability_status?: string;
  location?: string;
  availability?: any;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Student {
  id: string;
  profile_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  grade_level?: string;
  school?: string;
  parent_name?: string;
  parent_phone?: string;
  subjects?: string[];
  status?: string;
  total_lessons?: number;
  average_rating?: number;
  completed_lessons?: number;
  total_hours?: number;
  last_lesson_date?: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface TeacherSubject {
  id: string;
  teacher_id: string;
  subject: string;
  grade_levels: string[];
  created_at: string;
  updated_at: string;
  teacher?: Teacher;
}

export interface Lesson {
  id: string;
  teacher_id: string;
  student_id: string;
  subject: string;
  title: string;
  description?: string;
  scheduled_at: string;
  lesson_date?: string;
  start_time?: string;
  end_time?: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'confirmed' | 'pending';
  price: number;
  meeting_url?: string;
  notes?: string;
  rating?: number;
  student_name?: string;
  location?: string;
  review?: string;
  created_at: string;
  updated_at: string;
  teacher?: Teacher;
  student?: Student;
}

export interface LessonReview {
  id: string;
  lesson_id: string;
  reviewer_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  lesson?: Lesson;
  reviewer?: Profile;
}

// Auth related types
export interface AuthUser {
  id: string;
  email: string;
  profile?: Profile;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'student' | 'teacher';
  // Teacher specific fields
  bio?: string;
  experienceYears?: number;
  hourlyRate?: number;
  subjects?: string[];
  gradeLevels?: string[];
  // Student specific fields
  gradeLevel?: string;
  school?: string;
  parentName?: string;
  parentPhone?: string;
}

// Form validation types
export interface FormErrors {
  [key: string]: string | undefined;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Dashboard stats types
export interface TeacherStats {
  totalLessons: number;
  completedLessons: number;
  upcomingLessons: number;
  totalEarnings: number;
  averageRating: number;
  totalStudents: number;
}

export interface StudentStats {
  totalLessons: number;
  completedLessons: number;
  upcomingLessons: number;
  totalSpent: number;
  favoriteSubjects: string[];
}

export interface AdminStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalLessons: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  requiresAuth?: boolean;
  roles?: ('student' | 'teacher' | 'admin')[];
}

// Package types for pricing
export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
  subjects: string[];
  gradeLevels: string[];
}

// Testimonial types
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
  date: string;
}

// Search and filter types
export interface TeacherFilters {
  subject?: string;
  gradeLevel?: string;
  minRating?: number;
  maxPrice?: number;
  availability?: string;
}

export interface SearchParams {
  query?: string;
  filters?: TeacherFilters;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'price' | 'experience';
  sortOrder?: 'asc' | 'desc';
}