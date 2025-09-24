import { Request, Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';

// Mock content moderation data
const mockModerationQueue = [
  {
    id: '1',
    type: 'course',
    title: 'İleri Seviye JavaScript Kursu',
    content: 'Bu kurs JavaScript programlama dilinin ileri seviye konularını kapsar...',
    author: 'teacher@example.com',
    author_id: 'teacher123',
    status: 'pending',
    priority: 'medium',
    reported_by: 'user456',
    report_reason: 'Uygunsuz içerik',
    report_details: 'Kurs içeriğinde telif hakkı ihlali olabilir',
    submitted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    reviewed_at: null,
    reviewed_by: null,
    moderator_notes: null,
    flags: ['copyright_concern'],
    metadata: {
      course_id: 'course123',
      duration: '40 saat',
      price: 299
    }
  },
  {
    id: '2',
    type: 'comment',
    title: 'Ders yorumu',
    content: 'Bu ders gerçekten çok kötü, hiçbir şey anlamadım. Para israfı!',
    author: 'student@example.com',
    author_id: 'student456',
    status: 'pending',
    priority: 'low',
    reported_by: 'teacher789',
    report_reason: 'Hakaret',
    report_details: 'Öğrenci dersi ve öğretmeni aşağılayıcı şekilde eleştiriyor',
    submitted_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    reviewed_at: null,
    reviewed_by: null,
    moderator_notes: null,
    flags: ['inappropriate_language'],
    metadata: {
      lesson_id: 'lesson456',
      parent_comment_id: null
    }
  },
  {
    id: '3',
    type: 'review',
    title: 'Kurs değerlendirmesi',
    content: 'Mükemmel bir kurs! Herkese tavsiye ederim. 5 yıldız!',
    author: 'student2@example.com',
    author_id: 'student789',
    status: 'approved',
    priority: 'low',
    reported_by: null,
    report_reason: null,
    report_details: null,
    submitted_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    reviewed_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    reviewed_by: 'moderator@example.com',
    moderator_notes: 'İçerik uygun, onaylandı',
    flags: [],
    metadata: {
      course_id: 'course123',
      rating: 5
    }
  },
  {
    id: '4',
    type: 'user_profile',
    title: 'Kullanıcı profili',
    content: 'Profil açıklaması: En iyi hacker, tüm sistemleri hackleyebilirim!',
    author: 'suspicious@example.com',
    author_id: 'user999',
    status: 'rejected',
    priority: 'high',
    reported_by: 'system',
    report_reason: 'Şüpheli aktivite',
    report_details: 'Profil açıklamasında zararlı aktivite ima edilmekte',
    submitted_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    reviewed_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    reviewed_by: 'admin@example.com',
    moderator_notes: 'Güvenlik riski, profil askıya alındı',
    flags: ['security_risk', 'inappropriate_content'],
    metadata: {
      profile_section: 'bio',
      account_age_days: 1
    }
  }
];

// Get content moderation queue
export const getModerationQueue = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      type, 
      priority,
      author_id,
      start_date,
      end_date
    } = req.query;
    
    let filteredQueue = [...mockModerationQueue];
    
    // Filter by status if provided
    if (status) {
      filteredQueue = filteredQueue.filter(item => item.status === status);
    }
    
    // Filter by type if provided
    if (type) {
      filteredQueue = filteredQueue.filter(item => item.type === type);
    }
    
    // Filter by priority if provided
    if (priority) {
      filteredQueue = filteredQueue.filter(item => item.priority === priority);
    }
    
    // Filter by author if provided
    if (author_id) {
      filteredQueue = filteredQueue.filter(item => item.author_id === author_id);
    }
    
    // Filter by date range if provided
    if (start_date) {
      const startDate = new Date(start_date as string);
      filteredQueue = filteredQueue.filter(item => new Date(item.submitted_at) >= startDate);
    }
    
    if (end_date) {
      const endDate = new Date(end_date as string);
      filteredQueue = filteredQueue.filter(item => new Date(item.submitted_at) <= endDate);
    }
    
    // Sort by priority and submission date
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    filteredQueue.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
    });
    
    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedQueue = filteredQueue.slice(startIndex, endIndex);
    
    res.json({
      items: paginatedQueue,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: filteredQueue.length,
        totalPages: Math.ceil(filteredQueue.length / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching moderation queue:', error);
    res.status(500).json({ error: 'Moderasyon kuyruğu alınırken hata oluştu' });
  }
};

// Get moderation item by ID
export const getModerationItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    
    const item = mockModerationQueue.find(item => item.id === itemId);
    
    if (!item) {
      return res.status(404).json({ error: 'Moderasyon öğesi bulunamadı' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error fetching moderation item:', error);
    res.status(500).json({ error: 'Moderasyon öğesi alınırken hata oluştu' });
  }
};

// Review moderation item
export const reviewModerationItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { action, moderator_notes } = req.body; // action: 'approve', 'reject', 'flag'
    
    const itemIndex = mockModerationQueue.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Moderasyon öğesi bulunamadı' });
    }
    
    const item = mockModerationQueue[itemIndex];
    
    // Update item based on action
    switch (action) {
      case 'approve':
        item.status = 'approved';
        break;
      case 'reject':
        item.status = 'rejected';
        break;
      case 'flag':
        item.status = 'flagged';
        break;
      default:
        return res.status(400).json({ error: 'Geçersiz işlem' });
    }
    
    item.reviewed_at = new Date().toISOString();
    item.reviewed_by = 'admin@test.com'; // In real app, get from authenticated user
    item.moderator_notes = moderator_notes;
    
    res.json({
      message: 'Moderasyon incelemesi tamamlandı',
      item
    });
  } catch (error) {
    console.error('Error reviewing moderation item:', error);
    res.status(500).json({ error: 'Moderasyon incelemesi yapılırken hata oluştu' });
  }
};

// Get moderation statistics
export const getModerationStats = async (req: Request, res: Response) => {
  try {
    const totalItems = mockModerationQueue.length;
    const pendingItems = mockModerationQueue.filter(item => item.status === 'pending').length;
    const approvedItems = mockModerationQueue.filter(item => item.status === 'approved').length;
    const rejectedItems = mockModerationQueue.filter(item => item.status === 'rejected').length;
    const flaggedItems = mockModerationQueue.filter(item => item.status === 'flagged').length;
    
    // Count by type
    const typeCounts = mockModerationQueue.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Count by priority
    const priorityCounts = mockModerationQueue.reduce((acc, item) => {
      acc[item.priority] = (acc[item.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Recent submissions (last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentSubmissions = mockModerationQueue.filter(item => {
      return new Date(item.submitted_at).getTime() > oneDayAgo;
    }).length;
    
    res.json({
      total: totalItems,
      pending: pendingItems,
      approved: approvedItems,
      rejected: rejectedItems,
      flagged: flaggedItems,
      recent24h: recentSubmissions,
      typeBreakdown: typeCounts,
      priorityBreakdown: priorityCounts
    });
  } catch (error) {
    console.error('Error fetching moderation stats:', error);
    res.status(500).json({ error: 'Moderasyon istatistikleri alınırken hata oluştu' });
  }
};

// Bulk review moderation items
export const bulkReviewItems = async (req: Request, res: Response) => {
  try {
    const { item_ids, action, moderator_notes } = req.body;
    
    if (!Array.isArray(item_ids) || item_ids.length === 0) {
      return res.status(400).json({ error: 'Geçerli öğe ID\'leri gerekli' });
    }
    
    const updatedItems = [];
    
    for (const itemId of item_ids) {
      const itemIndex = mockModerationQueue.findIndex(item => item.id === itemId);
      
      if (itemIndex !== -1) {
        const item = mockModerationQueue[itemIndex];
        
        switch (action) {
          case 'approve':
            item.status = 'approved';
            break;
          case 'reject':
            item.status = 'rejected';
            break;
          case 'flag':
            item.status = 'flagged';
            break;
        }
        
        item.reviewed_at = new Date().toISOString();
        item.reviewed_by = 'admin@test.com';
        item.moderator_notes = moderator_notes;
        
        updatedItems.push(item);
      }
    }
    
    res.json({
      message: `${updatedItems.length} öğe toplu olarak incelendi`,
      updated_items: updatedItems
    });
  } catch (error) {
    console.error('Error bulk reviewing items:', error);
    res.status(500).json({ error: 'Toplu inceleme yapılırken hata oluştu' });
  }
};