/**
 * Authentication Middleware
 * Validates JWT tokens and extracts user information
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        first_name?: string;
        last_name?: string;
      };
    }
  }
}

/**
 * Authentication middleware
 * Validates JWT token and adds user to request object
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    if (!decoded || !decoded.id) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Get user details from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', decoded.id)
      .eq('is_active', true)
      .single();

    if (userError || !userData) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Get profile data
    const { data: profileData } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', userData.id)
      .single();

    // Add user to request object
    req.user = {
      ...userData,
      first_name: profileData?.first_name,
      last_name: profileData?.last_name
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Role-based access control middleware
 * Checks if user has required role
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
      return;
    }

    next();
  };
};

/**
 * Admin only middleware
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Teacher only middleware
 */
export const requireTeacher = requireRole(['teacher']);

/**
 * Student only middleware
 */
export const requireStudent = requireRole(['student']);

/**
 * Teacher or Admin middleware
 */
export const requireTeacherOrAdmin = requireRole(['teacher', 'admin']);

/**
 * Student or Teacher middleware
 */
export const requireStudentOrTeacher = requireRole(['student', 'teacher']);

/**
 * Any authenticated user middleware
 */
export const requireAuth = requireRole(['student', 'teacher', 'admin']);