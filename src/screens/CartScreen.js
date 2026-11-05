import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { firebaseService } from '../services/firebaseService';
import { formatCurrency, formatDiscountPrice } from '../utils/formatters';
import { EmptyState } from '../components/EmptyState';

export const CartScreen = ({ navigation }) => {
  const {
    items,
    itemCount,
    subtotal,
    discountAmount,
    shippingFee,
    finalTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    coupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const { sendOrderNotification } = useNotification();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const handleApplyCoupon = () => {
    const res = applyCoupon(couponCode);
    setCouponMsg(res.message);
    if (res.success) {
      setCouponCode('');
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setIsCheckingOut(true);
    try {
      const orderId = `ORD-${Date.now().toString().slice(-6)}`;
      const orderData = {
        id: orderId,
        createdAt: new Date().toISOString(),
        items: items.map((i) => ({
          id: i.product.id,
          title: i.product.title,
          price: i.product.price,
          quantity: i.quantity,
          thumbnail: i.product.thumbnail,
        })),
        itemCount,
        subtotal,
        discount: discountAmount,
        shipping: shippingFee,
        total: finalTotal,
        status: 'Đã xác nhận',
      };

      // 1. Save order to Firebase / Cloud Store (Requirement R08)
      await firebaseService.saveOrder(orderData);

      // 2. Trigger business push notification (Requirement R09)
      await sendOrderNotification(orderData);

      // 3. Clear cart (Requirement R05/R07)
      clearCart();

      setCompletedOrder(orderData);
      setOrderModalVisible(true);
    } catch (e) {
      Alert.alert('Lỗi đặt hàng', e.message || 'Không thể hoàn tất đơn hàng.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const renderCartItem = ({ item }) => {
    const { product, quantity } = item;
    const unitPrice = product.discountPercentage > 0
      ? product.price * (1 - product.discountPercentage / 100)
      : product.price;

    return (
      <View style={styles.cartCard}>
        <Image
          source={{ uri: product.thumbnail || product.images?.[0] }}
          style={styles.cardImage}
          resizeMode="contain"
        />

        <View style={styles.cardInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {product.title}
          </Text>
          <Text style={styles.itemPrice}>{formatCurrency(unitPrice)}</Text>

          <View style={styles.quantityRow}>
            <View style={styles.qtyBox}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => {
                  if (quantity === 1) {
                    Alert.alert(
                      'Xóa sản phẩm',
                      `Bạn muốn xóa "${product.title}" khỏi giỏ hàng?`,
                      [
                        { text: 'Hủy', style: 'cancel' },
                        { text: 'Xóa', style: 'destructive', onPress: () => removeFromCart(product.id) },
                      ]
                    );
                  } else {
                    updateQuantity(product.id, quantity - 1);
                  }
                }}
              >
                <Ionicons
                  name={quantity === 1 ? 'trash-outline' : 'remove'}
                  size={16}
                  color={quantity === 1 ? '#EF4444' : '#374151'}
                />
              </TouchableOpacity>

              <Text style={styles.qtyText}>{quantity}</Text>

              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQuantity(product.id, quantity + 1)}
                disabled={quantity >= (product.stock || 999)}
              >
                <Ionicons name="add" size={16} color="#374151" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => removeFromCart(product.id)}
              style={styles.deleteButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giỏ hàng ({itemCount})</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={() => clearCart()}>
            <Text style={styles.clearText}>Xóa tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <EmptyState
          icon="cart-outline"
          title="Giỏ hàng trống"
          message="Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá và mua sắm ngay!"
          buttonText="Mua sắm ngay"
          onButtonPress={() => navigation.navigate('CatalogTab')}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => `cart-${item.product.id}`}
          renderItem={renderCartItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View style={styles.footerSection}>
              {/* Coupon Code Section */}
              <View style={styles.couponCard}>
                <View style={styles.couponInputRow}>
                  <Ionicons name="pricetag-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.couponInput}
                    placeholder="Nhập mã ưu đãi (MMA301, SAVE10)"
                    placeholderTextColor="#9CA3AF"
                    value={couponCode}
                    onChangeText={setCouponCode}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity style={styles.couponBtn} onPress={handleApplyCoupon}>
                    <Text style={styles.couponBtnText}>Áp dụng</Text>
                  </TouchableOpacity>
                </View>

                {couponMsg && <Text style={styles.couponNotice}>{couponMsg}</Text>}

                {coupon && (
                  <View style={styles.activeCouponBadge}>
                    <Text style={styles.activeCouponText}>
                      Đã áp dụng mã: {coupon.code} ({coupon.description})
                    </Text>
                    <TouchableOpacity onPress={removeCoupon}>
                      <Ionicons name="close-circle" size={16} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Price Summary Breakdown (Requirement R06: Derived totals) */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Tóm tắt đơn hàng</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tạm tính ({itemCount} món)</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
                  <Text style={[styles.summaryValue, shippingFee === 0 && styles.freeShippingText]}>
                    {shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}
                  </Text>
                </View>

                {discountAmount > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Giảm giá khuyến mãi</Text>
                    <Text style={styles.discountValue}>-{formatCurrency(discountAmount)}</Text>
                  </View>
                )}

                <View style={styles.divider} />

                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                  <Text style={styles.totalValue}>{formatCurrency(finalTotal)}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.checkoutBtn, isCheckingOut && styles.checkoutBtnDisabled]}
                  onPress={handleCheckout}
                  disabled={isCheckingOut}
                  activeOpacity={0.85}
                >
                  {isCheckingOut ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.checkoutBtnText}>Xác nhận đặt hàng</Text>
                      <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          }
        />
      )}

      {/* Order Success Modal */}
      <Modal visible={orderModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.successCard}>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark-sharp" size={40} color="#FFFFFF" />
            </View>

            <Text style={styles.successTitle}>Đặt hàng thành công!</Text>
            <Text style={styles.successSubtitle}>
              Mã đơn hàng: <Text style={{ fontWeight: '700' }}>#{completedOrder?.id}</Text>
            </Text>
            <Text style={styles.successDesc}>
              Thông tin đơn hàng đã được đồng bộ lên Firebase và gửi thông báo xác nhận đến bạn.
            </Text>

            <View style={styles.orderDetailBox}>
              <View style={styles.orderDetailRow}>
                <Text style={styles.detailLabel}>Tổng số món:</Text>
                <Text style={styles.detailVal}>{completedOrder?.itemCount} sản phẩm</Text>
              </View>
              <View style={styles.orderDetailRow}>
                <Text style={styles.detailLabel}>Tổng thanh toán:</Text>
                <Text style={[styles.detailVal, { color: '#2563EB', fontWeight: '700' }]}>
                  {formatCurrency(completedOrder?.total || 0)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                setOrderModalVisible(false);
                navigation.navigate('SavedTab');
              }}
            >
              <Text style={styles.doneBtnText}>Xem lịch sử đơn hàng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueShopBtn}
              onPress={() => {
                setOrderModalVisible(false);
                navigation.navigate('CatalogTab');
              }}
            >
              <Text style={styles.continueShopText}>Tiếp tục mua sắm</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  clearText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  cardImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
  },
  qtyBtn: {
    padding: 6,
    paddingHorizontal: 8,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 8,
    color: '#1F2937',
  },
  deleteButton: {
    padding: 6,
  },
  footerSection: {
    marginTop: 10,
  },
  couponCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  couponInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponInput: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
    paddingVertical: 4,
  },
  couponBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  couponBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  couponNotice: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 6,
  },
  activeCouponBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  activeCouponText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  freeShippingText: {
    color: '#10B981',
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563EB',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 16,
  },
  checkoutBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  checkoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  orderDetailBox: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  detailVal: {
    fontSize: 13,
    color: '#1F2937',
  },
  doneBtn: {
    backgroundColor: '#2563EB',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  continueShopBtn: {
    paddingVertical: 8,
  },
  continueShopText: {
    color: '#6B7280',
    fontSize: 13,
  },
});
