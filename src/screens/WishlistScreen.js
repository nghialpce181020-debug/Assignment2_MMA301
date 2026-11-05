import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { firebaseService } from '../services/firebaseService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { EmptyState } from '../components/EmptyState';

export const WishlistScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('wishlist'); // 'wishlist' | 'orders'
  const { wishlist, removeFromWishlist, isSyncing, syncStatus, lastSynced, manualSync } = useWishlist();
  const { addToCart } = useCart();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await firebaseService.fetchOrders();
      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'wishlist') {
      await manualSync();
    } else {
      await fetchOrders();
    }
    setRefreshing(false);
  };

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    Alert.alert('Thành công', `Đã chuyển "${product.title}" vào giỏ hàng.`);
  };

  const renderWishlistItem = ({ item }) => (
    <View style={styles.itemCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        style={styles.imageBox}
      >
        <Image
          source={{ uri: item.thumbnail || item.images?.[0] }}
          style={styles.productThumb}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <View style={styles.infoCol}>
        <Text style={styles.itemCategory}>{item.category?.toUpperCase()}</Text>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.cartActionBtn}
            onPress={() => handleMoveToCart(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.cartActionText}>Thêm giỏ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeActionBtn}
            onPress={() => removeFromWishlist(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderIdText}>Mã: #{item.id}</Text>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status || 'Đã xác nhận'}</Text>
        </View>
      </View>

      <View style={styles.orderProductsList}>
        {item.items?.map((p, idx) => (
          <View key={idx} style={styles.orderProductRow}>
            <Text style={styles.orderProductTitle} numberOfLines={1}>
              • {p.title} x{p.quantity}
            </Text>
            <Text style={styles.orderProductPrice}>
              {formatCurrency(p.price * p.quantity)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderTotalLabel}>Tổng thanh toán:</Text>
        <Text style={styles.orderTotalVal}>{formatCurrency(item.total)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header and Segmented Tabs */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đã lưu & Đơn hàng</Text>

        {/* Cloud Sync Status Indicator (Requirement R08) */}
        <View style={styles.syncStatusRow}>
          <Ionicons
            name="cloud-done-outline"
            size={14}
            color={syncStatus.includes('Firebase') ? '#10B981' : '#F59E0B'}
          />
          <Text style={styles.syncStatusText}>
            Trạng thái Cloud: {syncStatus}
          </Text>
          {isSyncing && <ActivityIndicator size="small" color="#2563EB" style={{ marginLeft: 6 }} />}
        </View>

        <View style={styles.segmentedTabContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'wishlist' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('wishlist')}
          >
            <Ionicons
              name={activeTab === 'wishlist' ? 'heart' : 'heart-outline'}
              size={16}
              color={activeTab === 'wishlist' ? '#2563EB' : '#6B7280'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.segmentText, activeTab === 'wishlist' && styles.segmentTextActive]}>
              Yêu thích ({wishlist.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'orders' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('orders')}
          >
            <Ionicons
              name={activeTab === 'orders' ? 'receipt' : 'receipt-outline'}
              size={16}
              color={activeTab === 'orders' ? '#2563EB' : '#6B7280'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.segmentText, activeTab === 'orders' && styles.segmentTextActive]}>
              Lịch sử đơn ({orders.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      {activeTab === 'wishlist' ? (
        wishlist.length === 0 ? (
          <EmptyState
            icon="heart-outline"
            title="Chưa có sản phẩm yêu thích"
            message="Hãy nhấn vào biểu tượng trái tim ở các sản phẩm để lưu lại tại đây."
            buttonText="Khám phá ngay"
            onButtonPress={() => navigation.navigate('CatalogTab')}
          />
        ) : (
          <FlatList
            data={wishlist}
            keyExtractor={(item) => `fav-${item.id}`}
            renderItem={renderWishlistItem}
            contentContainerStyle={styles.listPadding}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
          />
        )
      ) : loadingOrders && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Đang tải lịch sử đơn hàng...</Text>
        </View>
      ) : orders.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="Chưa có đơn hàng nào"
          message="Bạn chưa đặt đơn hàng nào. Các đơn mua hàng sẽ được lưu trữ và hiển thị tại đây."
          buttonText="Bắt đầu mua hàng"
          onButtonPress={() => navigation.navigate('CatalogTab')}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => `order-${item.id}`}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listPadding}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  syncStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  syncStatusText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  segmentedTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  listPadding: {
    padding: 16,
    paddingBottom: 40,
  },
  itemCard: {
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
  imageBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productThumb: {
    width: '90%',
    height: '90%',
  },
  infoCol: {
    flex: 1,
  },
  itemCategory: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 2,
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cartActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  removeActionBtn: {
    padding: 6,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
  },
  orderIdText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  orderDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
  },
  orderProductsList: {
    marginBottom: 10,
  },
  orderProductRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  orderProductTitle: {
    fontSize: 13,
    color: '#4B5563',
    flex: 1,
    marginRight: 8,
  },
  orderProductPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  orderTotalLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  orderTotalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
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
});
