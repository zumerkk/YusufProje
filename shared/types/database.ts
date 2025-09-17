export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          role: 'student' | 'teacher' | 'admin'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          role: 'student' | 'teacher' | 'admin'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          role?: 'student' | 'teacher' | 'admin'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          phone: string | null
          avatar_url: string | null
          date_of_birth: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          phone?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teachers: {
        Row: {
          id: string
          user_id: string
          subjects: string[]
          experience_years: number
          hourly_rate: number
          bio: string | null
          education: string | null
          certifications: string[] | null
          rating: number | null
          total_students: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subjects: string[]
          experience_years: number
          hourly_rate: number
          bio?: string | null
          education?: string | null
          certifications?: string[] | null
          rating?: number | null
          total_students?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subjects?: string[]
          experience_years?: number
          hourly_rate?: number
          bio?: string | null
          education?: string | null
          certifications?: string[] | null
          rating?: number | null
          total_students?: number
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          user_id: string
          grade_level: string | null
          school_name: string | null
          parent_name: string | null
          parent_phone: string | null
          parent_email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          grade_level?: string | null
          school_name?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          parent_email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          grade_level?: string | null
          school_name?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          parent_email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teacher_subjects: {
        Row: {
          id: string
          teacher_id: string
          subject_name: string
          grade_levels: string[]
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          subject_name: string
          grade_levels: string[]
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          subject_name?: string
          grade_levels?: string[]
          created_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          teacher_id: string
          student_id: string
          subject: string
          date_time: string
          duration_minutes: number
          price: number
          status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          student_id: string
          subject: string
          date_time: string
          duration_minutes: number
          price: number
          status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          student_id?: string
          subject?: string
          date_time?: string
          duration_minutes?: number
          price?: number
          status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lesson_reviews: {
        Row: {
          id: string
          lesson_id: string
          student_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          student_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          student_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Type helpers for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types
export type User = Tables<'users'>
export type Profile = Tables<'profiles'>
export type Teacher = Tables<'teachers'>
export type Student = Tables<'students'>
export type TeacherSubject = Tables<'teacher_subjects'>
export type Lesson = Tables<'lessons'>
export type LessonReview = Tables<'lesson_reviews'>

// Insert types
export type UserInsert = TablesInsert<'users'>
export type ProfileInsert = TablesInsert<'profiles'>
export type TeacherInsert = TablesInsert<'teachers'>
export type StudentInsert = TablesInsert<'students'>
export type TeacherSubjectInsert = TablesInsert<'teacher_subjects'>
export type LessonInsert = TablesInsert<'lessons'>
export type LessonReviewInsert = TablesInsert<'lesson_reviews'>

// Update types
export type UserUpdate = TablesUpdate<'users'>
export type ProfileUpdate = TablesUpdate<'profiles'>
export type TeacherUpdate = TablesUpdate<'teachers'>
export type StudentUpdate = TablesUpdate<'students'>
export type TeacherSubjectUpdate = TablesUpdate<'teacher_subjects'>
export type LessonUpdate = TablesUpdate<'lessons'>
export type LessonReviewUpdate = TablesUpdate<'lesson_reviews'>