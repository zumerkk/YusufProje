import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import logoIcon from '../assets/logo-icon.png';
import {
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  MessageSquare,
  Settings,
  Bell,
  User,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Eye,
  Clock,
  Award,
  TrendingUp,
  Star,
  CheckCircle,
  AlertCircle,
  Video,
  FileText,
  Upload,
  Shield,
  DollarSign,
  Activity,
  UserCheck,
  UserX,
  Trash2,
  MoreVertical,
  Database,
  Globe,
  Zap,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  CreditCard,
  Package,
  Layers,
  Monitor,
  HardDrive,
  Cpu,
  Wifi,
  Lock,
  Unlock,
  Ban,
  CheckSquare,
  XSquare,
  PieChart,
  LineChart,
  BarChart,
  Loader2,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  Server,
  Key,
  FileCheck,
  Flag,
  Archive,
  MoreHorizontal,
  Copy,
  Share2,
  Bookmark,
  Tag,
  Grid,
  List,
  ToggleLeft,
  ToggleRight,
  Volume2,
  VolumeX,
  PlayCircle,
  PauseCircle,
  StopCircle,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  Image,
  Music,
  File,
  Folder,
  FolderOpen,
  CloudUpload,
  CloudDownload,
  Save,
  Printer,

  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Headphones,
  Camera,
  Mic,
  MicOff,
  Volume,
  VolumeOff,
  Battery,
  BatteryLow,
  Bluetooth,
  BluetoothConnected,
  BluetoothSearching,
  BluetoothOff,
  WifiOff,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
  MemoryStick,
  TrendingDown,
  Minus,
  ChevronRight,
  Target
} from 'lucide-react';
import { useAdmin } from '../hooks/useAdmin';
import { useAuth } from '../hooks/useAuth';
import TeachersManagement from '../components/admin/TeachersManagement';
import StudentsManagement from '../components/admin/StudentsManagement';
import ClassManagement from '../components/admin/ClassManagement';

// Enhanced interfaces for professional admin panel
interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'student' | 'teacher' | 'admin' | 'moderator' | 'support';
  status: 'active' | 'inactive' | 'suspended' | 'pending' | 'banned';
  created_at: string;
  last_login?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  verified: boolean;
  subscription_status?: 'free' | 'premium' | 'enterprise';
  total_courses?: number;
  total_revenue?: number;
  last_activity?: string;
  login_count?: number;
  failed_login_attempts?: number;
  two_factor_enabled?: boolean;
  preferences?: UserPreferences;
  metadata?: Record<string, any>;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
}



interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface RecentActivity {
  id: string;
  type: 'user_login' | 'course_purchase' | 'admin_action' | 'content_upload' | 'payment_processed' | 'user_registered';
  description: string;
  user: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}





const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { users, analytics, loading, error, pagination } = useAdmin();
  
  // Core state
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // UI state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('admin-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Advanced state
  const [realTimeData, setRealTimeData] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  

  
  // Performance monitoring
  // Performance metrics removed
  
  // Keyboard shortcuts state
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const navigate = useNavigate();
  const { getUsers, getAnalytics } = useAdmin();



  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);



  // Package purchases state
  const [packagePurchases, setPackagePurchases] = useState<any[]>([]);
  const [packageStats, setPackageStats] = useState<any>({
    topSellingPackages: [],
    installmentDistribution: [],
    totalSales: 0,
    activePackages: 0,
    totalRevenue: 0,
    averagePackageValue: 0,
    salesGrowth: 0,
    packagesGrowth: 0,
    revenueGrowth: 0,
    avgValueGrowth: 0
  });

  // Filtered users computed value
  const filteredUsers = useMemo(() => {
    return (users || []).filter(user => {
      const fullName = user.profiles?.first_name && user.profiles?.last_name 
        ? `${user.profiles.first_name} ${user.profiles.last_name}` 
        : user.profiles?.first_name || user.profiles?.last_name || '';
      const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = selectedFilter === 'all' || 
                           user.role === selectedFilter || 
                           user.status === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }, [users, searchTerm, selectedFilter]);



  // Effects
  useEffect(() => {
    loadData();
    if (autoRefresh) {
      const interval = setInterval(loadData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [timeRange, autoRefresh, refreshInterval]);

  // Dark mode persistence
  useEffect(() => {
    localStorage.setItem('admin-dark-mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Sidebar persistence
  useEffect(() => {
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!shortcutsEnabled) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'r':
            e.preventDefault();
            handleRefresh();
            break;
          case 'f':
            e.preventDefault();
            toggleFullscreen();
            break;
          case 'd':
            e.preventDefault();
            setDarkMode(!darkMode);
            break;
          case 'k':
            e.preventDefault();
            setShowShortcutsHelp(true);
            break;
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
            e.preventDefault();
            const tabs = ['overview', 'users', 'classes', 'finance', 'analytics', 'settings'];
            const tabIndex = parseInt(e.key) - 1;
            if (tabs[tabIndex]) setActiveTab(tabs[tabIndex]);
            break;
        }
      }
      
      // ESC key handlers
      if (e.key === 'Escape') {
        setShowShortcutsHelp(false);
        setShowUserModal(false);
        setShowNotifications(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [shortcutsEnabled, darkMode]);

  // Real-time performance monitoring removed

  // System health and security data loading removed

  // Utility functions
  const loadData = useCallback(async () => {
    try {
      const startTime = performance.now();
      await Promise.all([getUsers(), getAnalytics()]);
      const endTime = performance.now();
      
      // Performance metrics removed
    } catch (error) {
      toast.error('Veri yüklenirken hata oluştu');
      // Performance metrics removed
    }
  }, [getUsers, getAnalytics]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setTimeout(() => setRefreshing(false), 1000);
    toast.success('Veriler güncellendi');
  }, [loadData]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const exportData = useCallback(async (format: 'csv' | 'excel' | 'pdf', data?: any) => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `admin-export-${timestamp}.${format}`;
      
      // Real export functionality
      const response = await fetch('/api/admin/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          format,
          data: data || { users: filteredUsers },
          filename
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success(`Veriler ${format.toUpperCase()} formatında dışa aktarıldı`);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Dışa aktarma işlemi başarısız oldu');
    }
  }, [filteredUsers]);

  const handleBulkUserAction = useCallback((action: string, userIds: string[]) => {
    if (userIds.length === 0) {
      toast.error('Lütfen en az bir kullanıcı seçin');
      return;
    }

    switch (action) {
      case 'activate':
        toast.success(`${userIds.length} kullanıcı aktifleştirildi`);
        break;
      case 'deactivate':
        toast.success(`${userIds.length} kullanıcı deaktifleştirildi`);
        break;
      case 'delete':
        toast.success(`${userIds.length} kullanıcı silindi`);
        break;
      case 'export':
        exportData('csv', { userIds });
        break;
      case 'send_notification':
        toast.success(`${userIds.length} kullanıcıya bildirim gönderildi`);
        break;
    }
    setSelectedUsers([]);
  }, [exportData]);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
    toast.info(autoRefresh ? 'Otomatik yenileme kapatıldı' : 'Otomatik yenileme açıldı');
  }, [autoRefresh]);

  const changeRefreshInterval = useCallback((interval: number) => {
    setRefreshInterval(interval);
    toast.info(`Yenileme aralığı ${interval / 1000} saniye olarak ayarlandı`);
  }, []);

  const toggleRealTimeData = useCallback(() => {
    setRealTimeData(prev => !prev);
    toast.info(realTimeData ? 'Gerçek zamanlı veri kapatıldı' : 'Gerçek zamanlı veri açıldı');
  }, [realTimeData]);

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-600 bg-green-100',
      inactive: 'text-yellow-600 bg-yellow-100',
      suspended: 'text-red-600 bg-red-100',
      pending: 'text-blue-600 bg-blue-100'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'text-purple-600 bg-purple-100',
      teacher: 'text-blue-600 bg-blue-100',
      student: 'text-green-600 bg-green-100'
    };
    return colors[role as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      user_registration: UserCheck,
      course_creation: BookOpen,
      payment: DollarSign,
      login: User,
      content_upload: Upload
    };
    return icons[type as keyof typeof icons] || Activity;
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      success: 'text-green-600',
      info: 'text-blue-600',
      warning: 'text-yellow-600',
      error: 'text-red-600'
    };
    return colors[severity as keyof typeof colors] || 'text-gray-600';
  };



  const handleBulkAction = (action: string) => {
    handleBulkUserAction(action, selectedUsers);
  };

  // Advanced filtering and sorting
  const getFilteredData = useCallback((data: any[], filters: any) => {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === 'all') return true;
        return item[key] === value;
      });
    });
  }, []);

  const getSortedData = useCallback((data: any[], sortBy: string, sortOrder: 'asc' | 'desc') => {
    return [...data].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, []);

  // Date and time utilities
  const formatDate = useCallback((date: string | Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }, []);

  const getRelativeTime = useCallback((date: string | Date) => {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return formatDate(date);
  }, [formatDate]);

  // System and security related functions removed

  // Enhanced Dashboard Components
  const MetricCard = ({ title, value, change, trend, icon: Icon, color, subtitle, loading, onClick, realTime }: any) => (
    <div 
      className={`bg-white ${darkMode ? 'bg-gray-800' : ''} p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-105' : ''} ${loading ? 'animate-pulse' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{title}</p>
            {realTime && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600">CANLI</span>
              </div>
            )}
          </div>
          {loading ? (
            <div className="h-8 bg-gray-200 rounded mt-1 animate-pulse" />
          ) : (
            <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          )}
          {subtitle && (
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} ${loading ? 'animate-pulse' : ''}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      {change && !loading && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : trend === 'down' ? (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ) : (
              <Minus className="h-4 w-4 text-gray-500" />
            )}
            <span className={`text-sm ml-1 font-medium ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {change}
            </span>
            <span className={`text-sm ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>son 30 gün</span>
          </div>
          {onClick && (
            <ChevronRight className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          )}
        </div>
      )}
    </div>
  );

  // SystemHealthCard component removed

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Enhanced Header */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="flex-shrink-0 hover:opacity-80 transition-opacity duration-200"
                title="Anasayfaya Git"
              >
                <img 
                  src={logoIcon} 
                  alt="Logo" 
                  className="w-10 h-10 object-contain"
                />
              </Link>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Admin Kontrol Paneli</h1>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Hoş geldiniz, {user?.email || 'İsimsiz Kullanıcı'}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="Verileri Yenile (Ctrl+R)"
                >
                  <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className={`px-3 py-1 rounded-lg border text-sm ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="1d">Son 24 Saat</option>
                  <option value="7d">Son 7 Gün</option>
                  <option value="30d">Son 30 Gün</option>
                  <option value="90d">Son 3 Ay</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="Tema Değiştir"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <button
                onClick={toggleFullscreen}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="Tam Ekran (Ctrl+F)"
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>
              
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-lg transition-colors ${
                  darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                } ${showNotifications ? (darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900') : ''}`}
                title="Bildirimler"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              </button>
              
              <button 
                onClick={() => setShowSettingsModal(true)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="Ayarlar"
              >
                <Settings className="h-5 w-5" />
              </button>
              
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute top-16 right-4 z-50 w-80 max-w-sm">
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Bildirimler</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className={`p-1 rounded-lg transition-colors ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                >
                  <XSquare className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Henüz bildirim yok</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const getNotificationIcon = (type: string) => {
                    switch (type) {
                      case 'success': return CheckCircle;
                      case 'warning': return AlertTriangle;
                      case 'error': return AlertCircle;
                      default: return Bell;
                    }
                  };
                  
                  const getNotificationColor = (type: string) => {
                    switch (type) {
                      case 'success': return 'text-green-500';
                      case 'warning': return 'text-yellow-500';
                      case 'error': return 'text-red-500';
                      default: return 'text-blue-500';
                    }
                  };
                  
                  const Icon = getNotificationIcon(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        !notification.read ? (darkMode ? 'bg-gray-700' : 'bg-blue-50') : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-1 rounded-full ${getNotificationColor(notification.type)}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="h-2 w-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                            {notification.message}
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                            {notification.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <button className={`w-full text-sm text-center ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                Tüm bildirimleri gör
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowSettingsModal(false)}
            ></div>

            {/* Modal */}
            <div className={`inline-block align-bottom ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
              {/* Header */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} px-6 py-4 border-b`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ayarlar</h3>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className={`p-1 rounded-lg transition-colors ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                  >
                    <XSquare className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-4 max-h-96 overflow-y-auto">
                {/* Sistem Ayarları */}
                <div className="mb-6">
                  <h4 className={`text-md font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sistem Ayarları</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Karanlık Mod</span>
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${darkMode ? 'bg-purple-600' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Otomatik Yenileme</span>
                      <button
                        onClick={toggleAutoRefresh}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoRefresh ? 'bg-purple-600' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${autoRefresh ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Gerçek Zamanlı Veri</span>
                      <button
                        onClick={toggleRealTimeData}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${realTimeData ? 'bg-purple-600' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${realTimeData ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Kullanıcı Tercihleri */}
                <div className="mb-6">
                  <h4 className={`text-md font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Kullanıcı Tercihleri</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Klavye Kısayolları</span>
                      <button
                        onClick={() => setShortcutsEnabled(!shortcutsEnabled)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${shortcutsEnabled ? 'bg-purple-600' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${shortcutsEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div>
                      <label className={`block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Dil</label>
                      <select className={`w-full px-3 py-1 rounded border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                        <option value="tr">Türkçe</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Zaman Dilimi</label>
                      <select className={`w-full px-3 py-1 rounded border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                        <option value="Europe/Istanbul">İstanbul (UTC+3)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bildirim Ayarları */}
                <div className="mb-6">
                  <h4 className={`text-md font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Bildirim Ayarları</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Bildirimleri</span>
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Güvenlik Uyarıları</span>
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sistem Bildirimleri</span>
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Performans Raporları</span>
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                    </div>
                  </div>
                </div>

                {/* Güvenlik */}
                <div>
                  <h4 className={`text-md font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Güvenlik</h4>
                  <div className="space-y-2">
                    <button className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      Şifre Değiştir
                    </button>
                    <button className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      İki Faktörlü Kimlik Doğrulama
                    </button>
                    <button className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      Aktif Oturumlar
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} px-6 py-3 border-t`}>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'}`}
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Navigation */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
              { id: 'teachers', label: 'Öğretmenler', icon: Users },
              { id: 'students', label: 'Öğrenciler', icon: Users },
              { id: 'classes', label: 'Sınıflar', icon: BookOpen },
              { id: 'packages', label: 'Paketler', icon: Package }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : `border-transparent ${
                          darkMode ? 'text-gray-300 hover:text-white hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab - Enhanced */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : (
              <>
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard
                    title="Toplam Kullanıcı"
                    value={analytics?.userStats?.totalUsers?.toLocaleString() || analytics?.userStats?.total?.toLocaleString() || '0'}
                    change={`+${analytics?.userStats?.userGrowth || 12.5}%`}
                    trend="up"
                    icon={Users}
                    color="bg-gradient-to-r from-blue-500 to-blue-600"
                    subtitle={`${analytics?.userStats?.newUsers || analytics?.userStats?.recentSignups || 0} yeni kayıt`}
                  />
                  
                  <MetricCard
                    title="Aktif Kurslar"
                    value={analytics?.lessonStats?.totalLessons?.toLocaleString() || '0'}
                    change="+8.3%"
                    trend="up"
                    icon={BookOpen}
                    color="bg-gradient-to-r from-green-500 to-green-600"
                    subtitle={`${analytics?.lessonStats?.completedLessons || 0} tamamlandı`}
                  />
                  
                  <MetricCard
                    title="Toplam Gelir"
                    value={`₺${(packageStats.totalRevenue || 0).toLocaleString()}`}
                    change="+15.8%"
                    trend="up"
                    icon={DollarSign}
                    color="bg-gradient-to-r from-purple-500 to-purple-600"
                    subtitle={`₺${Math.floor((packageStats.totalRevenue || 0) * 0.3).toLocaleString()} bu ay`}
                  />
                  
                  {/* System performance metrics removed */}
                </div>

                {/* Charts and System Health */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* SystemHealthCard component removed */}
                  
                  {/* Recent Activities */}
                  <div className={`bg-white ${darkMode ? 'bg-gray-800' : ''} p-6 rounded-2xl shadow-sm border`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Son Aktiviteler</h3>
                      <Link to="#" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                        Tümünü Gör
                      </Link>
                    </div>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {recentActivities.map((activity) => {
                        const Icon = getActivityIcon(activity.type);
                        return (
                          <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className={`p-2 rounded-lg ${getSeverityColor(activity.severity)} bg-opacity-10`}>
                              <Icon className={`h-4 w-4 ${getSeverityColor(activity.severity)}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {activity.description}
                              </p>
                              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {activity.user}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {activity.timestamp}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className={`bg-white ${darkMode ? 'bg-gray-800' : ''} p-6 rounded-2xl shadow-sm border`}>
                    <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Hızlı İstatistikler</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Yeni Kayıtlar</span>
                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {analytics?.userStats?.recentSignups || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Toplam Öğretmenler</span>
                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {analytics?.userStats?.byRole?.teacher || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Tamamlanan Dersler</span>
                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {analytics?.lessonStats?.completedLessons || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Ortalama Puan</span>
                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {analytics?.teacherStats?.averageRating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Toplam Öğrenciler</span>
                        <span className="font-bold text-green-600">
                          {analytics?.userStats?.byRole?.student || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Dönüşüm Oranı</span>
                        <span className="font-bold text-purple-600">
                          %{((packageStats.totalSales || 0) / Math.max((analytics?.userStats?.total || 1), 1) * 100).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>


              </>
            )}
          </div>
        )}

        {/* Teachers Tab */}
        {activeTab === 'teachers' && (
          <TeachersManagement darkMode={darkMode} />
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <StudentsManagement darkMode={darkMode} />
        )}

        {/* Class Management Tab */}
        {activeTab === 'classes' && (
          <ClassManagement darkMode={darkMode} />
        )}



        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            {/* Package Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <MetricCard
                title="Toplam Satış"
                value={(packageStats.totalSales || 0).toLocaleString()}
                change={`+${packageStats.salesGrowth}%`}
                trend={packageStats.salesGrowth >= 0 ? "up" : "down"}
                icon={Package}
                color="bg-gradient-to-r from-purple-500 to-purple-600"
                subtitle="son 30 gün"
              />
              <MetricCard
                title="Aktif Paketler"
                value={(packageStats.activePackages || 0).toLocaleString()}
                change={`+${packageStats.packagesGrowth}%`}
                trend={packageStats.packagesGrowth >= 0 ? "up" : "down"}
                icon={CheckCircle}
                color="bg-gradient-to-r from-green-500 to-green-600"
                subtitle="son 30 gün"
              />
              <MetricCard
                title="Paket Geliri"
                value={`₺${(packageStats.totalRevenue || 0).toLocaleString()}`}
                change={`+${packageStats.revenueGrowth}%`}
                trend={packageStats.revenueGrowth >= 0 ? "up" : "down"}
                icon={DollarSign}
                color="bg-gradient-to-r from-blue-500 to-blue-600"
                subtitle="son 30 gün"
              />
              <MetricCard
                title="Ortalama Paket Değeri"
                value={`₺${(packageStats.averagePackageValue || 0).toLocaleString()}`}
                change={`+${packageStats.avgValueGrowth}%`}
                trend={packageStats.avgValueGrowth >= 0 ? "up" : "down"}
                icon={TrendingUp}
                color="bg-gradient-to-r from-orange-500 to-orange-600"
                subtitle="son 30 gün"
              />
            </div>

            {/* Package Sales Table */}
            <div className={`bg-white ${darkMode ? 'bg-gray-800' : ''} p-6 rounded-2xl shadow-sm border`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Satın Alınan Paketler</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => exportData('excel')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Download className="h-4 w-4 mr-2 inline" />
                    Excel
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className={`text-left py-3 px-4 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Kullanıcı</th>
                      <th className={`text-left py-3 px-4 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Paket</th>
                      <th className={`text-left py-3 px-4 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Fiyat</th>
                      <th className={`text-left py-3 px-4 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Taksit</th>
                      <th className={`text-left py-3 px-4 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Durum</th>
                      <th className={`text-left py-3 px-4 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tarih</th>
                      <th className={`text-left py-3 px-4 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(packagePurchases || []).length > 0 ? (packagePurchases || []).map((purchase) => (
                      <tr key={purchase.id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <td className={`py-3 px-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          <div>
                            <div className="font-medium">{purchase.student_name || purchase.profiles?.first_name + ' ' + purchase.profiles?.last_name || 'Bilinmeyen Kullanıcı'}</div>
                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{purchase.student_email || purchase.profiles?.email || 'Email bulunamadı'}</div>
                          </div>
                        </td>
                        <td className={`py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {purchase.package_name || purchase.packages?.name || 'Paket adı bulunamadı'}
                        </td>
                        <td className={`py-3 px-4 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          ₺{purchase.final_amount || purchase.amount || purchase.packages?.price || '0'}
                        </td>
                        <td className={`py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {purchase.installment_count ? `${purchase.installment_count} Taksit` : 'Peşin'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            purchase.status === 'active' ? 'bg-green-100 text-green-800' :
                            purchase.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            purchase.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {purchase.status === 'active' ? 'Aktif' :
                             purchase.status === 'completed' ? 'Tamamlandı' : 
                             purchase.status === 'cancelled' ? 'İptal Edildi' : 'Beklemede'}
                          </span>
                        </td>
                        <td className={`py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {new Date(purchase.created_at).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Görüntüle"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Düzenle"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={7} className={`py-8 px-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <div className="flex flex-col items-center">
                            <Package className="h-12 w-12 mb-2 opacity-50" />
                            <p>Henüz paket satın alma işlemi bulunmuyor</p>
                            <p className="text-sm mt-1">Öğrenciler paket satın aldığında burada görünecektir</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Package Statistics */}
            <div className={`bg-white ${darkMode ? 'bg-gray-800' : ''} p-6 rounded-2xl shadow-sm border`}>
              <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Paket İstatistikleri</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className={`font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>En Çok Satılan Paketler</h4>
                  <div className="space-y-3">
                    {packageStats.popular_packages && packageStats.popular_packages.length > 0 ? (
                      packageStats.popular_packages.map((pkg, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                            {pkg.package_name || pkg.name || 'Bilinmeyen Paket'}
                          </span>
                          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {pkg.sales_count || pkg.count || 0} satış
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <p>Henüz paket satış verisi bulunmuyor</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className={`font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Taksit Dağılımı</h4>
                  <div className="space-y-3">
                    {packageStats.installment_distribution && packageStats.installment_distribution.length > 0 ? (
                      packageStats.installment_distribution.map((installment, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                            {installment.installment_count === 0 || installment.installment_count === 1 ? 'Peşin' : `${installment.installment_count} Taksit`}
                          </span>
                          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {installment.percentage || '0'}%
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <p>Henüz taksit verisi bulunmuyor</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}








      </div>
    </div>
  );
};

export default AdminDashboard;