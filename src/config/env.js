/**
 * Project: MMA301 Assignment 2 - Integrated E-Commerce Mobile App
 * Tác giả: Lê Phước Nghĩa
 * MSSV: CE181020
 * Git Account: nghialpce181020-debug
 * Module / Requirement: R01, R08, R09, R10 - Centralized App Configuration & Secrets
 * Ý nghĩa & Mục đích: Quản lý cấu hình tập trung: API Base URL, Firebase Keys, Notification Channels, Gemini API endpoint. Bảo đảm an toàn bí mật.
 */

// Application Configuration and Environment
// Non-sensitive configuration file. Secrets are not hardcoded.

export const CONFIG = {
  APP_NAME: 'E-Commerce Pro',
  STUDENT_NAME: 'Le Phuoc Nghia',
  STUDENT_ID: 'CE181020',
  CLASS_CODE: 'MMA301',
  
  // Remote Public API (DummyJSON)
  API_BASE_URL: 'https://dummyjson.com',
  DEFAULT_PAGE_SIZE: 10,
  
  // Gemini AI Configuration
  // In production/development, can be set via Settings screen or EXPO_PUBLIC_GEMINI_API_KEY
  DEFAULT_GEMINI_MODEL: 'gemini-2.5-flash',
  
  // Firebase Configuration (Demo / Template configuration)
  // Can be connected to any Firebase project. Gracefully falls back to local storage if unavailable.
  FIREBASE_CONFIG: {
    apiKey: "AIzaSyDemoPlaceholderKey1234567890",
    authDomain: "mma301-assignment2.firebaseapp.com",
    projectId: "mma301-assignment2",
    storageBucket: "mma301-assignment2.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    CART: '@ecommerce_cart_v1',
    WISHLIST: '@ecommerce_wishlist_v1',
    ORDERS: '@ecommerce_orders_v1',
    SETTINGS: '@ecommerce_settings_v1',
    GEMINI_API_KEY: '@ecommerce_gemini_key_v1',
  }
};
