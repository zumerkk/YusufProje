import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { logger } from './logger';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface TestUser {
  email: string;
  password: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  phone?: string;
  address?: string;
}

export interface TestClass {
  name: string;
  description: string;
  grade_level: number;
  capacity: number;
  teacher_id: string;
}

export interface TestStudent {
  student_number: string;
  user_id: string;
  class_id: string;
  enrollment_date: string;
}

export interface TestLesson {
  title: string;
  description: string;
  class_id: string;
  teacher_id: string;
  lesson_type: string;
  start_time: string;
  end_time: string;
  day_of_week: number;
}

export interface TestAssignment {
  title: string;
  description: string;
  class_id: string;
  teacher_id: string;
  due_date: string;
  max_points: number;
  assignment_type: string;
}

class TestDataSeeder {
  private async clearExistingData(): Promise<void> {
    logger.info('Clearing existing test data...');
    
    // Clear in reverse order of dependencies
    await supabase.from('lesson_reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('teacher_subjects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('teachers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    logger.info('Existing test data cleared');
  }

  private async createTestUsers(): Promise<{ [key: string]: string }> {
    logger.info('Creating test users...');
    
    const testUsers: TestUser[] = [
      // Admin users
      {
        email: 'admin@test.com',
        password: 'admin123',
        full_name: 'System Administrator',
        role: 'admin',
        phone: '+90 555 000 0001',
        address: 'Admin Office, School Building'
      },
      {
        email: 'admin2@test.com',
        password: 'admin123',
        full_name: 'Assistant Administrator',
        role: 'admin',
        phone: '+90 555 000 0002',
        address: 'Admin Office, School Building'
      },
      
      // Teacher users
      {
        email: 'teacher1@test.com',
        password: 'teacher123',
        full_name: 'Ahmet Yılmaz',
        role: 'teacher',
        phone: '+90 555 111 1111',
        address: 'Matematik Bölümü, Öğretmenler Odası'
      },
      {
        email: 'teacher2@test.com',
        password: 'teacher123',
        full_name: 'Fatma Kaya',
        role: 'teacher',
        phone: '+90 555 111 1112',
        address: 'Türkçe Bölümü, Öğretmenler Odası'
      },
      {
        email: 'teacher3@test.com',
        password: 'teacher123',
        full_name: 'Mehmet Demir',
        role: 'teacher',
        phone: '+90 555 111 1113',
        address: 'Fen Bilimleri Bölümü, Öğretmenler Odası'
      },
      {
        email: 'teacher4@test.com',
        password: 'teacher123',
        full_name: 'Ayşe Özkan',
        role: 'teacher',
        phone: '+90 555 111 1114',
        address: 'İngilizce Bölümü, Öğretmenler Odası'
      },
      
      // Student users
      {
        email: 'student1@test.com',
        password: 'student123',
        full_name: 'Ali Veli',
        role: 'student',
        phone: '+90 555 222 2221',
        address: 'Öğrenci Mahallesi, No: 1'
      },
      {
        email: 'student2@test.com',
        password: 'student123',
        full_name: 'Zeynep Şahin',
        role: 'student',
        phone: '+90 555 222 2222',
        address: 'Öğrenci Mahallesi, No: 2'
      },
      {
        email: 'student3@test.com',
        password: 'student123',
        full_name: 'Can Yıldız',
        role: 'student',
        phone: '+90 555 222 2223',
        address: 'Öğrenci Mahallesi, No: 3'
      },
      {
        email: 'student4@test.com',
        password: 'student123',
        full_name: 'Elif Çelik',
        role: 'student',
        phone: '+90 555 222 2224',
        address: 'Öğrenci Mahallesi, No: 4'
      },
      {
        email: 'student5@test.com',
        password: 'student123',
        full_name: 'Burak Arslan',
        role: 'student',
        phone: '+90 555 222 2225',
        address: 'Öğrenci Mahallesi, No: 5'
      },
      {
        email: 'student6@test.com',
        password: 'student123',
        full_name: 'Selin Koç',
        role: 'student',
        phone: '+90 555 222 2226',
        address: 'Öğrenci Mahallesi, No: 6'
      }
    ];

    const userIds: { [key: string]: string } = {};
    
    for (const user of testUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: user.email,
          password_hash: hashedPassword,
          role: user.role,
          is_active: true
        })
        .select('id')
        .single();
      
      if (error) {
        logger.error(`Failed to create user ${user.email}:`, error);
        throw error;
      }
      
      userIds[user.email] = data.id;
      logger.debug(`Created user: ${user.email} with ID: ${data.id}`);
      
      // Create profile for the user
      const nameParts = user.full_name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.id,
          first_name: firstName,
          last_name: lastName,
          phone: user.phone,
          address: user.address
        });
      
      if (profileError) {
        logger.error(`Failed to create profile for ${user.email}:`, profileError);
        throw profileError;
      }
      
      logger.debug(`Created profile for: ${user.email}`);
    }
    
    logger.info(`Created ${Object.keys(userIds).length} test users`);
    return userIds;
  }

  private async createTestTeachers(userIds: { [key: string]: string }): Promise<void> {
    logger.info('Creating test teachers...');
    
    const teacherEmails = [
      'teacher1@test.com',
      'teacher2@test.com', 
      'teacher3@test.com',
      'teacher4@test.com'
    ];
    
    const subjects = ['Matematik', 'Türkçe', 'Fen Bilimleri', 'İngilizce'];
    
    for (let i = 0; i < teacherEmails.length; i++) {
      const email = teacherEmails[i];
      const subject = subjects[i];
      
      // Create teacher record
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .insert({
          user_id: userIds[email],
          bio: `Experienced ${subject} teacher with passion for education`,
          experience_years: Math.floor(Math.random() * 10) + 3,
          education: `${subject} Education, Bachelor's Degree`,
          hourly_rate: 150 + (i * 25),
          rating: 4.5 + (Math.random() * 0.5),
          is_verified: true,
          availability_status: 'available'
        })
        .select('id')
        .single();
      
      if (teacherError) {
        logger.error(`Failed to create teacher for ${email}:`, teacherError);
        throw teacherError;
      }
      
      // Create teacher subject relationship
      const { error: subjectError } = await supabase
        .from('teacher_subjects')
        .insert({
          teacher_id: teacherData.id,
          subject_name: subject,
          proficiency_level: 'expert',
          years_experience: Math.floor(Math.random() * 8) + 3
        });
      
      if (subjectError) {
        logger.error(`Failed to assign subject to teacher:`, subjectError);
        throw subjectError;
      }
      
      logger.debug(`Created teacher: ${email} with subject: ${subject}`);
    }
    
    logger.info(`Created ${teacherEmails.length} test teachers`);
  }

  private async createTestStudents(userIds: { [key: string]: string }): Promise<void> {
    logger.info('Creating test students...');
    
    const studentEmails = [
      'student1@test.com',
      'student2@test.com', 
      'student3@test.com',
      'student4@test.com',
      'student5@test.com',
      'student6@test.com'
    ];
    
    for (let i = 0; i < studentEmails.length; i++) {
      const email = studentEmails[i];
      
      // Create student record
      const gradeLevels = ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'];
      const schools = ['Atatürk Lisesi', 'Cumhuriyet Lisesi', 'Gazi Lisesi', 'İstiklal Lisesi'];
      const parentNames = ['Ahmet Veli', 'Fatma Şahin', 'Mehmet Yıldız', 'Ayşe Çelik', 'Mustafa Arslan', 'Zeynep Koç'];
      
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert({
          user_id: userIds[email],
          grade_level: gradeLevels[i % gradeLevels.length],
          school_name: schools[i % schools.length],
          parent_name: parentNames[i],
          parent_phone: `+90 555 333 ${(3330 + i).toString()}`,
          parent_email: `parent${i + 1}@test.com`,
          learning_goals: `${gradeLevels[i % gradeLevels.length]} müfredatına uygun akademik başarı artışı`
        })
        .select('id')
        .single();
      
      if (studentError) {
        logger.error(`Failed to create student for ${email}:`, studentError);
        throw studentError;
      }
      
      logger.debug(`Created student: ${email} with ID: ${studentData.id}`);
    }
    
    logger.info(`Created ${studentEmails.length} test students`);
  }

  private async createTestLessons(userIds: { [key: string]: string }): Promise<void> {
    logger.info('Creating test lessons...');
    
    const subjects = ['Matematik', 'Türkçe', 'Fen Bilimleri', 'İngilizce'];
    const teacherEmails = Object.keys(userIds).filter(email => email.includes('teacher'));
    const studentEmails = Object.keys(userIds).filter(email => email.includes('student'));
    
    // Get teacher and student IDs from database
    const { data: teachers } = await supabase
      .from('teachers')
      .select('id, user_id')
      .in('user_id', teacherEmails.map(email => userIds[email]));
    
    const { data: students } = await supabase
      .from('students')
      .select('id, user_id')
      .in('user_id', studentEmails.map(email => userIds[email]));
    
    if (!teachers || !students) {
      throw new Error('Failed to fetch teacher or student data');
    }
    
    // Create lessons for each student-teacher pair
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const teacher = teachers[i % teachers.length];
      const subject = subjects[i % subjects.length];
      
      // Create 4 lessons per student (one per week for a month)
      for (let week = 0; week < 4; week++) {
        const lessonDate = new Date();
        lessonDate.setDate(lessonDate.getDate() + (week * 7) + (i % 7)); // Spread across different days
        lessonDate.setHours(9 + (i % 8), 0, 0, 0); // Different hours
        
        const { error } = await supabase
          .from('lessons')
          .insert({
            teacher_id: teacher.id,
            student_id: student.id,
            subject: subject,
            lesson_date: lessonDate.toISOString(),
            duration_minutes: 60,
            status: 'scheduled',
            price: 100 + (i * 10), // Different prices
            payment_status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          logger.error(`Failed to create lesson:`, error);
          throw error;
        }
      }
      
      logger.debug(`Created 4 lessons for student ${i + 1} with teacher ${teacher.id}`);
    }
    
    logger.info(`Created ${students.length * 4} test lessons`);
  }



  public async seedTestData(): Promise<void> {
    try {
      logger.info('Starting test data seeding process...');
      
      // Clear existing data
      await this.clearExistingData();
      
      // Create test data in order
      const userIds = await this.createTestUsers();
      await this.createTestTeachers(userIds);
      await this.createTestStudents(userIds);
      await this.createTestLessons(userIds);
      
      logger.info('Test data seeding completed successfully!');
      
      // Log summary
      logger.info('Test Data Summary:', {
        users: Object.keys(userIds).length,
        adminUsers: Object.keys(userIds).filter(email => email.includes('admin')).length,
        teacherUsers: Object.keys(userIds).filter(email => email.includes('teacher')).length,
        studentUsers: Object.keys(userIds).filter(email => email.includes('student')).length
      });
      
    } catch (error) {
      logger.error('Test data seeding failed:', error);
      throw error;
    }
  }

  public async getTestCredentials(): Promise<{ [role: string]: { email: string; password: string }[] }> {
    return {
      admin: [
        { email: 'admin@test.com', password: 'admin123' },
        { email: 'admin2@test.com', password: 'admin123' }
      ],
      teacher: [
        { email: 'teacher1@test.com', password: 'teacher123' },
        { email: 'teacher2@test.com', password: 'teacher123' },
        { email: 'teacher3@test.com', password: 'teacher123' },
        { email: 'teacher4@test.com', password: 'teacher123' }
      ],
      student: [
        { email: 'student1@test.com', password: 'student123' },
        { email: 'student2@test.com', password: 'student123' },
        { email: 'student3@test.com', password: 'student123' },
        { email: 'student4@test.com', password: 'student123' },
        { email: 'student5@test.com', password: 'student123' },
        { email: 'student6@test.com', password: 'student123' }
      ]
    };
  }
}

export const testDataSeeder = new TestDataSeeder();
export default testDataSeeder;