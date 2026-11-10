/**
 * Project: MMA301 Assignment 2 - Integrated E-Commerce Mobile App
 * Tác giả: Lê Phước Nghĩa
 * MSSV: CE181020
 * Git Account: nghialpce181020-debug
 * Module / Requirement: R02, R05, R08 - Reusable Product Card Component
 * Ý nghĩa & Mục đích: Hiển thị thẻ sản phẩm gồm hình ảnh, tên, giá gốc, giá sau giảm, đánh giá sao, nút yêu thích nhanh và nút thêm vào giỏ hàng.
 */

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency, formatDiscountPrice } from '../utils/formatters';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

export const ProductCard = ({ product, onPress }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { sendWishlistNotification } = useNotification();

  const isFav = isInWishlist(product.id);

  const handleToggleFav = async () => {
    const res = await toggleWishlist(product);
    if (res?.added) {
      sendWishlistNotification(product);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.thumbnail || product.images?.[0] }}
          style={styles.image}
          resizeMode="contain"
        />
        {product.discountPercentage > 0 && (
          <View style={styles.badgeDiscount}>
            <Text style={styles.badgeDiscountText}>-{Math.round(product.discountPercentage)}%</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.favButton}
          onPress={handleToggleFav}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={20}
            color={isFav ? '#EF4444' : '#6B7280'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.category} numberOfLines={1}>
          {product.category?.toUpperCase()}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.ratingText}>{product.rating?.toFixed(1) || '4.5'}</Text>
          <Text style={styles.stockText}>
            {product.stock < 10 ? `Còn ${product.stock}` : 'Có sẵn'}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {formatDiscountPrice(product.price, product.discountPercentage)}
            </Text>
            {product.discountPercentage > 0 && (
              <Text style={styles.originalPrice}>{formatCurrency(product.price)}</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    margin: 6,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  imageContainer: {
    width: '100%',
    height: 130,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '90%',
    height: '90%',
  },
  badgeDiscount: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeDiscountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  favButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    marginTop: 8,
  },
  category: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 2,
    minHeight: 34,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
    marginLeft: 3,
  },
  stockText: {
    fontSize: 10,
    color: '#10B981',
    marginLeft: 'auto',
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  originalPrice: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  addButton: {
    backgroundColor: '#2563EB',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
