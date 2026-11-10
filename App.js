/**
 * Project: MMA301 Assignment 2 - Integrated E-Commerce Mobile App
 * Tác giả: Lê Phước Nghĩa
 * MSSV: CE181020
 * Git Account: nghialpce181020-debug
 * Module / Requirement: Root Application & Context Providers Entry
 * Ý nghĩa & Mục đích: Điểm khởi nhập chính của ứng dụng, bọc toàn bộ hệ thống bằng các Context Provider (Product, Cart, Wishlist, Notification) và AppNavigator.
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import { ProductProvider } from './src/context/ProductContext';
import { CartProvider } from './src/context/CartContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <NotificationProvider>
        <WishlistProvider>
          <CartProvider>
            <ProductProvider>
              <NavigationContainer>
                <StatusBar style="dark" />
                <AppNavigator />
              </NavigationContainer>
            </ProductProvider>
          </CartProvider>
        </WishlistProvider>
      </NotificationProvider>
    </SafeAreaProvider>
  );
}
