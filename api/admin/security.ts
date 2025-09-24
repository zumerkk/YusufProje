import { Request, Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';

// Mock security events data
const mockSecurityEvents = [
  {
    id: '1',
    type: 'failed_login',
    severity: 'medium',
    description: 'Çoklu başarısız giriş denemesi',
    user_id: 'user123',
    ip_address: '192.168.1.100',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    resolved: false,
    actions_taken: ['IP geçici olarak engellendi']
  },
  {
    id: '2',
    type: 'suspicious_activity',
    severity: 'high',
    description: 'Anormal API kullanımı tespit edildi',
    user_id: 'user456',
    ip_address: '10.0.0.50',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    resolved: true,
    actions_taken: ['Kullanıcı hesabı geçici olarak askıya alındı', 'Güvenlik ekibi bilgilendirildi']
  },
  {
    id: '3',
    type: 'unauthorized_access',
    severity: 'critical',
    description: 'Admin paneline yetkisiz erişim denemesi',
    ip_address: '203.0.113.45',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    resolved: false,
    actions_taken: ['IP adresi kalıcı olarak engellendi']
  }
];

// Get security events
export const getSecurityEvents = async (req: Request, res: Response) => {
  try {
    // In a real application, this would fetch from database
    // with proper filtering, pagination, etc.
    const { page = 1, limit = 10, severity, resolved } = req.query;
    
    let filteredEvents = [...mockSecurityEvents];
    
    // Filter by severity if provided
    if (severity) {
      filteredEvents = filteredEvents.filter(event => event.severity === severity);
    }
    
    // Filter by resolved status if provided
    if (resolved !== undefined) {
      const isResolved = resolved === 'true';
      filteredEvents = filteredEvents.filter(event => event.resolved === isResolved);
    }
    
    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);
    
    res.json({
      events: paginatedEvents,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: filteredEvents.length,
        totalPages: Math.ceil(filteredEvents.length / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching security events:', error);
    res.status(500).json({ error: 'Güvenlik olayları alınırken hata oluştu' });
  }
};

// Mark security event as resolved
export const resolveSecurityEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { actions_taken } = req.body;
    
    // In a real application, this would update the database
    const eventIndex = mockSecurityEvents.findIndex(event => event.id === eventId);
    
    if (eventIndex === -1) {
      return res.status(404).json({ error: 'Güvenlik olayı bulunamadı' });
    }
    
    mockSecurityEvents[eventIndex].resolved = true;
    if (actions_taken) {
      mockSecurityEvents[eventIndex].actions_taken = actions_taken;
    }
    
    res.json({
      message: 'Güvenlik olayı çözüldü olarak işaretlendi',
      event: mockSecurityEvents[eventIndex]
    });
  } catch (error) {
    console.error('Error resolving security event:', error);
    res.status(500).json({ error: 'Güvenlik olayı çözülürken hata oluştu' });
  }
};

// Get security statistics
export const getSecurityStats = async (req: Request, res: Response) => {
  try {
    const totalEvents = mockSecurityEvents.length;
    const resolvedEvents = mockSecurityEvents.filter(event => event.resolved).length;
    const criticalEvents = mockSecurityEvents.filter(event => event.severity === 'critical').length;
    const recentEvents = mockSecurityEvents.filter(event => {
      const eventTime = new Date(event.timestamp).getTime();
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      return eventTime > oneDayAgo;
    }).length;
    
    res.json({
      total: totalEvents,
      resolved: resolvedEvents,
      unresolved: totalEvents - resolvedEvents,
      critical: criticalEvents,
      recent24h: recentEvents
    });
  } catch (error) {
    console.error('Error fetching security stats:', error);
    res.status(500).json({ error: 'Güvenlik istatistikleri alınırken hata oluştu' });
  }
};