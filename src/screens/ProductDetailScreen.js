/**
 * Project: MMA301 Assignment 2 - Integrated E-Commerce Mobile App
 * Tác giả: Lê Phước Nghĩa
 * MSSV: CE181020
 * Git Account: nghialpce181020-debug
 * Module / Requirement: R04, R05, R08 - Product Detail Screen
 * Ý nghĩa & Mục đích: Màn hình chi tiết sản phẩm: xem ảnh, thông số kỹ thuật, đánh giá khách hàng, chọn số lượng kiểm tra tồn kho và thêm vào giỏ.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../services/productService';
import { formatCurrency, formatDiscountPrice } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNotification } from '../context/NotificationContext';
import { ErrorState } from '../components/ErrorState';

export const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params || {};

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { sendWishlistNotification } = useNotification();

  useEffect(() => {
    // Handle invalid / missing ID (Requirement R04)
    if (!productId) {
      setError('Mã sản phẩm không tồn tại hoặc không hợp lệ.');
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      const res = await productService.getProductById(productId);
      if (res.error || !res.product) {
        setError(res.error || 'Không tìm thấy sản phẩm này');
      } else {
        setProduct(res.product);
        setSelectedImage(res.product.thumbnail || res.product.images?.[0]);
      }
      setLoading(false);
    };

    fetchDetail();
  }, [productId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Đang tải thông tin sản phẩm...</Text>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Chi tiết sản phẩm</Text>
          <View style={{ width: 40 }} />
        </View>
        <ErrorState
          title="Không thể hiển thị sản phẩm"
          message={error || 'Sản phẩm đã bị xóa hoặc liên kết không hợp lệ.'}
          onRetry={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const isFav = isInWishlist(product.id);
  const maxStock = product.stock || 99;

  const handleToggleFav = async () => {
    const res = await toggleWishlist(product);
    if (res?.added) {
      sendWishlistNotification(product);
      Alert.alert('Yêu thích', `Đã thêm "${product.title}" vào danh sách yêu thích.`);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    Alert.alert('Thành công', `Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, [
      { text: 'Tiếp tục xem', style: 'cancel' },
      { text: 'Đến giỏ hàng', onPress: () => navigation.navigate('CartTab') },
    ]);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigation.navigate('CartTab');
  };

  const handleAskAI = () => {
    navigation.navigate('AiTab', {
      initialQuery: `Tôi muốn tìm sản phẩm tương tự hoặc tư vấn thêm về: ${product.title}`,
      referenceProduct: product,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {product.title}
        </Text>
        <TouchableOpacity onPress={handleToggleFav} style={styles.favNavButton}>
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={24}
            color={isFav ? '#EF4444' : '#1F2937'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Image Display */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: selectedImage || product.thumbnail }}
            style={styles.mainImage}
            resizeMode="contain"
          />
          {product.discountPercentage > 0 && (
            <View style={styles.discountTag}>
              <Text style={styles.discountTagText}>Giảm {Math.round(product.discountPercentage)}%</Text>
            </View>
          )}
        </View>

        {/* Thumbnail Selector */}
        {product.images && product.images.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbStrip}>
            {product.images.map((imgUrl, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedImage(imgUrl)}
                style={[styles.thumbItem, selectedImage === imgUrl && styles.thumbItemSelected]}
              >
                <Image source={{ uri: imgUrl }} style={styles.thumbImage} resizeMode="contain" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Details Section */}
        <View style={styles.infoSection}>
          <View style={styles.categoryBrandRow}>
            <Text style={styles.brandText}>{product.brand || 'Chính hãng'}</Text>
            <Text style={styles.categoryDot}>•</Text>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>

          <Text style={styles.productTitle}>{product.title}</Text>

          {/* Rating and Stock */}
          <View style={styles.metaRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingValue}>{product.rating?.toFixed(1)}</Text>
              <Text style={styles.reviewsCount}>({product.reviews?.length || 0} đánh giá)</Text>
            </View>

            <View style={[styles.stockBadge, product.stock > 0 ? styles.stockIn : styles.stockOut]}>
              <Text style={[styles.stockBadgeText, product.stock > 0 ? styles.stockInText : styles.stockOutText]}>
                {product.stock > 0 ? `Còn hàng (${product.stock})` : 'Hết hàng'}
              </Text>
            </View>
          </View>

          {/* Price Box */}
          <View style={styles.priceBox}>
            <Text style={styles.currentPrice}>
              {formatDiscountPrice(product.price, product.discountPercentage)}
            </Text>
            {product.discountPercentage > 0 && (
              <Text style={styles.oldPrice}>{formatCurrency(product.price)}</Text>
            )}
            <Text style={styles.taxNote}>(Đã bao gồm VAT)</Text>
          </View>

          {/* Gemini AI Entry Banner */}
          <TouchableOpacity style={styles.aiBanner} onPress={handleAskAI} activeOpacity={0.85}>
            <View style={styles.aiIconBadge}>
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.aiBannerTextCol}>
              <Text style={styles.aiBannerTitle}>Hỏi Gemini AI về sản phẩm này</Text>
              <Text style={styles.aiBannerSubtitle}>Tư vấn tính năng, so sánh giá hoặc tìm sản phẩm tương tự</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#2563EB" />
          </TouchableOpacity>

          {/* Description */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>Mô tả sản phẩm</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>

          {/* Specifications Table */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>Thông số & Chính sách</Text>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Mã SKU</Text>
              <Text style={styles.specValue}>{product.sku || 'N/A'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Bảo hành</Text>
              <Text style={styles.specValue}>{product.warrantyInformation || '12 tháng chính hãng'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Vận chuyển</Text>
              <Text style={styles.specValue}>{product.shippingInformation || 'Giao hàng tiêu chuẩn 2-4 ngày'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Đổi trả</Text>
              <Text style={styles.specValue}>{product.returnPolicy || 'Đổi trả miễn phí 7 ngày'}</Text>
            </View>
          </View>

          {/* Customer Reviews Preview */}
          {product.reviews && product.reviews.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Đánh giá thực tế từ người dùng</Text>
              {product.reviews.map((rev, i) => (
                <View key={i} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{rev.reviewerName}</Text>
                    <View style={styles.starRow}>
                      {[...Array(rev.rating || 5)].map((_, s) => (
                        <Ionicons key={s} name="star" size={12} color="#F59E0B" />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>"{rev.comment}"</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            <Ionicons name="remove" size={18} color={quantity <= 1 ? '#D1D5DB' : '#374151'} />
          </TouchableOpacity>
          <Text style={styles.qtyDisplay}>{quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity((q) => Math.min(maxStock, q + 1))}
            disabled={quantity >= maxStock}
          >
            <Ionicons name="add" size={18} color={quantity >= maxStock ? '#D1D5DB' : '#374151'} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={handleAddToCart}
          activeOpacity={0.8}
        >
          <Ionicons name="cart-outline" size={18} color="#2563EB" style={{ marginRight: 4 }} />
          <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyNowBtn}
          onPress={handleBuyNow}
          activeOpacity={0.8}
        >
          <Text style={styles.buyNowText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  navTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  favNavButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageWrapper: {
    width: '100%',
    height: 280,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mainImage: {
    width: '85%',
    height: '85%',
  },
  discountTag: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountTagText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  thumbStrip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  thumbItem: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  thumbItemSelected: {
    borderColor: '#2563EB',
  },
  thumbImage: {
    width: '80%',
    height: '80%',
  },
  infoSection: {
    padding: 16,
  },
  categoryBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
  },
  categoryDot: {
    marginHorizontal: 6,
    color: '#9CA3AF',
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 26,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginLeft: 4,
  },
  reviewsCount: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockIn: {
    backgroundColor: '#D1FAE5',
  },
  stockOut: {
    backgroundColor: '#FEE2E2',
  },
  stockBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  stockInText: {
    color: '#065F46',
  },
  stockOutText: {
    color: '#991B1B',
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 14,
  },
  currentPrice: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2563EB',
    marginRight: 10,
  },
  oldPrice: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  taxNote: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  aiIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiBannerTextCol: {
    flex: 1,
  },
  aiBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
  },
  aiBannerSubtitle: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 2,
  },
  sectionBlock: {
    marginTop: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  specLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  specValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  reviewItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  starRow: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 12,
    color: '#4B5563',
    fontStyle: 'italic',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 6,
    height: 40,
    marginRight: 10,
  },
  qtyBtn: {
    padding: 4,
  },
  qtyDisplay: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    paddingHorizontal: 8,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    height: 44,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  addToCartText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  buyNowBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    height: 44,
  },
  buyNowText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
