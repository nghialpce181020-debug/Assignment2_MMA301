/**
 * Project: MMA301 Assignment 2 - Integrated E-Commerce Mobile App
 * Tác giả: Lê Phước Nghĩa
 * MSSV: CE181020
 * Git Account: nghialpce181020-debug
 * Module / Requirement: R01, R02, R03 - Product Catalog Screen
 * Ý nghĩa & Mục đích: Màn hình danh mục sản phẩm với thanh tìm kiếm, bộ lọc chip danh mục, FlatList phân trang vô hạn kèm cờ guard chống tải lặp.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/ProductCard';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';

export const ProductListScreen = ({ navigation }) => {
  const {
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
  } = useProducts();

  const [sortModalVisible, setSortModalVisible] = useState(false);

  const handleSelectSort = (newSortBy, newOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newOrder);
    setSortModalVisible(false);
  };

  const renderProductItem = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    />
  );

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={styles.footerLoaderText}>Đang tải thêm sản phẩm...</Text>
        </View>
      );
    }
    if (!hasMore && products.length > 0) {
      return (
        <View style={styles.footerEnd}>
          <Text style={styles.footerEndText}>— Bạn đã xem hết sản phẩm —</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Search and Sort Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm, thương hiệu..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.sortButton, sortBy && styles.sortButtonActive]}
          onPress={() => setSortModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="filter-outline" size={20} color={sortBy ? '#FFFFFF' : '#374151'} />
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.slug}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.slug;
            return (
              <TouchableOpacity
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(item.slug)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.categoryText, isSelected && styles.categoryTextActive]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Active Filter Chips */}
      {sortBy && (
        <View style={styles.filterBar}>
          <Text style={styles.filterBarLabel}>
            Sắp xếp: {sortBy === 'price' ? (sortOrder === 'asc' ? 'Giá tăng dần' : 'Giá giảm dần') : 'Đánh giá'}
          </Text>
          <TouchableOpacity onPress={() => handleSelectSort(null, 'asc')}>
            <Ionicons name="close" size={16} color="#4B5563" />
          </TouchableOpacity>
        </View>
      )}

      {/* Content Area */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Đang tải danh mục sản phẩm...</Text>
        </View>
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadProducts(false)} />
      ) : products.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="Không tìm thấy sản phẩm"
          message="Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác."
          buttonText="Xóa bộ lọc"
          onButtonPress={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setSortBy(null);
          }}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => `prod-${item.id}`}
          renderItem={renderProductItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadProducts(true)}
              colors={['#2563EB']}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}

      {/* Sort Options Modal */}
      <Modal visible={sortModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setSortModalVisible(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sắp xếp theo</Text>
              <TouchableOpacity onPress={() => setSortModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSelectSort(null, 'asc')}
            >
              <Text style={[styles.modalOptionText, !sortBy && styles.modalOptionTextSelected]}>
                Mặc định
              </Text>
              {!sortBy && <Ionicons name="checkmark" size={20} color="#2563EB" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSelectSort('price', 'asc')}
            >
              <Text style={[styles.modalOptionText, sortBy === 'price' && sortOrder === 'asc' && styles.modalOptionTextSelected]}>
                Giá: Thấp đến Cao
              </Text>
              {sortBy === 'price' && sortOrder === 'asc' && (
                <Ionicons name="checkmark" size={20} color="#2563EB" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSelectSort('price', 'desc')}
            >
              <Text style={[styles.modalOptionText, sortBy === 'price' && sortOrder === 'desc' && styles.modalOptionTextSelected]}>
                Giá: Cao đến Thấp
              </Text>
              {sortBy === 'price' && sortOrder === 'desc' && (
                <Ionicons name="checkmark" size={20} color="#2563EB" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSelectSort('rating', 'desc')}
            >
              <Text style={[styles.modalOptionText, sortBy === 'rating' && styles.modalOptionTextSelected]}>
                Đánh giá cao nhất
              </Text>
              {sortBy === 'rating' && <Ionicons name="checkmark" size={20} color="#2563EB" />}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    paddingVertical: 0,
  },
  sortButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sortButtonActive: {
    backgroundColor: '#2563EB',
  },
  categoryContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryList: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 6,
  },
  categoryPillActive: {
    backgroundColor: '#2563EB',
  },
  categoryText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  filterBarLabel: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    padding: 10,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerLoaderText: {
    fontSize: 13,
    color: '#6B7280',
  },
  footerEnd: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerEndText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  modalOptionText: {
    fontSize: 15,
    color: '#374151',
  },
  modalOptionTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
});
