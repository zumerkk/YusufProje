import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'student' | 'teacher' | 'admin';
  is_active?: boolean;
  status?: 'active' | 'inactive' | 'suspended';
  created_at: string;
  last_login?: string;
  courseCount?: number;
  studentCount?: number;
  enrollmentCount?: number;
  verified?: boolean;
  avatar_url?: string;
  profiles?: any;
}

interface Analytics {
  userStats: {
    total?: number;
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    userGrowth: number;
    byRole?: {
      student?: number;
      teacher?: number;
      admin?: number;
    };
    recentSignups?: number;
  };
  courseStats?: {
    total?: number;
    active?: number;
    draft?: number;
  };
  lessonStats: {
    totalLessons: number;
    completedLessons: number;
    averageRating: number;
    totalHours: number;
  };
  teacherStats: {
    totalTeachers: number;
    activeTeachers: number;
    averageRating: number;
    totalEarnings: number;
  };
  systemStats?: {
    totalRevenue?: number;
    activeUsers: number;
    totalUsers?: number;
    activeCourses?: number;
    newRegistrations?: number;
    serverStatus?: string;
    databaseStatus?: string;
    lastBackup?: string;
    siteTitle?: string;
    siteDescription?: string;
    allowRegistrations?: boolean;
    emailNotifications?: boolean;
    userGrowth?: number;
    newUsers?: number;
  };
  revenue?: {
    pending?: number;
    monthly?: number;
    total?: number;
    monthlyData?: Array<{
      month: string;
      revenue: number;
    }>;
  };
  userGrowth?: {
    growthRate?: number;
    monthlyData?: Array<{
      month: string;
      users: number;
    }>;
  };
}

interface UserUpdate {
  first_name?: string;
  last_name?: string;
  role?: 'student' | 'teacher' | 'admin';
  email?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [pagination, setPagination] = useState({});
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => {
    return localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
  };

  const getUsers = async (page = 1, limit = 20, filters = {}) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await fetch(`/api/admin/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data.users || []);
      setPagination(data.pagination || {});
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAnalytics = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return { success: false, error: 'No token' };
      }

      const response = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setAnalytics(data.analytics);
        return { success: true, analytics: data.analytics };
      } else {
        toast.error(data.error || 'Analitik veriler yüklenirken hata oluştu');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Get analytics error:', error);
      toast.error('Bir hata oluştu');
      return { success: false, error: 'Bir hata oluştu' };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, userData: UserUpdate) => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return { success: false, error: 'No token' };
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Kullanıcı başarıyla güncellendi!');
        // Refresh users list
        await getUsers();
        return { success: true, user: data.user };
      } else {
        toast.error(data.error || 'Kullanıcı güncellenirken hata oluştu');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Update user error:', error);
      toast.error('Bir hata oluştu');
      return { success: false, error: 'Bir hata oluştu' };
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return { success: false, error: 'No token' };
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Kullanıcı başarıyla silindi!');
        // Refresh users list
        await getUsers();
        return { success: true };
      } else {
        toast.error(data.error || 'Kullanıcı silinirken hata oluştu');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error('Bir hata oluştu');
      return { success: false, error: 'Bir hata oluştu' };
    } finally {
      setLoading(false);
    }
  };

  const getRecentActivities = async (limit?: number) => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return { success: false, error: 'No token' };
      }

      const queryParams = new URLSearchParams();
      if (limit) queryParams.append('limit', limit.toString());

      const response = await fetch(`/api/admin/recent-activities?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, activities: data.activities, total: data.total };
      } else {
        toast.error(data.error || 'Son aktiviteler yüklenirken hata oluştu');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Get recent activities error:', error);
      toast.error('Bir hata oluştu');
      return { success: false, error: 'Bir hata oluştu' };
    } finally {
      setLoading(false);
    }
  };

  const getTeachers = async (filters?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    console.log('useAdmin: getTeachers called with filters:', filters);
    setLoading(true);
    try {
      const token = await getAuthToken();
      console.log('useAdmin: token obtained:', !!token);
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return { success: false, error: 'No token' };
      }

      const queryParams = new URLSearchParams();
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

      const url = `/api/admin/teachers?${queryParams}`;
      console.log('useAdmin: Making request to:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('useAdmin: Response status:', response.status);
      const data = await response.json();
      console.log('useAdmin: Response data:', data);

      if (response.ok) {
        // Transform the data to match expected format
        const transformedTeachers = (data.teachers || []).map((teacher: any) => ({
          ...teacher,
          profiles: Array.isArray(teacher.profiles) && teacher.profiles.length > 0 
            ? teacher.profiles[0] 
            : teacher.profiles || {},
          teachers: Array.isArray(teacher.teachers) && teacher.teachers.length > 0 
            ? teacher.teachers[0] 
            : teacher.teachers || {}
        }));
        
        return { 
          success: true, 
          teachers: transformedTeachers,
          total: data.total,
          page: data.page,
          limit: data.limit
        };
      } else {
        console.error('useAdmin: API error:', data);
        toast.error(data.error || 'Öğretmenler yüklenirken hata oluştu');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Get teachers error:', error);
      toast.error('Bir hata oluştu');
      return { success: false, error: 'Bir hata oluştu' };
    } finally {
      setLoading(false);
    }
  };

  const getStudents = async (filters?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    grade?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return { success: false, error: 'No token' };
      }

      const queryParams = new URLSearchParams();
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.grade) queryParams.append('grade', filters.grade);
      if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/admin/students?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Transform the data to match expected format
        const transformedStudents = (data.students || []).map((student: any) => ({
          ...student,
          profiles: Array.isArray(student.profiles) && student.profiles.length > 0 
            ? student.profiles[0] 
            : student.profiles || {},
          students: Array.isArray(student.students) && student.students.length > 0 
            ? student.students[0] 
            : student.students || {}
        }));
        
        return { 
          success: true, 
          students: transformedStudents,
          total: data.total,
          page: data.page,
          limit: data.limit
        };
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

  return {
    loading,
    users,
    analytics,
    pagination,
    error,
    getUsers,
    getAnalytics,
    updateUser,
    deleteUser,
    getRecentActivities,
    getTeachers,
    getStudents
  };
};