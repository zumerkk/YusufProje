import { Request, Response } from 'express';
import { supabase } from './config/supabase';
import { logger } from './utils/logger';

// Tüm mevcut paketleri getir (genel endpoint)
export const getAllPackages = async (req: Request, res: Response) => {
  try {
    const { 
      category, 
      difficulty_level, 
      min_price, 
      max_price, 
      is_popular, 
      is_premium,
      search,
      limit = 20, 
      offset = 0,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    logger.info('Fetching all packages', { 
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    let query = supabase
      .from('packages')
      .select(`
        *,
        package_categories (
          id,
          name,
          icon,
          color
        )
      `)
      .eq('is_active', true)
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    // Filtreleme
    if (category) {
      query = query.eq('category_id', category);
    }
    if (difficulty_level) {
      query = query.eq('difficulty_level', difficulty_level);
    }
    if (min_price) {
      query = query.gte('price', Number(min_price));
    }
    if (max_price) {
      query = query.lte('price', Number(max_price));
    }
    if (is_popular !== undefined) {
      query = query.eq('is_popular', is_popular === 'true');
    }
    if (is_premium !== undefined) {
      query = query.eq('is_premium', is_premium === 'true');
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sıralama
    const ascending = sort_order === 'asc';
    if (sort_by === 'price') {
      query = query.order('price', { ascending });
    } else if (sort_by === 'popularity') {
      query = query.order('is_popular', { ascending: false }).order('created_at', { ascending });
    } else {
      query = query.order(sort_by as string, { ascending });
    }

    const { data: packages, error } = await query;

    if (error) {
      logger.error('Error fetching packages:', { error: error.message, query: req.query });
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch packages',
        error: error.message 
      });
    }

    // Toplam sayıyı al
    let countQuery = supabase
      .from('packages')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Aynı filtreleri count query'ye de uygula
    if (category) {
      countQuery = countQuery.eq('category_id', category);
    }
    if (difficulty_level) {
      countQuery = countQuery.eq('difficulty_level', difficulty_level);
    }
    if (min_price) {
      countQuery = countQuery.gte('price', Number(min_price));
    }
    if (max_price) {
      countQuery = countQuery.lte('price', Number(max_price));
    }
    if (is_popular !== undefined) {
      countQuery = countQuery.eq('is_popular', is_popular === 'true');
    }
    if (is_premium !== undefined) {
      countQuery = countQuery.eq('is_premium', is_premium === 'true');
    }
    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      logger.warn('Error getting packages count:', { error: countError.message });
    }

    logger.info('Packages fetched successfully', { 
      count: packages?.length || 0,
      total: count || 0,
      query: req.query
    });

    return res.status(200).json({
      success: true,
      data: packages || [],
      pagination: {
        total: count || 0,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: (Number(offset) + Number(limit)) < (count || 0)
      }
    });

  } catch (error) {
    logger.error('Error in getAllPackages:', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      query: req.query
    });
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Paket detayını getir
export const getPackageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Package ID is required' 
      });
    }

    logger.info('Fetching package by ID', { packageId: id });

    const { data: packageData, error } = await supabase
      .from('packages')
      .select(`
        *,
        package_categories (
          id,
          name,
          icon,
          color
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false, 
          message: 'Package not found' 
        });
      }
      logger.error('Error fetching package by ID:', { error: error.message, packageId: id });
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch package',
        error: error.message 
      });
    }

    logger.info('Package fetched successfully', { packageId: id });

    return res.status(200).json({
      success: true,
      data: packageData
    });

  } catch (error) {
    logger.error('Error in getPackageById:', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      packageId: req.params.id
    });
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};