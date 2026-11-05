import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { storageHelper } from '../utils/storageHelper';
import { CONFIG } from '../config/env';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Restore cart on startup (Persistence requirement R07)
  useEffect(() => {
    const restoreCart = async () => {
      try {
        const savedCart = await storageHelper.getItem(CONFIG.STORAGE_KEYS.CART, []);
        if (Array.isArray(savedCart)) {
          setItems(savedCart);
        }
      } catch (err) {
        console.error('[CartContext] Restore error:', err);
      } finally {
        setIsLoaded(true);
      }
    };
    restoreCart();
  }, []);

  // Save cart to persistent storage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;
    storageHelper.setItem(CONFIG.STORAGE_KEYS.CART, items);
  }, [items, isLoaded]);

  /**
   * Add a product to the cart
   */
  const addToCart = (product, quantity = 1) => {
    if (!product || !product.id) return;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product.id === product.id);

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIndex].quantity + quantity;
        const maxStock = product.stock || 999;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(newQty, maxStock),
        };
        return updated;
      } else {
        return [...prevItems, { id: product.id, product, quantity: Math.max(1, quantity) }];
      }
    });
  };

  /**
   * Update quantity of an item
   */
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product.id === productId) {
          const maxStock = item.product.stock || 999;
          return { ...item, quantity: Math.min(newQuantity, maxStock) };
        }
        return item;
      })
    );
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = (productId) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  /**
   * Clear all items from cart
   */
  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  /**
   * Apply coupon code
   */
  const applyCoupon = (code) => {
    const trimmed = (code || '').trim().toUpperCase();
    if (trimmed === 'MMA301') {
      setCoupon({ code: 'MMA301', discountRate: 0.2, description: 'Giảm 20% cho sinh viên MMA301' });
      return { success: true, message: 'Đã áp dụng mã MMA301 (-20%)' };
    } else if (trimmed === 'SAVE10') {
      setCoupon({ code: 'SAVE10', discountRate: 0.1, description: 'Giảm 10% đơn hàng' });
      return { success: true, message: 'Đã áp dụng mã SAVE10 (-10%)' };
    } else if (trimmed === 'FREESHIP') {
      setCoupon({ code: 'FREESHIP', discountRate: 0, freeShipping: true, description: 'Miễn phí vận chuyển' });
      return { success: true, message: 'Đã áp dụng miễn phí vận chuyển' };
    }
    return { success: false, message: 'Mã giảm giá không hợp lệ (Thử: MMA301, SAVE10, FREESHIP)' };
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  // Derived Totals (Requirement R06: compute selectors)
  const totals = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

    let discountAmount = 0;
    if (coupon?.discountRate) {
      discountAmount = subtotal * coupon.discountRate;
    }

    let shippingFee = subtotal > 0 ? (subtotal >= 50 || coupon?.freeShipping ? 0 : 4.99) : 0;
    const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

    return {
      itemCount,
      subtotal,
      discountAmount,
      shippingFee,
      finalTotal,
    };
  }, [items, coupon]);

  return (
    <CartContext.Provider
      value={{
        items,
        isLoaded,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        coupon,
        ...totals,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
