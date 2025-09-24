import { Router } from 'express';
import {
  getTeacherClasses,
  createClass,
  updateClass,
  deleteClass,
  getClassDetail,
  getClassLevels,
  getClassSections,
  getClassStudentCount,
  getAllClasses
} from './classes';
import {
  getTeacherStudents,
  addStudentToClass,
  removeStudentFromClass,
  getStudentDetail,
  getClassStudents,
  searchStudents
} from './students';
import {
  getTeacherLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonDetail
} from './lessons';
import {
  getTeacherAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentDetail,
  getAssignmentSubmissions
} from './assignments';
import {
  getTeacherGrades,
  addGrade,
  updateGrade,
  deleteGrade,
  getStudentGradeAverage,
  getClassGradeAverage,
  getGradeTypes,
  bulkAddGrades
} from './grades';
import {
  getTeacherAttendance,
  addAttendance,
  updateAttendance,
  deleteAttendance,
  getStudentAttendanceStats,
  getClassAttendanceStats,
  getAttendanceStatuses,
  bulkAddAttendance,
  getDailyAttendanceReport
} from './attendance';
import {
  getTeacherOverviewReport,
  getClassPerformanceReport,
  getAssignmentSubmissionReport,
  getGradeDistributionReport,
  getAttendanceTrendReport,
  getReportTypes
} from './reports';
import {
  getTeacherActivities,
  logTeacherActivity
} from './activities';

const router = Router();

// Classes routes
router.get('/:teacherId/classes', getTeacherClasses);
router.post('/:teacherId/classes', createClass);
router.put('/classes/:classId', updateClass);
router.delete('/classes/:classId', deleteClass);

// Class management routes - specific routes first
router.get('/classes/all', getAllClasses);
router.get('/classes/levels', getClassLevels);
router.get('/classes/levels/:grade_level/sections', getClassSections);
router.get('/classes/:grade_level/:class_section/count', getClassStudentCount);
router.get('/classes/:classId', getClassDetail);

// Students routes
router.get('/:teacherId/students', getTeacherStudents);
router.post('/classes/:classId/students', addStudentToClass);
router.delete('/classes/:classId/students/:studentId', removeStudentFromClass);
router.get('/students/:studentId', getStudentDetail);
router.get('/classes/:classId/students', getClassStudents);
router.get('/students/search', searchStudents);

// Lessons routes
router.get('/:teacherId/lessons', getTeacherLessons);
router.post('/:teacherId/lessons', createLesson);
router.put('/lessons/:lessonId', updateLesson);
router.delete('/lessons/:lessonId', deleteLesson);
router.get('/lessons/:lessonId', getLessonDetail);

// Assignments routes
router.get('/:teacherId/assignments', getTeacherAssignments);
router.post('/:teacherId/assignments', createAssignment);
router.put('/assignments/:assignmentId', updateAssignment);
router.delete('/assignments/:assignmentId', deleteAssignment);
router.get('/assignments/:assignmentId', getAssignmentDetail);
router.get('/assignments/:assignmentId/submissions', getAssignmentSubmissions);

// Grades routes
router.get('/:teacherId/grades', getTeacherGrades);
router.post('/:teacherId/grades', addGrade);
router.put('/grades/:gradeId', updateGrade);
router.delete('/grades/:gradeId', deleteGrade);
router.get('/students/:studentId/grades/average', getStudentGradeAverage);
router.get('/classes/:classId/grades', getClassGradeAverage);
router.get('/grades/types', getGradeTypes);
router.post('/:teacherId/grades/bulk', bulkAddGrades);

// Attendance routes
router.get('/:teacherId/attendance', getTeacherAttendance);
router.post('/:teacherId/attendance', addAttendance);
router.put('/attendance/:attendanceId', updateAttendance);
router.delete('/attendance/:attendanceId', deleteAttendance);
router.get('/students/:studentId/attendance', getStudentAttendanceStats);
router.get('/classes/:classId/attendance', getClassAttendanceStats);
router.get('/attendance/statuses', getAttendanceStatuses);
router.post('/:teacherId/attendance/bulk', bulkAddAttendance);
router.get('/:teacherId/attendance/daily', getDailyAttendanceReport);

// Reports routes
router.get('/reports/types', getReportTypes);
router.get('/:teacherId/reports/overview', getTeacherOverviewReport);
router.get('/reports/class/:classId/performance', getClassPerformanceReport);
router.get('/:teacherId/reports/assignments', getAssignmentSubmissionReport);
router.get('/:teacherId/reports/grades', getGradeDistributionReport);
router.get('/:teacherId/reports/attendance', getAttendanceTrendReport);

// Activities routes
router.get('/:teacherId/activities', getTeacherActivities);
router.post('/:teacherId/activities', logTeacherActivity);

export default router;