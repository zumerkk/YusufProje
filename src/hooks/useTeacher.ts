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
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
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
      const token = await getAuthToken();
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return { success: false, error: 'No token' };
      }

      const response = await fetch('/api/teacher/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setStudents(data.students || []);
        return { success: true, students: data.students };
      } else {
        toast.error(data.error || 'Öğrenciler yüklenirken hata oluştu');
        return { success: false, error: data.error };
      }
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

      const queryParams = new URLSearchParams();
      if (status) queryParams.append('status', status);

      const response = await fetch(`/api/teacher/lessons?${queryParams}`, {
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
        toast.error(data.error || 'Dersler yüklenirken hata oluştu');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Get lessons error:', error);
      toast.error('Bir hata oluştu');
      return { success: false, error: 'Bir hata oluştu' };
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
      const token = await getAuthToken();
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return { success: false, error: 'No token' };
      }

      const response = await fetch('/api/teacher/profile', {
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