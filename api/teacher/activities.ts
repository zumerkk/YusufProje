import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export interface TeacherActivity {
  id: string;
  type: 'student_added' | 'grade_updated' | 'lesson_created' | 'assignment_created' | 'attendance_marked' | 'class_created';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    student_name?: string;
    class_name?: string;
    subject?: string;
    grade?: number;
    lesson_title?: string;
    assignment_title?: string;
  };
}

// Get teacher's recent activities
export const getTeacherActivities = async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.params;
    const { limit = 10 } = req.query;

    if (!teacherId) {
      return res.status(400).json({ error: 'Teacher ID is required' });
    }

    // For now, return mock data until we implement proper activity logging
    const mockActivities: TeacherActivity[] = [
      {
        id: '1',
        type: 'student_added',
        title: 'Yeni öğrenci eklendi',
        description: 'Ahmet Yılmaz - 9A Sınıfı',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        metadata: {
          student_name: 'Ahmet Yılmaz',
          class_name: '9A'
        }
      },
      {
        id: '2',
        type: 'grade_updated',
        title: 'Sınav notu güncellendi',
        description: 'Matematik - 9B Sınıfı',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        metadata: {
          subject: 'Matematik',
          class_name: '9B',
          grade: 85
        }
      },
      {
        id: '3',
        type: 'lesson_created',
        title: 'Yeni ders programı oluşturuldu',
        description: 'Fizik - 10A Sınıfı',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        metadata: {
          lesson_title: 'Fizik Dersi',
          class_name: '10A',
          subject: 'Fizik'
        }
      },
      {
        id: '4',
        type: 'assignment_created',
        title: 'Yeni ödev oluşturuldu',
        description: 'Kimya Laboratuvarı - 11B Sınıfı',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        metadata: {
          assignment_title: 'Kimya Laboratuvarı',
          class_name: '11B',
          subject: 'Kimya'
        }
      },
      {
        id: '5',
        type: 'attendance_marked',
        title: 'Yoklama alındı',
        description: 'Biyoloji - 12A Sınıfı',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        metadata: {
          subject: 'Biyoloji',
          class_name: '12A'
        }
      }
    ];

    // Limit the results
    const limitedActivities = mockActivities.slice(0, Number(limit));

    res.json({
      success: true,
      activities: limitedActivities,
      total: mockActivities.length
    });

  } catch (error) {
    console.error('Error fetching teacher activities:', error);
    res.status(500).json({ 
      error: 'Failed to fetch teacher activities',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Log a new teacher activity (for future use)
export const logTeacherActivity = async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.params;
    const { type, title, description, metadata } = req.body;

    if (!teacherId || !type || !title || !description) {
      return res.status(400).json({ 
        error: 'Teacher ID, type, title, and description are required' 
      });
    }

    // For now, just return success
    // In the future, this would log to the database
    const activity: TeacherActivity = {
      id: Date.now().toString(),
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
      metadata
    };

    res.json({
      success: true,
      activity
    });

  } catch (error) {
    console.error('Error logging teacher activity:', error);
    res.status(500).json({ 
      error: 'Failed to log teacher activity',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};