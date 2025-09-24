import { logger } from './logger';

export interface PerformanceMetrics {
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  activeConnections: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: number;
  uptime: number;
  slowQueries: SlowQuery[];
}

export interface SlowQuery {
  query: string;
  duration: number;
  timestamp: Date;
  table?: string;
}

export interface RequestMetric {
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
}

class PerformanceMonitor {
  private metrics: {
    requests: RequestMetric[];
    slowQueries: SlowQuery[];
    errors: any[];
    startTime: Date;
  };
  
  private readonly MAX_STORED_REQUESTS = 1000;
  private readonly MAX_STORED_QUERIES = 100;
  private readonly SLOW_QUERY_THRESHOLD = 1000; // 1 second
  private readonly SLOW_REQUEST_THRESHOLD = 2000; // 2 seconds

  constructor() {
    this.metrics = {
      requests: [],
      slowQueries: [],
      errors: [],
      startTime: new Date()
    };
    
    // Start periodic cleanup
    this.startPeriodicCleanup();
  }

  /**
   * Record a request metric
   */
  recordRequest(metric: RequestMetric): void {
    this.metrics.requests.push(metric);
    
    // Log slow requests
    if (metric.responseTime > this.SLOW_REQUEST_THRESHOLD) {
      logger.warn(`Slow request detected: ${metric.method} ${metric.path} - ${metric.responseTime}ms`);
    }
    
    // Keep only recent requests
    if (this.metrics.requests.length > this.MAX_STORED_REQUESTS) {
      this.metrics.requests = this.metrics.requests.slice(-this.MAX_STORED_REQUESTS);
    }
  }

  /**
   * Record a slow query
   */
  recordSlowQuery(query: SlowQuery): void {
    if (query.duration > this.SLOW_QUERY_THRESHOLD) {
      this.metrics.slowQueries.push(query);
      logger.warn(`Slow query detected: ${query.query} - ${query.duration}ms`);
      
      // Keep only recent slow queries
      if (this.metrics.slowQueries.length > this.MAX_STORED_QUERIES) {
        this.metrics.slowQueries = this.metrics.slowQueries.slice(-this.MAX_STORED_QUERIES);
      }
    }
  }

  /**
   * Record an error
   */
  recordError(error: any, context?: any): void {
    this.metrics.errors.push({
      error: error.message || error,
      stack: error.stack,
      context,
      timestamp: new Date()
    });
    
    // Keep only recent errors
    if (this.metrics.errors.length > 100) {
      this.metrics.errors = this.metrics.errors.slice(-100);
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    // Filter recent requests (last hour)
    const recentRequests = this.metrics.requests.filter(
      req => req.timestamp.getTime() > oneHourAgo
    );
    
    // Calculate metrics
    const requestCount = recentRequests.length;
    const averageResponseTime = requestCount > 0 
      ? recentRequests.reduce((sum, req) => sum + req.responseTime, 0) / requestCount
      : 0;
    
    const errorCount = recentRequests.filter(req => req.statusCode >= 400).length;
    const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;
    
    return {
      requestCount,
      averageResponseTime: Math.round(averageResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      activeConnections: this.getActiveConnections(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: this.getCpuUsage(),
      uptime: Math.floor((now - this.metrics.startTime.getTime()) / 1000),
      slowQueries: this.metrics.slowQueries.slice(-10) // Last 10 slow queries
    };
  }

  /**
   * Get detailed request statistics
   */
  getRequestStats(timeRange: 'hour' | 'day' | 'week' = 'hour'): {
    totalRequests: number;
    requestsByMethod: Record<string, number>;
    requestsByStatus: Record<string, number>;
    averageResponseTime: number;
    slowestRequests: RequestMetric[];
    errorRate: number;
    requestsPerMinute: number[];
  } {
    const now = Date.now();
    let timeRangeMs: number;
    
    switch (timeRange) {
      case 'day':
        timeRangeMs = 24 * 60 * 60 * 1000;
        break;
      case 'week':
        timeRangeMs = 7 * 24 * 60 * 60 * 1000;
        break;
      default:
        timeRangeMs = 60 * 60 * 1000; // hour
    }
    
    const cutoffTime = now - timeRangeMs;
    const filteredRequests = this.metrics.requests.filter(
      req => req.timestamp.getTime() > cutoffTime
    );
    
    // Group by method
    const requestsByMethod: Record<string, number> = {};
    filteredRequests.forEach(req => {
      requestsByMethod[req.method] = (requestsByMethod[req.method] || 0) + 1;
    });
    
    // Group by status code
    const requestsByStatus: Record<string, number> = {};
    filteredRequests.forEach(req => {
      const statusGroup = `${Math.floor(req.statusCode / 100)}xx`;
      requestsByStatus[statusGroup] = (requestsByStatus[statusGroup] || 0) + 1;
    });
    
    // Calculate average response time
    const averageResponseTime = filteredRequests.length > 0
      ? filteredRequests.reduce((sum, req) => sum + req.responseTime, 0) / filteredRequests.length
      : 0;
    
    // Get slowest requests
    const slowestRequests = [...filteredRequests]
      .sort((a, b) => b.responseTime - a.responseTime)
      .slice(0, 10);
    
    // Calculate error rate
    const errorCount = filteredRequests.filter(req => req.statusCode >= 400).length;
    const errorRate = filteredRequests.length > 0 
      ? (errorCount / filteredRequests.length) * 100 
      : 0;
    
    // Calculate requests per minute
    const requestsPerMinute: number[] = [];
    const minutesInRange = Math.ceil(timeRangeMs / (60 * 1000));
    
    for (let i = 0; i < minutesInRange; i++) {
      const minuteStart = now - (i * 60 * 1000);
      const minuteEnd = minuteStart + 60 * 1000;
      
      const requestsInMinute = filteredRequests.filter(
        req => req.timestamp.getTime() >= minuteStart && req.timestamp.getTime() < minuteEnd
      ).length;
      
      requestsPerMinute.unshift(requestsInMinute);
    }
    
    return {
      totalRequests: filteredRequests.length,
      requestsByMethod,
      requestsByStatus,
      averageResponseTime: Math.round(averageResponseTime),
      slowestRequests,
      errorRate: Math.round(errorRate * 100) / 100,
      requestsPerMinute
    };
  }

  /**
   * Get system health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    score: number;
  } {
    const metrics = this.getMetrics();
    const issues: string[] = [];
    let score = 100;
    
    // Check error rate
    if (metrics.errorRate > 10) {
      issues.push(`High error rate: ${metrics.errorRate}%`);
      score -= 30;
    } else if (metrics.errorRate > 5) {
      issues.push(`Elevated error rate: ${metrics.errorRate}%`);
      score -= 15;
    }
    
    // Check response time
    if (metrics.averageResponseTime > 2000) {
      issues.push(`Slow response time: ${metrics.averageResponseTime}ms`);
      score -= 25;
    } else if (metrics.averageResponseTime > 1000) {
      issues.push(`Elevated response time: ${metrics.averageResponseTime}ms`);
      score -= 10;
    }
    
    // Check memory usage
    const memoryUsagePercent = (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100;
    if (memoryUsagePercent > 90) {
      issues.push(`High memory usage: ${memoryUsagePercent.toFixed(1)}%`);
      score -= 20;
    } else if (memoryUsagePercent > 80) {
      issues.push(`Elevated memory usage: ${memoryUsagePercent.toFixed(1)}%`);
      score -= 10;
    }
    
    // Check slow queries
    if (metrics.slowQueries.length > 5) {
      issues.push(`Multiple slow queries detected: ${metrics.slowQueries.length}`);
      score -= 15;
    }
    
    // Determine status
    let status: 'healthy' | 'warning' | 'critical';
    if (score >= 80) {
      status = 'healthy';
    } else if (score >= 60) {
      status = 'warning';
    } else {
      status = 'critical';
    }
    
    return { status, issues, score };
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    summary: PerformanceMetrics;
    health: ReturnType<typeof this.getHealthStatus>;
    requestStats: ReturnType<typeof this.getRequestStats>;
    recommendations: string[];
  } {
    const summary = this.getMetrics();
    const health = this.getHealthStatus();
    const requestStats = this.getRequestStats();
    const recommendations: string[] = [];
    
    // Generate recommendations
    if (summary.averageResponseTime > 1000) {
      recommendations.push('Consider implementing query optimization and caching');
    }
    
    if (summary.errorRate > 5) {
      recommendations.push('Review error logs and implement better error handling');
    }
    
    if (summary.slowQueries.length > 3) {
      recommendations.push('Optimize database queries and add proper indexing');
    }
    
    const memoryUsagePercent = (summary.memoryUsage.heapUsed / summary.memoryUsage.heapTotal) * 100;
    if (memoryUsagePercent > 80) {
      recommendations.push('Monitor memory usage and implement memory optimization');
    }
    
    if (requestStats.totalRequests > 1000 && summary.averageResponseTime > 500) {
      recommendations.push('Consider implementing load balancing and horizontal scaling');
    }
    
    return {
      summary,
      health,
      requestStats,
      recommendations
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = {
      requests: [],
      slowQueries: [],
      errors: [],
      startTime: new Date()
    };
    logger.info('Performance metrics reset');
  }

  private getActiveConnections(): number {
    // This is a placeholder - in a real implementation,
    // you would track actual active connections
    return Math.floor(Math.random() * 10) + 1;
  }

  private getCpuUsage(): number {
    // This is a placeholder - in a real implementation,
    // you would use a library like 'pidusage' to get actual CPU usage
    return Math.floor(Math.random() * 100);
  }

  private startPeriodicCleanup(): void {
    // Clean up old data every hour
    setInterval(() => {
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      // Clean old requests
      this.metrics.requests = this.metrics.requests.filter(
        req => req.timestamp.getTime() > oneWeekAgo
      );
      
      // Clean old slow queries
      this.metrics.slowQueries = this.metrics.slowQueries.filter(
        query => query.timestamp.getTime() > oneWeekAgo
      );
      
      // Clean old errors
      this.metrics.errors = this.metrics.errors.filter(
        error => error.timestamp.getTime() > oneWeekAgo
      );
      
      logger.debug('Performance metrics cleanup completed');
    }, 60 * 60 * 1000); // Every hour
  }
}

export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;