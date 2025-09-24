import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface Student {
  id: string;
  user_id: string;
  grade_level?: string;
  school_name?: string;
  full_name: string;
  email: string;
  phone?: string;
  grade?: string;
  school?: string;
  status?: 'active' | 'inactive';
  subjects: string[];
  completed_lessons: number;
  total_lessons: number;
  total_hours: number;
  average_rating: number;
  last_lesson_date?: string;
  averageGrade?: number;
  class_section?: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface Lesson {
  id: string;
  teacher_id: string;
  student_id: string;
  student_name?: string;
  subject: string;
  date_time: string;
  lesson_date?: string;
  start_time?: string;
  end_time?: string;
  duration_minutes: number;
  price: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'confirmed' | 'pending';
  notes?: string;
  rating?: number;
  location?: string;
  review?: string;
  students?: Student;
}

interface TeacherProfile {
  id?: string;
  user_id?: string;
  full_name?: string;
  subjects?: string[];
  hourly_rate?: number;
  bio?: string;
  experience_years?: number;
  education?: string;
  certifications?: string[];
  location?: string;
  availability?: any;
  rating?: number;
  total_students?: number;
  total_lessons?: number;
  phone?: string;
}

interface ScheduleLessonData {
  student_id: string;
  subject: string;
  date_time: string;
  duration_minutes: number;
  notes?: string;
}

interface AvailabilityData {
  day?: string;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  is_available?: boolean;
  slots?: any[];
}

interface UploadResponse {
  success: boolean;
  url?: string;
  file_url?: string;
  error?: string;
}

interface UseTeacherReturn {
  loading: boolean;
  students: Student[];
  lessons: Lesson[];
  profile: TeacherProfile | null;
  getStudents: () => Promise<{ success: boolean; students?: Student[]; error?: string }>;
  getLessons: (status?: string) => Promise<{ success: boolean; lessons?: Lesson[]; error?: string }>;
  scheduleLesson: (lessonData: ScheduleLessonData) => Promise<{ success: boolean; lesson?: Lesson; error?: string }>;
  updateProfile: (profileData: TeacherProfile) => Promise<{ success: boolean; teacher?: TeacherProfile; error?: string }>;
  setAvailability: (availabilityData: AvailabilityData) => Promise<{ success: boolean; availability?: any; error?: string }>;
  uploadDocument: (file: File, category: string, description?: string) => Promise<{ success: boolean; file?: any; error?: string }>;
  removeFile: (fileId: string) => Promise<{ success: boolean; error?: string }>;
  getProfile: () => Promise<{ success: boolean; profile?: TeacherProfile; error?: string }>;
}

export const useTeacher = (): UseTeacherReturn => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [availability, setAvailabilityState] = useState<any>(null);

  const getAuthToken = async () => {
    return localStorage.getItem('auth_token');
  };

  const updateProfile = async (profileData: TeacherProfile) => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return { success: false, error: 'No token' };
      }

      const response = await fetch('/api/teacher/profile', {
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
        return { success: true, teacher: data.teacher };
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

  const scheduleLesson = async (lessonData: ScheduleLessonData) => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return { success: false, error: 'No token' };
      }

      const response = await fetch('/api/teacher/schedule-lesson', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lessonData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Ders başarıyla planlandı!');
        // Refresh lessons
        await getLessons();
        return { success: true, lesson: data.lesson };
      } else {
        toast.error(data.error || 'Ders planlanırken hata oluştu');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Schedule lesson error:', error);
      toast.error('Bir hata oluştu');
      return { success: false, error: 'Bir hata oluştu' };
    } finally {
      setLoading(false);
    }
  };

  const getStudents = async () => {
    setLoading(true);
    try {
      // Mock students data for testing without backend
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      
      const mockStudents = [
        {
          id: '1',
          user_id: 'user-1',
          full_name: 'Ahmet Yılmaz',
          email: 'ahmet@test.com',
          phone: '+90 555 123 4567',
          grade: '11. Sınıf',
          subject: 'Matematik',
          subjects: ['Matematik', 'Geometri'],
          status: 'active' as const,
          completed_lessons: 15,
          total_lessons: 20,
          total_hours: 0,
          average_rating: 0,
          progress: 75,
          last_lesson_date: '2024-01-20T14:00:00Z',
          created_at: new Date().toISOString(),
          last_lesson: '2024-01-15T10:00:00Z',
          user: {
            id: 'user-1',
            email: 'ahmet@test.com',
            full_name: 'Ahmet Yılmaz'
          }
        },
        {
          id: '2',
          user_id: 'user-2',
          full_name: 'Ayşe Demir',
          email: 'ayse@test.com',
          phone: '+90 555 987 6543',
          grade: '12. Sınıf',
          subject: 'Fizik',
          subjects: ['Fizik', 'Kimya'],
            status: 'active' as const,
            completed_lessons: 22,
          total_lessons: 25,
          total_hours: 0,
          average_rating: 0,
          progress: 88,
          last_lesson_date: '2024-01-19T15:30:00Z',
          created_at: new Date().toISOString(),
          last_lesson: '2024-01-14T14:00:00Z',
          user: {
            id: 'user-2',
            email: 'ayse@test.com',
            full_name: 'Ayşe Demir'
          }
        },
        {
          id: '3',
          user_id: 'user-3',
          full_name: 'Mehmet Kaya',
          email: 'mehmet@test.com',
          phone: '+90 555 456 7890',
          grade: '10. Sınıf',
          subject: 'Kimya',
          subjects: ['Kimya'],
          status: 'inactive' as const,
          completed_lessons: 8,
          total_lessons: 15,
          total_hours: 0,
          average_rating: 0,
          progress: 53,
          last_lesson_date: '2024-01-15T16:00:00Z',
          created_at: new Date().toISOString(),
          last_lesson: '2024-01-10T16:00:00Z',
          user: {
            id: 'user-3',
            email: 'mehmet@test.com',
            full_name: 'Mehmet Kaya'
          }
        }
      ];
      
      setStudents(mockStudents);
      return { success: true, students: mockStudents };
    } catch (error) {
      console.error('Get students error:', error);
      toast.error('Bir hata oluştu');
      return { success: false, error: 'Bir hata oluştu' };
    } finally {
      setLoading(false);
    }
  };

  const getLessons = async (status?: string) => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return { success: false, error: 'No token' };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Kullanıcı bilgileri alınamadı');
        return { success: false, error: 'No user' };
      }

      const queryParams = new URLSearchParams();
      if (status) queryParams.append('status', status);

      const response = await fetch(`/api/teacher/${user.id}/lessons?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data.error);
        // API başarısız olursa boş array döndür
        setLessons([]);
        return { success: true, lessons: [] };
      }

      // API'den gelen dersleri formatla
      const formattedLessons = (data.lessons || []).map((lesson: any) => ({
        id: lesson.id,
        subject: lesson.subject,
        grade_level: lesson.class_level || 0,
        class_section: lesson.class_section || '',
        day_of_week: lesson.day_of_week || '',
        start_time: lesson.start_time || '',
        end_time: lesson.end_time || '',
        student_count: lesson.students?.length || 0,
        created_at: lesson.created_at
      }));

      setLessons(formattedLessons);
      return { success: true, lessons: formattedLessons };
    } catch (error: any) {
      console.error('Get lessons error:', error);
      // Hata durumunda boş array döndür
      setLessons([]);
      return { success: true, lessons: [] };
    } finally {
      setLoading(false);
    }
  };

  const setAvailability = async (availabilityData: AvailabilityData): Promise<{ success: boolean; availability?: any; error?: string }> => {
    try {
      const token = await supabase.auth.getSession().then(({ data }) => data.session?.access_token);
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const response = await fetch('/api/teacher/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(availabilityData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setAvailabilityState(data.availability);
        return { success: true, availability: data.availability };
      } else {
        return { success: false, error: data.error || 'Failed to update availability' };
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const getProfile = async () => {
    setLoading(true);
    try {
      // Mock profile data for testing without backend
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      const mockProfile = {
        id: '2',
        full_name: 'Test Teacher',
        email: 'teacher@test.com',
        phone: '+90 555 111 2233',
        subjects: ['Matematik', 'Fizik', 'Kimya'],
        experience_years: 8,
        education: 'Matematik Öğretmenliği, Ankara Üniversitesi',
        bio: 'Deneyimli matematik ve fen bilimleri öğretmeni. 8 yıllık öğretmenlik deneyimi.',
        hourly_rate: 150,
        availability: {
          monday: ['09:00-12:00', '14:00-18:00'],
          tuesday: ['10:00-16:00'],
          wednesday: ['09:00-12:00', '14:00-18:00'],
          thursday: ['10:00-16:00'],
          friday: ['09:00-15:00'],
          saturday: ['10:00-14:00'],
          sunday: []
        },
        rating: 4.8,
        total_lessons: 245,
        created_at: new Date().toISOString()
      };
      
      setProfile(mockProfile);
      return { success: true, profile: mockProfile };
    } catch (error) {
      console.error('Get profile error:', error);
      toast.error('Bir hata oluştu');
      return { success: false, error: 'Bir hata oluştu' };
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, fileType: 'certificate' | 'document' | 'avatar'): Promise<UploadResponse> => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return { success: false, error: 'No token' };
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);

      const response = await fetch('/api/teacher/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      toast.success('Dosya başarıyla yüklendi');
      return { success: true, url: data.url };
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Dosya yüklenirken bir hata oluştu');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Yeni ders ekleme fonksiyonu
  const createLesson = async (lessonData: {
    day_of_week: string;
    class_level: number;
    class_section: string;
    subject?: string;
    lesson_date: string;
    start_time: string;
    end_time: string;
    duration_minutes?: number;
    lesson_notes?: string;
  }): Promise<{ success: boolean; lessons?: any[]; error?: string }> => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return { success: false, error: 'No token' };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Kullanıcı bilgileri alınamadı');
        return { success: false, error: 'No user' };
      }

      const response = await fetch(`/api/teacher/${user.id}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(lessonData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ders oluşturulamadı');
      }

      toast.success(data.message || 'Ders başarıyla oluşturuldu');
      // Dersleri yeniden yükle
      await getLessons();
      return { success: true, lessons: data.lessons };
    } catch (error: any) {
      console.error('Create lesson error:', error);
      toast.error(error.message || 'Ders oluşturulurken bir hata oluştu');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sınıf seviyelerini getir
  const getClassLevels = async (): Promise<{ success: boolean; class_levels?: number[]; error?: string }> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { success: false, error: 'No token' };
      }

      const response = await fetch('/api/teacher/classes/levels', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sınıf seviyeleri alınamadı');
      }

      return { success: true, class_levels: data.class_levels };
    } catch (error: any) {
      console.error('Get class levels error:', error);
      return { success: false, error: error.message };
    }
  };

  // Belirli sınıf seviyesindeki şubeleri getir
  const getClassSections = async (gradeLevel: number): Promise<{ success: boolean; class_sections?: string[]; error?: string }> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { success: false, error: 'No token' };
      }

      const response = await fetch(`/api/teacher/classes/levels/${gradeLevel}/sections`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Şubeler alınamadı');
      }

      return { success: true, class_sections: data.class_sections };
    } catch (error: any) {
      console.error('Get class sections error:', error);
      return { success: false, error: error.message };
    }
  };

  // Sınıftaki öğrenci sayısını getir
  const getClassStudentCount = async (gradeLevel: number, classSection: string): Promise<{ success: boolean; student_count?: number; error?: string }> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { success: false, error: 'No token' };
      }

      const response = await fetch(`/api/teacher/classes/${gradeLevel}/${classSection}/count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Öğrenci sayısı alınamadı');
      }

      return { success: true, student_count: data.student_count };
    } catch (error: any) {
      console.error('Get student count error:', error);
      return { success: false, error: error.message };
    }
  };

  const uploadDocument = async (file: File, category: string, description?: string): Promise<{ success: boolean; file?: any; error?: string }> => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return { success: false, error: 'No token' };
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      if (description) {
        formData.append('description', description);
      }

      const response = await fetch('/api/teacher/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Document upload failed');
      }

      toast.success('Doküman başarıyla yüklendi');
      return { success: true, file: data.file };
    } catch (error: any) {
      console.error('Document upload error:', error);
      toast.error(error.message || 'Doküman yüklenirken bir hata oluştu');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const removeFile = async (fileId: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return { success: false, error: 'No token' };
      }

      const response = await fetch(`/api/teacher/documents/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'File deletion failed');
      }

      toast.success('Dosya başarıyla silindi');
      return { success: true };
    } catch (error: any) {
      console.error('File deletion error:', error);
      toast.error(error.message || 'Dosya silinirken bir hata oluştu');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Tüm sınıfları getir (teacher API'sinden)
  const getClasses = async (): Promise<{ success: boolean; classes?: any[]; error?: string }> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { success: false, error: 'No token' };
      }

      const response = await fetch('/api/teacher/classes/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sınıflar alınamadı');
      }

      return { success: true, classes: data.classes };
    } catch (error: any) {
      console.error('Get classes error:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    loading,
    students,
    lessons,
    profile,
    getStudents,
    getLessons,





    scheduleLesson,
    updateProfile,
    setAvailability,
    uploadDocument,
    removeFile,
    getProfile
  };
};