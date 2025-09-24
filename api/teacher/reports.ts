import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticateToken } from '../middleware/auth';

// Öğretmen genel raporu
export const getTeacherOverviewReport = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.teacherId;
    const { date_from, date_to } = req.query;

    // Sınıf sayısı
    const { data: classes, error: classesError } = await supabase
      .from('teacher_classes')
      .select('id')
      .eq('teacher_id', teacherId);

    if (classesError) {
      console.error('Error fetching classes count:', classesError);
      return res.status(500).json({ error: 'Sınıf bilgileri getirilirken hata oluştu' });
    }

    // Öğrenci sayısı
    const { data: students, error: studentsError } = await supabase
      .from('class_students')
      .select('student_id')
      .in('class_id', classes.map(c => c.id));

    if (studentsError) {
      console.error('Error fetching students count:', studentsError);
      return res.status(500).json({ error: 'Öğrenci bilgileri getirilirken hata oluştu' });
    }

    // Ödev sayısı
    let assignmentQuery = supabase
      .from('teacher_assignments')
      .select('id')
      .eq('teacher_id', teacherId);

    if (date_from) {
      assignmentQuery = assignmentQuery.gte('created_at', date_from);
    }
    if (date_to) {
      assignmentQuery = assignmentQuery.lte('created_at', date_to);
    }

    const { data: assignments, error: assignmentsError } = await assignmentQuery;

    if (assignmentsError) {
      console.error('Error fetching assignments count:', assignmentsError);
      return res.status(500).json({ error: 'Ödev bilgileri getirilirken hata oluştu' });
    }

    // Not ortalaması
    let gradeQuery = supabase
      .from('student_grades')
      .select('grade, max_points')
      .eq('teacher_id', teacherId);

    if (date_from) {
      gradeQuery = gradeQuery.gte('created_at', date_from);
    }
    if (date_to) {
      gradeQuery = gradeQuery.lte('created_at', date_to);
    }

    const { data: grades, error: gradesError } = await gradeQuery;

    if (gradesError) {
      console.error('Error fetching grades:', gradesError);
      return res.status(500).json({ error: 'Not bilgileri getirilirken hata oluştu' });
    }

    // Devam oranı
    let attendanceQuery = supabase
      .from('student_attendance')
      .select('status')
      .eq('teacher_id', teacherId);

    if (date_from) {
      attendanceQuery = attendanceQuery.gte('attendance_date', date_from);
    }
    if (date_to) {
      attendanceQuery = attendanceQuery.lte('attendance_date', date_to);
    }

    const { data: attendance, error: attendanceError } = await attendanceQuery;

    if (attendanceError) {
      console.error('Error fetching attendance:', attendanceError);
      return res.status(500).json({ error: 'Devam bilgileri getirilirken hata oluştu' });
    }

    // Hesaplamalar
    const uniqueStudents = [...new Set(students.map(s => s.student_id))];
    
    const totalGradePoints = grades.reduce((sum, grade) => sum + grade.grade, 0);
    const totalMaxPoints = grades.reduce((sum, grade) => sum + grade.max_points, 0);
    const averageGrade = totalMaxPoints > 0 ? (totalGradePoints / totalMaxPoints) * 100 : 0;

    const presentCount = attendance.filter(a => ['present', 'late', 'excused'].includes(a.status)).length;
    const attendanceRate = attendance.length > 0 ? (presentCount / attendance.length) * 100 : 0;

    const report = {
      overview: {
        total_classes: classes.length,
        total_students: uniqueStudents.length,
        total_assignments: assignments.length,
        average_grade: Math.round(averageGrade * 100) / 100,
        attendance_rate: Math.round(attendanceRate * 100) / 100
      },
      period: {
        date_from: date_from || 'Başlangıç',
        date_to: date_to || 'Bugün'
      }
    };

    res.json({ report });
  } catch (error) {
    console.error('Teacher overview report error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Sınıf performans raporu
export const getClassPerformanceReport = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const { subject_id, date_from, date_to } = req.query;

    // Sınıf bilgileri
    const { data: classInfo, error: classError } = await supabase
      .from('teacher_classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (classError) {
      console.error('Error fetching class info:', classError);
      return res.status(500).json({ error: 'Sınıf bilgileri getirilirken hata oluştu' });
    }

    // Öğrenci listesi
    const { data: classStudents, error: studentsError } = await supabase
      .from('class_students')
      .select(`
        student_id,
        profiles!class_students_student_id_fkey(
          first_name,
          last_name,
          email
        )
      `)
      .eq('class_id', classId);

    if (studentsError) {
      console.error('Error fetching class students:', studentsError);
      return res.status(500).json({ error: 'Öğrenci bilgileri getirilirken hata oluştu' });
    }

    // Her öğrenci için performans verileri
    const studentPerformance = [];

    for (const student of classStudents) {
      // Notlar
      let gradeQuery = supabase
        .from('student_grades')
        .select('grade, max_points, grade_type')
        .eq('student_id', student.student_id)
        .eq('class_id', classId);

      if (subject_id) {
        gradeQuery = gradeQuery.eq('subject_id', subject_id);
      }
      if (date_from) {
        gradeQuery = gradeQuery.gte('created_at', date_from);
      }
      if (date_to) {
        gradeQuery = gradeQuery.lte('created_at', date_to);
      }

      const { data: grades } = await gradeQuery;

      // Devam
      let attendanceQuery = supabase
        .from('student_attendance')
        .select('status')
        .eq('student_id', student.student_id)
        .eq('class_id', classId);

      if (date_from) {
        attendanceQuery = attendanceQuery.gte('attendance_date', date_from);
      }
      if (date_to) {
        attendanceQuery = attendanceQuery.lte('attendance_date', date_to);
      }

      const { data: attendance } = await attendanceQuery;

      // Hesaplamalar
      const totalGradePoints = grades?.reduce((sum, grade) => sum + grade.grade, 0) || 0;
      const totalMaxPoints = grades?.reduce((sum, grade) => sum + grade.max_points, 0) || 0;
      const averageGrade = totalMaxPoints > 0 ? (totalGradePoints / totalMaxPoints) * 100 : 0;

      const presentCount = attendance?.filter(a => ['present', 'late', 'excused'].includes(a.status)).length || 0;
      const attendanceRate = attendance?.length > 0 ? (presentCount / attendance.length) * 100 : 0;

      studentPerformance.push({
        student_info: student.profiles,
        grades: {
          average: Math.round(averageGrade * 100) / 100,
          total_assignments: grades?.length || 0,
          letter_grade: calculateLetterGrade(averageGrade)
        },
        attendance: {
          rate: Math.round(attendanceRate * 100) / 100,
          total_days: attendance?.length || 0,
          present_days: presentCount
        }
      });
    }

    // Sınıf ortalamaları
    const classAverages = {
      grade_average: studentPerformance.length > 0 
        ? Math.round(studentPerformance.reduce((sum, student) => sum + student.grades.average, 0) / studentPerformance.length * 100) / 100
        : 0,
      attendance_average: studentPerformance.length > 0 
        ? Math.round(studentPerformance.reduce((sum, student) => sum + student.attendance.rate, 0) / studentPerformance.length * 100) / 100
        : 0
    };

    res.json({
      class_info: classInfo,
      class_averages: classAverages,
      student_performance: studentPerformance,
      total_students: studentPerformance.length
    });
  } catch (error) {
    console.error('Class performance report error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Ödev teslim raporu
export const getAssignmentSubmissionReport = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.teacherId;
    const { assignment_id, class_id, date_from, date_to } = req.query;

    let assignmentQuery = supabase
      .from('teacher_assignments')
      .select(`
        *,
        assignment_submissions(
          id,
          student_id,
          submitted_at,
          status,
          grade,
          profiles!assignment_submissions_student_id_fkey(
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('teacher_id', teacherId);

    if (assignment_id) {
      assignmentQuery = assignmentQuery.eq('id', assignment_id);
    }
    if (class_id) {
      assignmentQuery = assignmentQuery.eq('class_id', class_id);
    }
    if (date_from) {
      assignmentQuery = assignmentQuery.gte('created_at', date_from);
    }
    if (date_to) {
      assignmentQuery = assignmentQuery.lte('created_at', date_to);
    }

    const { data: assignments, error } = await assignmentQuery;

    if (error) {
      console.error('Error fetching assignment submissions:', error);
      return res.status(500).json({ error: 'Ödev teslim bilgileri getirilirken hata oluştu' });
    }

    const report = assignments.map(assignment => {
      const submissions = assignment.assignment_submissions || [];
      const submittedCount = submissions.filter(s => s.status === 'submitted').length;
      const gradedCount = submissions.filter(s => s.grade !== null).length;
      const lateCount = submissions.filter(s => {
        return s.submitted_at && new Date(s.submitted_at) > new Date(assignment.due_date);
      }).length;

      return {
        assignment_info: {
          id: assignment.id,
          title: assignment.title,
          due_date: assignment.due_date,
          max_points: assignment.max_points,
          assignment_type: assignment.assignment_type
        },
        submission_stats: {
          total_submissions: submissions.length,
          submitted_count: submittedCount,
          graded_count: gradedCount,
          late_count: lateCount,
          submission_rate: submissions.length > 0 ? Math.round((submittedCount / submissions.length) * 100 * 100) / 100 : 0
        },
        submissions: submissions
      };
    });

    res.json({ assignments: report });
  } catch (error) {
    console.error('Assignment submission report error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Not dağılım raporu
export const getGradeDistributionReport = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.teacherId;
    const { class_id, subject_id, grade_type, date_from, date_to } = req.query;

    let gradeQuery = supabase
      .from('student_grades')
      .select(`
        grade,
        max_points,
        grade_type,
        profiles!student_grades_student_id_fkey(
          first_name,
          last_name
        ),
        teacher_classes!student_grades_class_id_fkey(
          class_name
        ),
        teacher_subjects!student_grades_subject_id_fkey(
          subject_name
        )
      `)
      .eq('teacher_id', teacherId);

    if (class_id) {
      gradeQuery = gradeQuery.eq('class_id', class_id);
    }
    if (subject_id) {
      gradeQuery = gradeQuery.eq('subject_id', subject_id);
    }
    if (grade_type) {
      gradeQuery = gradeQuery.eq('grade_type', grade_type);
    }
    if (date_from) {
      gradeQuery = gradeQuery.gte('created_at', date_from);
    }
    if (date_to) {
      gradeQuery = gradeQuery.lte('created_at', date_to);
    }

    const { data: grades, error } = await gradeQuery;

    if (error) {
      console.error('Error fetching grade distribution:', error);
      return res.status(500).json({ error: 'Not dağılım bilgileri getirilirken hata oluştu' });
    }

    // Yüzdelik notları hesapla
    const percentageGrades = grades.map(grade => {
      const percentage = (grade.grade / grade.max_points) * 100;
      return {
        ...grade,
        percentage: Math.round(percentage * 100) / 100,
        letter_grade: calculateLetterGrade(percentage)
      };
    });

    // Harf notu dağılımı
    const letterGradeDistribution = {
      'AA': percentageGrades.filter(g => g.letter_grade === 'AA').length,
      'BA': percentageGrades.filter(g => g.letter_grade === 'BA').length,
      'BB': percentageGrades.filter(g => g.letter_grade === 'BB').length,
      'CB': percentageGrades.filter(g => g.letter_grade === 'CB').length,
      'CC': percentageGrades.filter(g => g.letter_grade === 'CC').length,
      'DC': percentageGrades.filter(g => g.letter_grade === 'DC').length,
      'DD': percentageGrades.filter(g => g.letter_grade === 'DD').length,
      'FD': percentageGrades.filter(g => g.letter_grade === 'FD').length,
      'FF': percentageGrades.filter(g => g.letter_grade === 'FF').length
    };

    // İstatistikler
    const percentages = percentageGrades.map(g => g.percentage);
    const stats = {
      total_grades: percentages.length,
      average: percentages.length > 0 ? Math.round(percentages.reduce((sum, p) => sum + p, 0) / percentages.length * 100) / 100 : 0,
      highest: percentages.length > 0 ? Math.max(...percentages) : 0,
      lowest: percentages.length > 0 ? Math.min(...percentages) : 0,
      median: percentages.length > 0 ? calculateMedian(percentages) : 0
    };

    res.json({
      statistics: stats,
      letter_grade_distribution: letterGradeDistribution,
      detailed_grades: percentageGrades
    });
  } catch (error) {
    console.error('Grade distribution report error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Devam trend raporu
export const getAttendanceTrendReport = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.teacherId;
    const { class_id, date_from, date_to } = req.query;

    let attendanceQuery = supabase
      .from('student_attendance')
      .select(`
        attendance_date,
        status,
        teacher_classes!student_attendance_class_id_fkey(
          class_name
        )
      `)
      .eq('teacher_id', teacherId);

    if (class_id) {
      attendanceQuery = attendanceQuery.eq('class_id', class_id);
    }
    if (date_from) {
      attendanceQuery = attendanceQuery.gte('attendance_date', date_from);
    }
    if (date_to) {
      attendanceQuery = attendanceQuery.lte('attendance_date', date_to);
    }

    const { data: attendance, error } = await attendanceQuery.order('attendance_date');

    if (error) {
      console.error('Error fetching attendance trend:', error);
      return res.status(500).json({ error: 'Devam trend bilgileri getirilirken hata oluştu' });
    }

    // Günlük devam oranları
    const dailyAttendance: { [key: string]: any } = {};
    
    attendance.forEach(record => {
      const date = record.attendance_date;
      if (!dailyAttendance[date]) {
        dailyAttendance[date] = {
          date,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        };
      }
      
      dailyAttendance[date].total++;
      dailyAttendance[date][record.status]++;
    });

    // Her gün için devam oranını hesapla
    const trendData = Object.values(dailyAttendance).map((day: any) => {
      const attendanceRate = day.total > 0 ? ((day.present + day.late + day.excused) / day.total) * 100 : 0;
      return {
        ...day,
        attendance_rate: Math.round(attendanceRate * 100) / 100
      };
    });

    // Genel istatistikler
    const totalRecords = attendance.length;
    const presentRecords = attendance.filter(a => ['present', 'late', 'excused'].includes(a.status)).length;
    const overallRate = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;

    res.json({
      overall_attendance_rate: Math.round(overallRate * 100) / 100,
      total_records: totalRecords,
      trend_data: trendData
    });
  } catch (error) {
    console.error('Attendance trend report error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Rapor türlerini getir
export const getReportTypes = async (req: Request, res: Response) => {
  try {
    const reportTypes = [
      {
        id: 'overview',
        name: 'Genel Bakış',
        description: 'Öğretmen genel performans raporu',
        endpoint: '/api/teacher/:teacherId/reports/overview'
      },
      {
        id: 'class_performance',
        name: 'Sınıf Performansı',
        description: 'Sınıf bazında öğrenci performans raporu',
        endpoint: '/api/teacher/reports/class/:classId/performance'
      },
      {
        id: 'assignment_submission',
        name: 'Ödev Teslim Raporu',
        description: 'Ödev teslim durumu ve istatistikleri',
        endpoint: '/api/teacher/:teacherId/reports/assignments'
      },
      {
        id: 'grade_distribution',
        name: 'Not Dağılımı',
        description: 'Not dağılımı ve istatistikleri',
        endpoint: '/api/teacher/:teacherId/reports/grades'
      },
      {
        id: 'attendance_trend',
        name: 'Devam Trendi',
        description: 'Devam durumu trend analizi',
        endpoint: '/api/teacher/:teacherId/reports/attendance'
      }
    ];

    res.json({ report_types: reportTypes });
  } catch (error) {
    console.error('Report types error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Yardımcı fonksiyonlar
function calculateLetterGrade(average: number): string {
  if (average >= 90) return 'AA';
  if (average >= 85) return 'BA';
  if (average >= 80) return 'BB';
  if (average >= 75) return 'CB';
  if (average >= 70) return 'CC';
  if (average >= 65) return 'DC';
  if (average >= 60) return 'DD';
  if (average >= 50) return 'FD';
  return 'FF';
}

function calculateMedian(numbers: number[]): number {
  const sorted = numbers.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return Math.round(((sorted[middle - 1] + sorted[middle]) / 2) * 100) / 100;
  }
  
  return sorted[middle];
}