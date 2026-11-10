/**
 * Project: MMA301 Assignment 2 - Integrated E-Commerce Mobile App
 * Tác giả: Lê Phước Nghĩa
 * MSSV: CE181020
 * Git Account: nghialpce181020-debug
 * Module / Requirement: R01, R02, R03, R04 - Remote Product Service
 * Ý nghĩa & Mục đích: Gọi DummyJSON REST API qua Axios: phân trang (limit/skip), lọc theo danh mục, tìm kiếm và lấy chi tiết sản phẩm.
 */

import axios from 'axios';
import { CONFIG } from '../config/env.js';

const apiClient = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productService = {
  /**
   * Fetch products with pagination, category filter and sorting
   * @param {Object} params
   * @param {number} params.limit
   * @param {number} params.skip
   * @param {string} [params.category]
   * @param {string} [params.sortBy]
   * @param {'asc'|'desc'} [params.order]
   */
  async getProducts({ limit = CONFIG.DEFAULT_PAGE_SIZE, skip = 0, category = null, sortBy = null, order = 'asc' } = {}) {
    try {
      let endpoint = '/products';
      const params = { limit, skip };

      if (category && category !== 'all') {
        endpoint = `/products/category/${encodeURIComponent(category)}`;
      }

      if (sortBy) {
        params.sortBy = sortBy;
        params.order = order;
      }

      const response = await apiClient.get(endpoint, { params });
      const products = response.data.products || [];
      const total = response.data.total || 0;
      const hasMore = skip + products.length < total;

      return {
        products,
        total,
        skip,
        limit,
        hasMore,
        error: null,
      };
    } catch (error) {
      console.error('[productService.getProducts] Error:', error.message);
      return {
        products: [],
        total: 0,
        skip,
        limit,
        hasMore: false,
        error: error.message || 'Không thể tải danh sách sản phẩm',
      };
    }
  },

  /**
   * Search products by text query
   * @param {Object} params
   * @param {string} params.query
   * @param {number} params.limit
   * @param {number} params.skip
   */
  async searchProducts({ query, limit = CONFIG.DEFAULT_PAGE_SIZE, skip = 0 }) {
    try {
      if (!query || query.trim() === '') {
        return this.getProducts({ limit, skip });
      }

      const response = await apiClient.get('/products/search', {
        params: {
          q: query.trim(),
          limit,
          skip,
        },
      });

      const products = response.data.products || [];
      const total = response.data.total || 0;
      const hasMore = skip + products.length < total;

      return {
        products,
        total,
        skip,
        limit,
        hasMore,
        error: null,
      };
    } catch (error) {
      console.error('[productService.searchProducts] Error:', error.message);
      return {
        products: [],
        total: 0,
        skip,
        limit,
        hasMore: false,
        error: error.message || 'Lỗi khi tìm kiếm sản phẩm',
      };
    }
  },

  /**
   * Fetch a single product by ID
   * @param {number|string} id
   */
  async getProductById(id) {
    try {
      if (!id) {
        return { product: null, error: 'Mã sản phẩm không hợp lệ' };
      }
      const response = await apiClient.get(`/products/${id}`);
      return {
        product: response.data,
        error: null,
      };
    } catch (error) {
      console.error(`[productService.getProductById] Error for id ${id}:`, error.message);
      return {
        product: null,
        error: error.response?.status === 404 ? 'Không tìm thấy sản phẩm' : error.message || 'Lỗi tải chi tiết',
      };
    }
  },

  /**
   * Fetch all product categories
   */
  async getCategories() {
    try {
      const response = await apiClient.get('/products/categories');
      const rawCategories = response.data || [];
      
      // Normalize to [{ slug, name }]
      const categories = [
        { slug: 'all', name: 'Tất cả' },
        ...rawCategories.map((cat) => {
          if (typeof cat === 'string') {
            return { slug: cat, name: cat.charAt(0).toUpperCase() + cat.slice(1) };
          }
          return { slug: cat.slug, name: cat.name };
        }),
      ];

      return { categories, error: null };
    } catch (error) {
      console.error('[productService.getCategories] Error:', error.message);
      return {
        categories: [{ slug: 'all', name: 'Tất cả' }],
        error: error.message,
      };
    }
  },
};
