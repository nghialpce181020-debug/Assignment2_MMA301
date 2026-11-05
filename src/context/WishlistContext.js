import React, { createContext, useContext, useState, useEffect } from 'react';
import { firebaseService } from '../services/firebaseService';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Khởi tạo');
  const [lastSynced, setLastSynced] = useState(null);

  // Restore wishlist on startup from Firebase / Local Storage
  useEffect(() => {
    const loadWishlist = async () => {
      setIsSyncing(true);
      try {
        const result = await firebaseService.fetchWishlist();
        if (result.success && Array.isArray(result.data)) {
          setWishlist(result.data);
          setSyncStatus(result.source === 'firebase_cloud' ? 'Đã đồng bộ Firebase' : 'Lưu cục bộ');
          setLastSynced(new Date());
        }
      } catch (e) {
        console.error('[WishlistContext] Load error:', e);
        setSyncStatus('Lỗi tải dữ liệu');
      } finally {
        setIsSyncing(false);
      }
    };
    loadWishlist();
  }, []);

  const toggleWishlist = async (product) => {
    if (!product || !product.id) return;

    let updatedWishlist;
    const exists = wishlist.some((item) => item.id === product.id);

    if (exists) {
      updatedWishlist = wishlist.filter((item) => item.id !== product.id);
    } else {
      updatedWishlist = [product, ...wishlist];
    }

    setWishlist(updatedWishlist);

    // Sync to Firebase / Local
    setIsSyncing(true);
    try {
      const result = await firebaseService.syncWishlist('user_default', updatedWishlist);
      setSyncStatus(result.source === 'firebase_cloud' ? 'Đã đồng bộ Firebase' : 'Lưu cục bộ (Offline)');
      setLastSynced(new Date());
      return { added: !exists, success: true };
    } catch (err) {
      setSyncStatus('Lỗi đồng bộ');
      return { added: !exists, success: false };
    } finally {
      setIsSyncing(false);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const removeFromWishlist = async (productId) => {
    const updated = wishlist.filter((item) => item.id !== productId);
    setWishlist(updated);
    await firebaseService.syncWishlist('user_default', updated);
  };

  const manualSync = async () => {
    setIsSyncing(true);
    try {
      const result = await firebaseService.syncWishlist('user_default', wishlist);
      setSyncStatus(result.source === 'firebase_cloud' ? 'Đã đồng bộ Firebase Cloud' : 'Đã lưu thiết bị (Offline)');
      setLastSynced(new Date());
      return result;
    } catch (err) {
      setSyncStatus('Đồng bộ thất bại');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isSyncing,
        syncStatus,
        lastSynced,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        manualSync,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
