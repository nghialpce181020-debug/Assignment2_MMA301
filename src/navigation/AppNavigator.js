import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { ProductListScreen } from '../screens/ProductListScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { CartScreen } from '../screens/CartScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { AiAdvisorScreen } from '../screens/AiAdvisorScreen';
import { SettingsNotificationScreen } from '../screens/SettingsNotificationScreen';
import { useCart } from '../context/CartContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const { itemCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'CatalogTab') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'AiTab') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'CartTab') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'SavedTab') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return (
            <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={iconName} size={22} color={color} />
              {route.name === 'CartTab' && itemCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
                </View>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="CatalogTab"
        component={ProductListScreen}
        options={{ tabBarLabel: 'Sản phẩm' }}
      />
      <Tab.Screen
        name="AiTab"
        component={AiAdvisorScreen}
        options={{ tabBarLabel: 'AI Tư vấn' }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{ tabBarLabel: 'Giỏ hàng' }}
      />
      <Tab.Screen
        name="SavedTab"
        component={WishlistScreen}
        options={{ tabBarLabel: 'Yêu thích' }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsNotificationScreen}
        options={{ tabBarLabel: 'Cài đặt' }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
