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
  subtitle?: string;
  description: string;
  price: number; // kuruş cinsinden
  original_price?: number;
  duration: string;
  target_audience?: string;
  weekly_lessons?: string;
  lesson_details?: any;
  features: any[];
  is_popular?: boolean;
  is_premium?: boolean;
  icon?: string;
  gradient?: string;
  bg_color?: string;
  text_color?: string;
  is_active?: boolean;
  category?: string;
  category_id?: string;
  difficulty_level?: string;
  max_students?: number;
  min_age?: number;
  max_age?: number;
  prerequisites?: string;
  certificate_provided?: boolean;
  refund_policy?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentPackage {
  id: string;
  student_id: string;
  package_id: string;
  purchase_date: string;
  start_date?: string;
  expiry_date?: string;
  remaining_lessons: number;
  total_lessons: number;
  lessons_used?: number;
  last_lesson_date?: string;
  status: 'active' | 'expired' | 'cancelled';
  notes?: string;
  discount_applied?: number;
  original_amount?: number;
  final_amount?: number;
  created_at: string;
  updated_at: string;
  packages?: Package;
}

export interface PackageCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PackageReview {
  id: string;
  package_id: string;
  student_id: string;
  rating: number;
  review_text?: string;
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  student?: Student;
}

export interface PackageDiscount {
  id: string;
  package_id: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  start_date: string;
  end_date: string;
  max_uses?: number;
  current_uses: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PackageAnalytics {
  id: string;
  package_id: string;
  date: string;
  views_count: number;
  purchases_count: number;
  revenue: number;
  refunds_count: number;
  completion_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  package_id: string;
  student_package_id?: string;
  amount: number; // kuruş cinsinden
  installments: number;
  payment_method?: string;
  iyzico_payment_id?: string;
  iyzico_conversation_id?: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  payment_date?: string;
  created_at: string;
  updated_at: string;
  packages?: Package;
  student_packages?: StudentPackage;
}

export interface PaymentInstallment {
  id: string;
  payment_id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: 'pending' | 'paid' | 'overdue' | 'failed';
  iyzico_installment_id?: string;
  created_at: string;
  updated_at: string;
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