import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole,
  changeUserStatus,
  getUserStatistics,
  searchUsers,
  getTeachers,
  getStudents,
  getAnalytics
} from './users';
import {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getAvailableStudents,
  assignStudentToClass,
  removeStudentFromClass,
  getClassDetails
} from './classes';
import {
  getUsersOverviewReport,
  getUserActivityReport,
  getUserRegistrationTrendReport,
  getUserDetailReport,
  getUserRoleDistributionReport
} from './reports/users';
import {
  getPackageSalesOverviewReport,
  getPackagePerformanceReport,
  getPackageSalesTrendReport,
  getPackageRefundReport
} from './reports/packages';
import {
  getRevenueOverviewReport,
  getRevenueForecastReport,
  getRevenueComparisonReport,
  getRevenueSourceAnalysisReport,
  getRevenueTargetTrackingReport
} from './reports/revenue';
import {
  getSystemActivityOverviewReport
} from './reports/activity';
import {
  getOverallPerformanceReport
} from './reports/performance';
import {
  getSecurityEvents,
  resolveSecurityEvent,
  getSecurityStats
} from './security';
import {
  getAuditLogs,
  getAuditLogById,
  getAuditStats,
  addAuditLog
} from './audit';
import {
  getModerationQueue,
  getModerationItem,
  reviewModerationItem,
  getModerationStats,
  bulkReviewItems
} from './moderation';

const router = Router();

// Users routes
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.post('/users', createUser);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);
router.put('/users/:userId/role', changeUserRole);
router.put('/users/:userId/status', changeUserStatus);
router.get('/users/statistics', getUserStatistics);
router.get('/users/search', searchUsers);

// Single user routes (for frontend compatibility)
router.get('/user/:userId', getUserById);
router.put('/user/:userId', updateUser);
router.delete('/user/:userId', deleteUser);
router.put('/user/:userId/role', changeUserRole);
router.put('/user/:userId/status', changeUserStatus);

// Teachers routes
router.get('/teachers', getTeachers);
router.get('/teachers/:teacherId', getUserById);
router.post('/teachers', createUser); // Will set role=teacher
router.put('/teachers/:teacherId', updateUser);
router.delete('/teachers/:teacherId', deleteUser);

// Students routes
router.get('/students', getStudents);
router.get('/students/:studentId', getUserById);
router.post('/students', createUser); // Will set role=student
router.put('/students/:studentId', updateUser);
router.delete('/students/:studentId', deleteUser);

// Analytics routes
router.get('/analytics', getAnalytics);

// Classes routes
router.get('/classes', getClasses);
router.post('/classes', createClass);
router.get('/classes/:id', getClassDetails);
router.put('/classes/:id', updateClass);
router.delete('/classes/:id', deleteClass);
router.get('/classes/students/available', getAvailableStudents);
router.post('/classes/students/assign', assignStudentToClass);
router.delete('/classes/:class_id/students/:student_id', removeStudentFromClass);

// User reports routes
router.get('/reports/users', getUsersOverviewReport);
router.get('/reports/users/activity', getUserActivityReport);
router.get('/reports/users/registration', getUserRegistrationTrendReport);
router.get('/reports/users/:userId/detail', getUserDetailReport);
router.get('/reports/users/role-distribution', getUserRoleDistributionReport);

// Package reports routes
router.get('/reports/packages', getPackageSalesOverviewReport);
router.get('/reports/packages/performance', getPackagePerformanceReport);
router.get('/reports/packages/sales-trend', getPackageSalesTrendReport);
router.get('/reports/packages/refunds', getPackageRefundReport);

// Revenue reports routes
router.get('/reports/revenue', getRevenueOverviewReport);
router.get('/reports/revenue/forecast', getRevenueForecastReport);
router.get('/reports/revenue/comparison', getRevenueComparisonReport);
router.get('/reports/revenue/source-analysis', getRevenueSourceAnalysisReport);
router.get('/reports/revenue/target-tracking', getRevenueTargetTrackingReport);

// Activity reports routes
router.get('/reports/activity', getSystemActivityOverviewReport);

// Performance reports routes
router.get('/reports/performance', getOverallPerformanceReport);

// Security routes
router.get('/security/events', getSecurityEvents);
router.put('/security/events/:eventId/resolve', resolveSecurityEvent);
router.get('/security/stats', getSecurityStats);

// Audit routes
router.get('/audit-logs', getAuditLogs);
router.get('/audit-logs/:logId', getAuditLogById);
router.get('/audit-logs/stats', getAuditStats);
router.post('/audit-logs', addAuditLog);

// Content moderation routes
router.get('/content/moderation', getModerationQueue);
router.get('/content/moderation/:itemId', getModerationItem);
router.put('/content/moderation/:itemId/review', reviewModerationItem);
router.get('/content/moderation/stats', getModerationStats);
router.put('/content/moderation/bulk-review', bulkReviewItems);

export default router;