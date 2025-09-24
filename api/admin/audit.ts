import { Request, Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';

// Mock audit logs data
const mockAuditLogs = [
  {
    id: '1',
    user_id: 'admin123',
    user: 'admin@test.com',
    action: 'USER_CREATED',
    resource: 'users',
    resource_id: 'user789',
    old_values: null,
    new_values: {
      email: 'newuser@example.com',
      role: 'student',
      status: 'active'
    },
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    ip_address: '192.168.1.10',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: '2',
    user_id: 'admin123',
    user: 'admin@test.com',
    action: 'USER_ROLE_CHANGED',
    resource: 'users',
    resource_id: 'user456',
    old_values: {
      role: 'student'
    },
    new_values: {
      role: 'teacher'
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    ip_address: '192.168.1.10',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: '3',
    user_id: 'teacher456',
    user: 'teacher@test.com',
    action: 'CLASS_CREATED',
    resource: 'classes',
    resource_id: 'class123',
    old_values: null,
    new_values: {
      name: 'Matematik 101',
      level: '8. Sınıf',
      capacity: 25
    },
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    ip_address: '192.168.1.20',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  },
  {
    id: '4',
    user_id: 'admin123',
    user: 'admin@test.com',
    action: 'USER_STATUS_CHANGED',
    resource: 'users',
    resource_id: 'user789',
    old_values: {
      status: 'active'
    },
    new_values: {
      status: 'suspended'
    },
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    ip_address: '192.168.1.10',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: '5',
    user_id: 'student789',
    user: 'student@test.com',
    action: 'LOGIN',
    resource: 'auth',
    resource_id: null,
    old_values: null,
    new_values: {
      login_time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    ip_address: '192.168.1.30',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
  }
];

// Get audit logs
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      user_id, 
      action, 
      resource, 
      start_date, 
      end_date 
    } = req.query;
    
    let filteredLogs = [...mockAuditLogs];
    
    // Filter by user_id if provided
    if (user_id) {
      filteredLogs = filteredLogs.filter(log => log.user_id === user_id);
    }
    
    // Filter by action if provided
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action.toLowerCase().includes((action as string).toLowerCase()));
    }
    
    // Filter by resource if provided
    if (resource) {
      filteredLogs = filteredLogs.filter(log => log.resource === resource);
    }
    
    // Filter by date range if provided
    if (start_date) {
      const startDate = new Date(start_date as string);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startDate);
    }
    
    if (end_date) {
      const endDate = new Date(end_date as string);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endDate);
    }
    
    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    
    res.json({
      logs: paginatedLogs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: filteredLogs.length,
        totalPages: Math.ceil(filteredLogs.length / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Denetim kayıtları alınırken hata oluştu' });
  }
};

// Get audit log by ID
export const getAuditLogById = async (req: Request, res: Response) => {
  try {
    const { logId } = req.params;
    
    const log = mockAuditLogs.find(log => log.id === logId);
    
    if (!log) {
      return res.status(404).json({ error: 'Denetim kaydı bulunamadı' });
    }
    
    res.json(log);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ error: 'Denetim kaydı alınırken hata oluştu' });
  }
};

// Get audit statistics
export const getAuditStats = async (req: Request, res: Response) => {
  try {
    const totalLogs = mockAuditLogs.length;
    
    // Count by action type
    const actionCounts = mockAuditLogs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Count by resource type
    const resourceCounts = mockAuditLogs.reduce((acc, log) => {
      acc[log.resource] = (acc[log.resource] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Count recent activity (last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentLogs = mockAuditLogs.filter(log => {
      return new Date(log.timestamp).getTime() > oneDayAgo;
    }).length;
    
    // Count unique users
    const uniqueUsers = new Set(mockAuditLogs.map(log => log.user_id)).size;
    
    res.json({
      total: totalLogs,
      recent24h: recentLogs,
      uniqueUsers,
      actionBreakdown: actionCounts,
      resourceBreakdown: resourceCounts
    });
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({ error: 'Denetim istatistikleri alınırken hata oluştu' });
  }
};

// Add new audit log entry
export const addAuditLog = async (req: Request, res: Response) => {
  try {
    const {
      user_id,
      user,
      action,
      resource,
      resource_id,
      old_values,
      new_values,
      ip_address,
      user_agent
    } = req.body;
    
    const newLog = {
      id: (mockAuditLogs.length + 1).toString(),
      user_id,
      user,
      action,
      resource,
      resource_id,
      old_values,
      new_values,
      timestamp: new Date().toISOString(),
      ip_address,
      user_agent
    };
    
    mockAuditLogs.unshift(newLog); // Add to beginning
    
    res.status(201).json({
      message: 'Denetim kaydı başarıyla eklendi',
      log: newLog
    });
  } catch (error) {
    console.error('Error adding audit log:', error);
    res.status(500).json({ error: 'Denetim kaydı eklenirken hata oluştu' });
  }
};