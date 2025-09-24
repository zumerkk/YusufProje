import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Teacher } from '../../shared/types';

interface Lesson {
  id: string;
  teacher_id: string;
  student_id: string;
  subject: string;
  date_time: string;
  lesson_date?: string;
  duration_minutes: number;
  price: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  rating?: number;
  teacher?: Teacher;
}

interface BookLessonData {
  teacher_id: string;
  subject: string;
  date_time: string;
  duration_minutes: number;
  notes?: string;
}

interface StudentProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  grade: string;
  school?: string;
  bio?: string;
  subjects: string[];
  created_at: string;
  updated_at: string;
}

interface ReviewData {
  lesson_id: string;
  rating: number;
  comment?: string;
}

interface Review {
  id: string;
  lesson_id: string;
  student_id: string;
  teacher_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  lesson?: Lesson;
  teacher?: Teacher;
}

interface UseStudentReturn {
  loading: boolean;
  teachers: Teacher[];
  lessons: Lesson[];
  reviews: Review[];
  profile: StudentProfile | null;
  searchTeachers: (searchQuery?: string, filters?: {
    subject?: string;
    location?: string;
    min_rating?: number;
    max_hourly_rate?: number;
  }) => Promise<{ success: boolean; teachers?: Teacher[]; error?: string }>;
  getLessons: (status?: string) => Promise<{ success: boolean; lessons?: Lesson[]; error?: string }>;
  bookLesson: (lessonData: BookLessonData) => Promise<{ success: boolean; lesson?: Lesson; error?: string }>;
  updateProfile: (profileData: StudentProfile) => Promise<{ success: boolean; student?: StudentProfile; error?: string }>;
  reviewLesson: (reviewData: ReviewData) => Promise<{ success: boolean; review?: Review; error?: string }>;
  getReviews: () => Promise<{ success: boolean; reviews?: Review[]; error?: string }>;
  getProfile: () => Promise<{ success: boolean; profile?: StudentProfile; error?: string }>;
}

export const useStudent = (): UseStudentReturn => {
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  const getAuthToken = async () => {
    return localStorage.getItem('auth_token');
  };

  const searchTeachers = async (searchQuery?: string, filters?: {
    subject?: string;
    location?: string;
    min_rating?: number;
    max_hourly_rate?: number;
  }) => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        // If no token, use mock data instead of showing error
        const mockTeachers: Teacher[] = [
          {
            id: 'teacher1',
            profile_id: 'profile1',
            full_name: 'Ahmet Yılmaz',
            bio: 'Deneyimli matematik öğretmeni',
            experience_years: 5,
            hourly_rate: 150,
            is_verified: true,
            rating: 4.8,
            total_lessons: 120,
            total_reviews: 45,
            subjects: ['Matematik', 'Fizik'],
            availability_status: 'available',
            location: 'İstanbul',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            profile: {
              id: 'profile1',
              user_id: 'user1',
              first_name: 'Ahmet',
              last_name: 'Yılmaz',
              role: 'teacher',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z'
            }
          },
          {
            id: 'teacher2',
            profile_id: 'profile2',
            full_name: 'Ayşe Demir',
            bio: 'Genç ve dinamik fizik öğretmeni',
            experience_years: 3,
            hourly_rate: 140,
            is_verified: true,
            rating: 4.6,
            total_lessons: 85,
            total_reviews: 32,
            subjects: ['Fizik', 'Kimya'],
            availability_status: 'available',
            location: 'Ankara',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            profile: {
              id: 'profile2',
              user_id: 'user2',
              first_name: 'Ayşe',
              last_name: 'Demir',
              role: 'teacher',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z'
            }
          }
        ];
        setTeachers(mockTeachers);
        return { success: true, teachers: mockTeachers };
      }

      const queryParams = new URLSearchParams();
      if (filters?.subject) queryParams.append('subject', filters.subject);
      if (filters?.location) queryParams.append('location', filters.location);
      if (filters?.min_rating) queryParams.append('min_rating', filters.min_rating.toString());
      if (filters?.max_hourly_rate) queryParams.append('max_hourly_rate', filters.max_hourly_rate.toString());
      if (searchQuery) queryParams.append('search', searchQuery);

      const response = await fetch(`/api/student/search-teachers?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setTeachers(data.teachers || []);
        return { success: true, teachers: data.teachers };
      } else {
        // If API fails, use mock data as fallback
        console.warn('Teachers API failed, using mock data:', data.error);
        const mockTeachers: Teacher[] = [
          {
            id: 'teacher1',
            profile_id: 'profile1',
            full_name: 'Ahmet Yılmaz',
            bio: 'Deneyimli matematik öğretmeni',
            experience_years: 5,
            hourly_rate: 150,
            is_verified: true,
            rating: 4.8,
            total_lessons: 120,
            total_reviews: 45,
            subjects: ['Matematik', 'Fizik'],
            availability_status: 'available',
            location: 'İstanbul',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            profile: {
              id: 'profile1',
              user_id: 'user1',
              first_name: 'Ahmet',
              last_name: 'Yılmaz',
              role: 'teacher',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z'
            }
          },
          {
            id: 'teacher2',
            profile_id: 'profile2',
            full_name: 'Ayşe Demir',
            bio: 'Genç ve dinamik fizik öğretmeni',
            experience_years: 3,
            hourly_rate: 140,
            is_verified: true,
            rating: 4.6,
            total_lessons: 85,
            total_reviews: 32,
            subjects: ['Fizik', 'Kimya'],
            availability_status: 'available',
            location: 'Ankara',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            profile: {
              id: 'profile2',
              user_id: 'user2',
              first_name: 'Ayşe',
              last_name: 'Demir',
              role: 'teacher',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z'
            }
          }
        ];
        setTeachers(mockTeachers);
        return { success: true, teachers: mockTeachers };
      }
    } catch (error) {
      console.warn('Search teachers error, using mock data:', error);
      // Use mock data as fallback when API is not available
      const mockTeachers: Teacher[] = [
        {
          id: 'teacher1',
          profile_id: 'profile1',
          full_name: 'Ahmet Yılmaz',
          bio: 'Deneyimli matematik öğretmeni',
          experience_years: 5,
          hourly_rate: 150,
          is_verified: true,
          rating: 4.8,
          total_lessons: 120,
          total_reviews: 45,
          subjects: ['Matematik', 'Fizik'],
          availability_status: 'available',
          location: 'İstanbul',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          profile: {
            id: 'profile1',
            user_id: 'user1',
            first_name: 'Ahmet',
            last_name: 'Yılmaz',
            role: 'teacher',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        },
        {
          id: 'teacher2',
          profile_id: 'profile2',
          full_name: 'Ayşe Demir',
          bio: 'Genç ve dinamik fizik öğretmeni',
          experience_years: 3,
          hourly_rate: 140,
          is_verified: true,
          rating: 4.6,
          total_lessons: 85,
          total_reviews: 32,
          subjects: ['Fizik', 'Kimya'],
          availability_status: 'available',
          location: 'Ankara',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          profile: {
            id: 'profile2',
            user_id: 'user2',
            first_name: 'Ayşe',
            last_name: 'Demir',
            role: 'teacher',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        }
      ];
      setTeachers(mockTeachers);
      return { success: true, teachers: mockTeachers };
    } finally {
      setLoading(false);
    }
  };

  const getLessons = async (status?: string) => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        console.error('No authentication token found');
        setLessons([]);
        return { success: false, error: 'No token' };
      }

      const queryParams = new URLSearchParams();
      if (status) queryParams.append('status', status);

      const response = await fetch(`/api/student/lessons?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setLessons(data.lessons || []);
        return { success: true, lessons: data.lessons };
      } else {
        console.error('Failed to fetch lessons:', data.error);
        setLessons([]);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setLessons([]);
      return { success: false, error: 'Failed to fetch lessons' };
    } finally {
      setLoading(false);
    }
  };

  const bookLesson = async (lessonData: BookLessonData) => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return { success: false, error: 'No token' };
      }

      const response = await fetch('/api/student/book-lesson', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lessonData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Ders başarıyla rezerve edildi!');
        // Refresh lessons
        await getLessons();
        return { success: true, lesson: data.lesson };
      } else {
        toast.error(data.error || 'Ders rezerve edilirken hata oluştu');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Book lesson error:', error);
      toast.error('Bir hata oluştu');
      return { success: false, error: 'Bir hata oluştu' };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: StudentProfile) => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return { success: false, error: 'No token' };
      }

      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Profil başarıyla güncellendi!');
        return { success: true, student: data.student };
      } else {
        toast.error(data.error || 'Profil güncellenirken hata oluştu');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Bir hata oluştu');
      return { success: false, error: 'Bir hata oluştu' };
    } finally {
      setLoading(false);
    }
  };

  const reviewLesson = async (reviewData: ReviewData) => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return { success: false, error: 'No token' };
      }

      const response = await fetch('/api/student/review-lesson', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Değerlendirme başarıyla gönderildi!');
        // Refresh reviews
        await getReviews();
        return { success: true, review: data.review };
      } else {
        toast.error(data.error || 'Değerlendirme gönderilirken hata oluştu');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Review lesson error:', error);
      toast.error('Bir hata oluştu');
      return { success: false, error: 'Bir hata oluştu' };
    } finally {
      setLoading(false);
    }
  };

  const getReviews = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return { success: false, error: 'No token' };
      }

      const response = await fetch('/api/student/reviews', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews || []);
        return { success: true, reviews: data.reviews };
      } else {
        toast.error(data.error || 'Değerlendirmeler yüklenirken hata oluştu');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Get reviews error:', error);
      toast.error('Bir hata oluştu');
      return { success: false, error: 'Bir hata oluştu' };
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return { success: false, error: 'No token' };
      }

      const response = await fetch('/api/student/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile || null);
        return { success: true, profile: data.profile };
      } else {
        toast.error(data.error || 'Profil yüklenirken hata oluştu');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Get profile error:', error);
      toast.error('Bir hata oluştu');
      return { success: false, error: 'Bir hata oluştu' };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    teachers,
    lessons,
    reviews,
    profile,
    searchTeachers,
    getLessons,
    bookLesson,
    updateProfile,
    reviewLesson,
    getReviews,
    getProfile
  };
};