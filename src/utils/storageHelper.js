/**
 * Project: MMA301 Assignment 2 - Integrated E-Commerce Mobile App
 * Tác giả: Lê Phước Nghĩa
 * MSSV: CE181020
 * Git Account: nghialpce181020-debug
 * Module / Requirement: R07 - Local Persistence Helper (AsyncStorage)
 * Ý nghĩa & Mục đích: Wrapper an toàn cho AsyncStorage với try/catch và JSON parse guard, phục vụ lưu trữ giỏ hàng, danh sách yêu thích và cài đặt offline.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Helper utility for AsyncStorage
 * Handles JSON parsing/stringifying and error management gracefully.
 */
export const storageHelper = {
  /**
   * Save item to storage
   * @param {string} key
   * @param {any} value
   */
  async setItem(key, value) {
    try {
      const stringValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
      return true;
    } catch (error) {
      console.error(`[StorageHelper] Error writing key "${key}":`, error);
      return false;
    }
  },

  /**
   * Get item from storage
   * @param {string} key
   * @param {any} defaultValue
   */
  async getItem(key, defaultValue = null) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return defaultValue;
      return JSON.parse(value);
    } catch (error) {
      console.error(`[StorageHelper] Error reading key "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Remove item from storage
   * @param {string} key
   */
  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`[StorageHelper] Error removing key "${key}":`, error);
      return false;
    }
  },

  /**
   * Clear all app storage
   */
  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('[StorageHelper] Error clearing storage:', error);
      return false;
    }
  }
};
