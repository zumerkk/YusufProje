/**
 * Authentication Middleware
 * Validates JWT tokens and extracts user information
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase';

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
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Get user from database
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .eq('id', decoded.id)
      .eq('is_active', true)
      .single();
    
    if (error || !userData) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Add user to request object
    (req as any).user = {
      id: userData.id,
      email: userData.email,
      role: userData.role || 'student'
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
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