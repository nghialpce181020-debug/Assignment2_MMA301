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
