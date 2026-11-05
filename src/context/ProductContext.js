import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';
import { CONFIG } from '../config/env';

const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ slug: 'all', name: 'Tất cả' }]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState(null); // 'price' | 'rating' | 'discountPercentage'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // Load categories on initial load
  useEffect(() => {
    const fetchCats = async () => {
      const res = await productService.getCategories();
      if (res.categories && res.categories.length > 0) {
        setCategories(res.categories);
      }
    };
    fetchCats();
  }, []);

  // Fetch initial products
  const loadProducts = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      let result;
      if (searchQuery.trim()) {
        result = await productService.searchProducts({
          query: searchQuery,
          limit: CONFIG.DEFAULT_PAGE_SIZE,
          skip: 0,
        });
      } else {
        result = await productService.getProducts({
          limit: CONFIG.DEFAULT_PAGE_SIZE,
          skip: 0,
          category: selectedCategory === 'all' ? null : selectedCategory,
          sortBy,
          order: sortOrder,
        });
      }

      if (result.error) {
        setError(result.error);
        setProducts([]);
        setHasMore(false);
      } else {
        setProducts(result.products || []);
        setHasMore(result.hasMore);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedCategory, sortBy, sortOrder]);

  // Load next page (Infinite pagination with duplicate request guard)
  const loadMore = useCallback(async () => {
    // Guards: do not load if already loading, no more data, or initial load is in progress
    if (loading || loadingMore || !hasMore || refreshing) return;

    setLoadingMore(true);
    try {
      let result;
      const skip = products.length;

      if (searchQuery.trim()) {
        result = await productService.searchProducts({
          query: searchQuery,
          limit: CONFIG.DEFAULT_PAGE_SIZE,
          skip,
        });
      } else {
        result = await productService.getProducts({
          limit: CONFIG.DEFAULT_PAGE_SIZE,
          skip,
          category: selectedCategory === 'all' ? null : selectedCategory,
          sortBy,
          order: sortOrder,
        });
      }

      if (result.products && result.products.length > 0) {
        // Prevent duplicate products by id
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newUnique = result.products.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newUnique];
        });
        setHasMore(result.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('[ProductContext.loadMore] Error:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, refreshing, products.length, searchQuery, selectedCategory, sortBy, sortOrder]);

  // Trigger load when filters change
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        loading,
        refreshing,
        loadingMore,
        hasMore,
        error,
        loadProducts,
        loadMore,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
