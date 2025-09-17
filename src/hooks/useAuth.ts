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
        const token = localStorage.getItem('auth_token');
        
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
    
    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Auth data received:', userData);
        setUser(userData.user);
        setIsAuthenticated(true);
      } else {
        // Don't log 401 errors as they're expected when not authenticated
        if (response.status !== 401) {
          console.error('Failed to fetch user data:', response.status);
        }
        setUser(null);
        setIsAuthenticated(false);
        // Clear the token if invalid
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
      setIsAuthenticated(false);
      // Clear the token on error
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        await fetchUserData(token);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const credentials = { email, password };
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Server returned non-JSON response:', textResponse);
        toast.error('Sunucu hatası: JSON yanıt bekleniyor');
        return { success: false, error: 'Server returned non-JSON response' };
      }

      const data = await response.json();

      if (response.ok && data.user && data.token) {
        // Store JWT token in localStorage
        localStorage.setItem('auth_token', data.token);
        
        setUser(data.user);
        setIsAuthenticated(true);
        toast.success('Giriş başarılı!');
        return { success: true, user: data.user };
      } else {
        toast.error(data.error || 'Giriş başarısız');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        toast.error('Sunucu yanıt formatı hatası');
        return { success: false, error: 'Invalid JSON response from server' };
      }
      toast.error('Bir hata oluştu');
      return { success: false, error: 'Bir hata oluştu' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, first_name: string, last_name: string, role: 'student' | 'teacher') => {
    const registerData = { email, password, first_name, last_name, role };
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Kayıt başarılı! Giriş yapabilirsiniz.');
        return { success: true };
      } else {
        toast.error(data.error || 'Kayıt başarısız');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Bir hata oluştu');
      return { success: false, error: 'Bir hata oluştu' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

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