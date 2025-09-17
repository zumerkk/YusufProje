import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  last_login?: string;
  courseCount?: number;
  studentCount?: number;
  enrollmentCount?: number;
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
  full_name?: string;
  role?: 'student' | 'teacher' | 'admin';
  email?: string;
}

export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const getUsers = async (filters?: {
    role?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return { success: false, error: 'No token' };
      }

      const queryParams = new URLSearchParams();
      if (filters?.role) queryParams.append('role', filters.role);
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      if (filters?.offset) queryParams.append('offset', filters.offset.toString());

      const response = await fetch(`/api/admin/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
        return { 
          success: true, 
          users: data.users, 
          total: data.total,
          limit: data.limit,
          offset: data.offset
        };
      } else {
        toast.error(data.error || 'Kullanıcılar yüklenirken hata oluştu');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Get users error:', error);
      toast.error('Bir hata oluştu');
      return { success: false, error: 'Bir hata oluştu' };
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
        setAnalytics(data);
        return { success: true, analytics: data };
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

      const response = await fetch(`/api/admin/user/${userId}`, {
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

      const response = await fetch(`/api/admin/user/${userId}`, {
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

  return {
    loading,
    users,
    analytics,
    getUsers,
    getAnalytics,
    updateUser,
    deleteUser,
    getRecentActivities
  };
};