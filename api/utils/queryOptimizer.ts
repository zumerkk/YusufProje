import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface QueryOptions {
  select?: string;
  limit?: number;
  offset?: number;
  orderBy?: { column: string; ascending?: boolean }[];
  filters?: { column: string; operator: string; value: any }[];
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

class QueryOptimizer {
  private queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100;

  /**
   * Execute optimized query with caching
   */
  async executeQuery<T>(
    table: string,
    options: QueryOptions = {},
    cacheKey?: string,
    cacheTTL: number = this.DEFAULT_CACHE_TTL
  ): Promise<T[]> {
    const startTime = Date.now();
    
    // Generate cache key if not provided
    if (!cacheKey) {
      cacheKey = this.generateCacheKey(table, options);
    }
    
    // Check cache first
    const cachedResult = this.getFromCache<T[]>(cacheKey);
    if (cachedResult) {
      logger.debug(`Cache hit for query: ${cacheKey}`);
      return cachedResult;
    }
    
    try {
      // Build query
      let query = supabase.from(table);
      
      // Apply select
      if (options.select) {
        query = query.select(options.select);
      } else {
        query = query.select('*');
      }
      
      // Apply filters
      if (options.filters) {
        for (const filter of options.filters) {
          switch (filter.operator) {
            case 'eq':
              query = query.eq(filter.column, filter.value);
              break;
            case 'neq':
              query = query.neq(filter.column, filter.value);
              break;
            case 'gt':
              query = query.gt(filter.column, filter.value);
              break;
            case 'gte':
              query = query.gte(filter.column, filter.value);
              break;
            case 'lt':
              query = query.lt(filter.column, filter.value);
              break;
            case 'lte':
              query = query.lte(filter.column, filter.value);
              break;
            case 'like':
              query = query.like(filter.column, filter.value);
              break;
            case 'ilike':
              query = query.ilike(filter.column, filter.value);
              break;
            case 'in':
              query = query.in(filter.column, filter.value);
              break;
            case 'is':
              query = query.is(filter.column, filter.value);
              break;
            default:
              logger.warn(`Unknown filter operator: ${filter.operator}`);
          }
        }
      }
      
      // Apply ordering
      if (options.orderBy) {
        for (const order of options.orderBy) {
          query = query.order(order.column, { ascending: order.ascending ?? true });
        }
      }
      
      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      const { data, error } = await query;
      
      if (error) {
        logger.error(`Query failed for table ${table}:`, error);
        throw error;
      }
      
      const executionTime = Date.now() - startTime;
      logger.debug(`Query executed in ${executionTime}ms for table: ${table}`);
      
      // Cache the result
      this.setCache(cacheKey, data || [], cacheTTL);
      
      return data || [];
    } catch (error) {
      logger.error(`Query optimization failed for table ${table}:`, error);
      throw error;
    }
  }

  /**
   * Execute paginated query with optimization
   */
  async executePaginatedQuery<T>(
    table: string,
    pagination: PaginationOptions,
    options: Omit<QueryOptions, 'limit' | 'offset'> = {},
    cacheKey?: string
  ): Promise<PaginatedResult<T>> {
    const { page, pageSize } = pagination;
    const offset = (page - 1) * pageSize;
    
    // Get total count
    const countCacheKey = `${cacheKey || table}_count`;
    let totalCount = this.getFromCache<number>(countCacheKey);
    
    if (totalCount === null) {
      const { count, error: countError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        logger.error(`Count query failed for table ${table}:`, countError);
        throw countError;
      }
      
      totalCount = count || 0;
      this.setCache(countCacheKey, totalCount, this.DEFAULT_CACHE_TTL);
    }
    
    // Get paginated data
    const data = await this.executeQuery<T>(table, {
      ...options,
      limit: pageSize,
      offset
    }, cacheKey);
    
    const totalPages = Math.ceil(totalCount / pageSize);
    
    return {
      data,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  }

  /**
   * Execute aggregation query with optimization
   */
  async executeAggregationQuery(
    table: string,
    aggregations: {
      count?: string[];
      sum?: string[];
      avg?: string[];
      min?: string[];
      max?: string[];
    },
    options: QueryOptions = {},
    cacheKey?: string
  ): Promise<any> {
    const startTime = Date.now();
    
    if (!cacheKey) {
      cacheKey = this.generateCacheKey(`${table}_agg`, { ...options, aggregations });
    }
    
    const cachedResult = this.getFromCache(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    try {
      // Build aggregation select string
      const selectParts: string[] = [];
      
      if (aggregations.count) {
        aggregations.count.forEach(col => {
          selectParts.push(col === '*' ? 'count(*)' : `count(${col})`);
        });
      }
      
      if (aggregations.sum) {
        aggregations.sum.forEach(col => {
          selectParts.push(`sum(${col})`);
        });
      }
      
      if (aggregations.avg) {
        aggregations.avg.forEach(col => {
          selectParts.push(`avg(${col})`);
        });
      }
      
      if (aggregations.min) {
        aggregations.min.forEach(col => {
          selectParts.push(`min(${col})`);
        });
      }
      
      if (aggregations.max) {
        aggregations.max.forEach(col => {
          selectParts.push(`max(${col})`);
        });
      }
      
      const selectString = selectParts.join(', ');
      
      const result = await this.executeQuery(
        table,
        { ...options, select: selectString },
        undefined,
        this.DEFAULT_CACHE_TTL
      );
      
      const executionTime = Date.now() - startTime;
      logger.debug(`Aggregation query executed in ${executionTime}ms for table: ${table}`);
      
      this.setCache(cacheKey, result[0] || {}, this.DEFAULT_CACHE_TTL);
      
      return result[0] || {};
    } catch (error) {
      logger.error(`Aggregation query failed for table ${table}:`, error);
      throw error;
    }
  }

  /**
   * Execute join query with optimization
   */
  async executeJoinQuery<T>(
    baseTable: string,
    joins: {
      table: string;
      on: string;
      type?: 'inner' | 'left' | 'right';
      select?: string;
    }[],
    options: QueryOptions = {},
    cacheKey?: string
  ): Promise<T[]> {
    const startTime = Date.now();
    
    if (!cacheKey) {
      cacheKey = this.generateCacheKey(`${baseTable}_join`, { ...options, joins });
    }
    
    const cachedResult = this.getFromCache<T[]>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    try {
      // Build select string with joins
      let selectString = '*';
      
      if (options.select) {
        selectString = options.select;
      } else {
        // Build select with join tables
        const selectParts = ['*'];
        joins.forEach(join => {
          if (join.select) {
            selectParts.push(`${join.table}(${join.select})`);
          } else {
            selectParts.push(`${join.table}(*)`);
          }
        });
        selectString = selectParts.join(', ');
      }
      
      const result = await this.executeQuery<T>(
        baseTable,
        { ...options, select: selectString },
        cacheKey
      );
      
      const executionTime = Date.now() - startTime;
      logger.debug(`Join query executed in ${executionTime}ms for table: ${baseTable}`);
      
      return result;
    } catch (error) {
      logger.error(`Join query failed for table ${baseTable}:`, error);
      throw error;
    }
  }

  /**
   * Clear cache for specific key or all cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.queryCache.delete(key);
      logger.debug(`Cache cleared for key: ${key}`);
    } else {
      this.queryCache.clear();
      logger.debug('All cache cleared');
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    keys: string[];
  } {
    return {
      size: this.queryCache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: 0, // TODO: Implement hit rate tracking
      keys: Array.from(this.queryCache.keys())
    };
  }

  private generateCacheKey(table: string, options: any): string {
    return `${table}_${JSON.stringify(options)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.queryCache.get(key);
    
    if (!cached) {
      return null;
    }
    
    // Check if cache has expired
    if (Date.now() > cached.timestamp + cached.ttl) {
      this.queryCache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  private setCache(key: string, data: any, ttl: number): void {
    // Remove oldest entries if cache is full
    if (this.queryCache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.queryCache.keys().next().value;
      this.queryCache.delete(oldestKey);
    }
    
    this.queryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
}

export const queryOptimizer = new QueryOptimizer();
export default queryOptimizer;