/**
 * Validation Middleware
 * Request validation using custom validators
 */
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './errorHandler';

// Validation helper functions
const isEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const isValidRole = (role: string): boolean => {
  return ['student', 'teacher', 'admin'].includes(role);
};

const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

const isValidDate = (date: string): boolean => {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime()) && parsedDate > new Date();
};

const isValidPrice = (price: number): boolean => {
  return typeof price === 'number' && price > 0 && price <= 10000;
};

// Validation schemas
export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password, first_name, last_name, role } = req.body;

  const errors: string[] = [];

  // Required fields
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  if (!first_name) errors.push('First name is required');
  if (!last_name) errors.push('Last name is required');
  if (!role) errors.push('Role is required');

  // Email validation
  if (email && !isEmail(email)) {
    errors.push('Invalid email format');
  }

  // Password validation
  if (password && !isStrongPassword(password)) {
    errors.push('Password must be at least 8 characters with uppercase, lowercase, and number');
  }

  // Name validation
  if (first_name && (first_name.length < 2 || first_name.length > 50)) {
    errors.push('First name must be between 2 and 50 characters');
  }

  if (last_name && (last_name.length < 2 || last_name.length > 50)) {
    errors.push('Last name must be between 2 and 50 characters');
  }

  // Role validation
  if (role && !isValidRole(role)) {
    errors.push('Role must be student, teacher, or admin');
  }

  if (errors.length > 0) {
    throw new ValidationError(`Validation failed: ${errors.join(', ')}`);
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body;

  const errors: string[] = [];

  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');

  if (email && !isEmail(email)) {
    errors.push('Invalid email format');
  }

  if (errors.length > 0) {
    throw new ValidationError(`Validation failed: ${errors.join(', ')}`);
  }

  next();
};

export const validateProfileUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { full_name, bio, phone, location } = req.body;

  const errors: string[] = [];

  // Optional field validations
  if (full_name && (full_name.length < 2 || full_name.length > 100)) {
    errors.push('Full name must be between 2 and 100 characters');
  }

  if (bio && bio.length > 500) {
    errors.push('Bio must be less than 500 characters');
  }

  if (phone && !/^[+]?[1-9]\d{1,14}$/.test(phone)) {
    errors.push('Invalid phone number format');
  }

  if (location && location.length > 100) {
    errors.push('Location must be less than 100 characters');
  }

  if (errors.length > 0) {
    throw new ValidationError(`Validation failed: ${errors.join(', ')}`);
  }

  next();
};

export const validateTeacherProfile = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { subjects, hourly_rate, experience_years, education, certifications } = req.body;

  const errors: string[] = [];

  if (subjects && (!Array.isArray(subjects) || subjects.length === 0)) {
    errors.push('At least one subject is required');
  }

  if (hourly_rate && !isValidPrice(hourly_rate)) {
    errors.push('Hourly rate must be a positive number up to 10000');
  }

  if (experience_years && (typeof experience_years !== 'number' || experience_years < 0 || experience_years > 50)) {
    errors.push('Experience years must be between 0 and 50');
  }

  if (education && education.length > 200) {
    errors.push('Education must be less than 200 characters');
  }

  if (certifications && (!Array.isArray(certifications) || certifications.some((cert: string) => cert.length > 100))) {
    errors.push('Each certification must be less than 100 characters');
  }

  if (errors.length > 0) {
    throw new ValidationError(`Validation failed: ${errors.join(', ')}`);
  }

  next();
};

export const validateLessonSchedule = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { student_id, subject, scheduled_at, duration, price, description } = req.body;

  const errors: string[] = [];

  if (!student_id) errors.push('Student ID is required');
  if (!subject) errors.push('Subject is required');
  if (!scheduled_at) errors.push('Scheduled time is required');
  if (!duration) errors.push('Duration is required');
  if (!price) errors.push('Price is required');

  if (student_id && !isValidUUID(student_id)) {
    errors.push('Invalid student ID format');
  }

  if (subject && subject.length > 100) {
    errors.push('Subject must be less than 100 characters');
  }

  if (scheduled_at && !isValidDate(scheduled_at)) {
    errors.push('Scheduled time must be a valid future date');
  }

  if (duration && (typeof duration !== 'number' || duration < 30 || duration > 480)) {
    errors.push('Duration must be between 30 and 480 minutes');
  }

  if (price && !isValidPrice(price)) {
    errors.push('Price must be a positive number up to 10000');
  }

  if (description && description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }

  if (errors.length > 0) {
    throw new ValidationError(`Validation failed: ${errors.join(', ')}`);
  }

  next();
};

export const validateLessonBooking = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { teacher_id, subject, scheduled_at, duration, notes } = req.body;

  const errors: string[] = [];

  if (!teacher_id) errors.push('Teacher ID is required');
  if (!subject) errors.push('Subject is required');
  if (!scheduled_at) errors.push('Scheduled time is required');
  if (!duration) errors.push('Duration is required');

  if (teacher_id && !isValidUUID(teacher_id)) {
    errors.push('Invalid teacher ID format');
  }

  if (subject && subject.length > 100) {
    errors.push('Subject must be less than 100 characters');
  }

  if (scheduled_at && !isValidDate(scheduled_at)) {
    errors.push('Scheduled time must be a valid future date');
  }

  if (duration && (typeof duration !== 'number' || duration < 30 || duration > 480)) {
    errors.push('Duration must be between 30 and 480 minutes');
  }

  if (notes && notes.length > 500) {
    errors.push('Notes must be less than 500 characters');
  }

  if (errors.length > 0) {
    throw new ValidationError(`Validation failed: ${errors.join(', ')}`);
  }

  next();
};

export const validateUserUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { full_name, role, email } = req.body;

  const errors: string[] = [];

  if (full_name && (full_name.length < 2 || full_name.length > 100)) {
    errors.push('Full name must be between 2 and 100 characters');
  }

  if (role && !isValidRole(role)) {
    errors.push('Role must be student, teacher, or admin');
  }

  if (email && !isEmail(email)) {
    errors.push('Invalid email format');
  }

  if (errors.length > 0) {
    throw new ValidationError(`Validation failed: ${errors.join(', ')}`);
  }

  next();
};

export const validateUUIDParam = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params[paramName];

    if (!id) {
      throw new ValidationError(`${paramName} parameter is required`);
    }

    if (!isValidUUID(id)) {
      throw new ValidationError(`Invalid ${paramName} format`);
    }

    next();
  };
};