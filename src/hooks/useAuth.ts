import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  avatar_url?: string;
  grade_level?: string;
  subject?: string; // Öğretmen branşı
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role: 'student' | 'teacher';
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount and listen for auth changes
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
        
        if (isMounted) {
          if (token) {
            await fetchUserData(token);
          } else {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
      }
    };
    
    // Initialize auth only once on mount
    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to run only once

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.profile?.first_name && data.user.profile?.last_name 
            ? `${data.user.profile.first_name} ${data.user.profile.last_name}`
            : data.user.email,
          role: data.user.role,
          avatar_url: data.user.profile?.avatar_url,
          grade_level: data.user.student?.grade_level,
          subject: data.user.teacher?.subject
        };
        setUser(authUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('accessToken');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
      
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      await fetchUserData(token);
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Store token in localStorage
        localStorage.setItem('auth_token', data.token);
        
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.profile?.first_name && data.user.profile?.last_name 
            ? `${data.user.profile.first_name} ${data.user.profile.last_name}`
            : data.user.email,
          role: data.user.role,
          avatar_url: data.user.profile?.avatar_url,
          grade_level: data.user.student?.grade_level,
          subject: data.user.teacher?.subject
        };
        
        setUser(authUser);
        setIsAuthenticated(true);
        toast.success('Giriş başarılı!');
        return { success: true, user: authUser };
      } else {
        toast.error(data.error || 'Geçersiz e-posta veya şifre');
        return { success: false, error: data.error || 'Geçersiz e-posta veya şifre' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Bir hata oluştu');
      return { success: false, error: 'Bir hata oluştu' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: {
    email: string;
    password: string;
    role: string;
    firstName: string;
    lastName: string;
    grade?: string;
    subject?: string;
  }) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store token and user data
      localStorage.setItem('auth_token', data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      
      toast.success('Kayıt başarılı! Hoş geldiniz.');
      return { success: true, user: data.user };
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Kayıt sırasında bir hata oluştu');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Mock logout for testing without backend
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Çıkış yapıldı');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Çıkış yapılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkUser
  };
};