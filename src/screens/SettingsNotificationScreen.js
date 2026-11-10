/**
 * Project: MMA301 Assignment 2 - Integrated E-Commerce Mobile App
 * Tác giả: Lê Phước Nghĩa
 * MSSV: CE181020
 * Git Account: nghialpce181020-debug
 * Module / Requirement: R09, R10 - System Settings & Notification Permission Screen
 * Ý nghĩa & Mục đích: Màn hình cài đặt quyền thông báo hệ thống OS, nút thử nghiệm thông báo và giao diện nhập API Key an toàn cho Gemini AI.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '../context/NotificationContext';
import { aiService } from '../services/aiService';
import { firebaseService } from '../services/firebaseService';
import { CONFIG } from '../config/env';

export const SettingsNotificationScreen = () => {
  const { permissionGranted, permissionStatus, requestPermission, sendTestNotification } =
    useNotification();

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [currentKeyMasked, setCurrentKeyMasked] = useState('');
  const [testingNotification, setTestingNotification] = useState(false);

  useEffect(() => {
    const loadKey = async () => {
      const key = await aiService.getApiKey();
      if (key) {
        setCurrentKeyMasked(key.length > 8 ? `${key.slice(0, 4)}...${key.slice(-4)}` : 'Đã cấu hình');
      } else {
        setCurrentKeyMasked('Chưa cấu hình (Đang chạy chế độ thông minh dự phòng)');
      }
    };
    loadKey();
  }, []);

  const handleRequestPermission = async () => {
    const res = await requestPermission();
    if (res.granted) {
      Alert.alert('Thành công', 'Quyền nhận thông báo đã được cấp!');
    } else {
      Alert.alert(
        'Quyền bị từ chối',
        'Ứng dụng vẫn hoạt động bình thường, nhưng bạn sẽ không nhận được thông báo trạng thái đơn hàng từ hệ thống.'
      );
    }
  };

  const handleTestNotification = async () => {
    setTestingNotification(true);
    const res = await sendTestNotification();
    setTestingNotification(false);

    if (res.success) {
      Alert.alert('Thành công', 'Đã kích hoạt thông báo kiểm thử (Push Notification)!');
    } else if (res.reason === 'permission_denied') {
      Alert.alert(
        'Chưa cấp quyền',
        'Vui lòng nhấn nút "Cấp quyền thông báo" trước khi kiểm thử.'
      );
    } else {
      Alert.alert('Lỗi', res.error || 'Không thể gửi thông báo');
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập khóa API Gemini');
      return;
    }
    await aiService.setApiKey(apiKeyInput.trim());
    setCurrentKeyMasked(`${apiKeyInput.slice(0, 4)}...${apiKeyInput.slice(-4)}`);
    setApiKeyInput('');
    Alert.alert('Thành công', 'Đã lưu Gemini API Key an toàn trong thiết bị.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cài đặt & Tích hợp hệ thống</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section 1: Notification Management (Requirement R09) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="notifications" size={20} color="#2563EB" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.cardTitle}>Thông báo hệ thống (Push & Local)</Text>
              <Text style={styles.cardSubtitle}>Chứng minh permission flow & business event</Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.label}>Trạng thái quyền OS:</Text>
            <View
              style={[
                styles.statusPill,
                permissionGranted ? styles.statusPillSuccess : styles.statusPillWarning,
              ]}
            >
              <Ionicons
                name={permissionGranted ? 'checkmark-circle' : 'alert-circle'}
                size={14}
                color={permissionGranted ? '#065F46' : '#92400E'}
              />
              <Text
                style={[
                  styles.statusPillText,
                  permissionGranted ? styles.statusPillSuccessText : styles.statusPillWarningText,
                ]}
              >
                {permissionGranted ? 'ĐÃ CẤP QUYỀN' : `TỪ CHỐI / CHƯA CẤP (${permissionStatus})`}
              </Text>
            </View>
          </View>

          <View style={styles.btnRow}>
            {!permissionGranted && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleRequestPermission}
                activeOpacity={0.8}
              >
                <Text style={styles.actionBtnText}>Cấp quyền thông báo</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.testBtn, testingNotification && styles.testBtnDisabled]}
              onPress={handleTestNotification}
              disabled={testingNotification}
              activeOpacity={0.8}
            >
              <Ionicons name="paper-plane-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.testBtnText}>Thử gửi thông báo ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 2: Firebase Integration (Requirement R08) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="flame" size={20} color="#D97706" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.cardTitle}>Dịch vụ Cloud / Firebase</Text>
              <Text style={styles.cardSubtitle}>Lưu trữ Wishlist & Lịch sử đơn hàng</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Chế độ đồng bộ:</Text>
            <Text style={styles.valueHighlight}>
              {firebaseService.isInitialized()
                ? 'Firebase Firestore / Realtime DB'
                : 'Hybrid Persistent Storage (Offline Resilient)'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Project ID:</Text>
            <Text style={styles.value}>{CONFIG.FIREBASE_CONFIG.projectId}</Text>
          </View>

          <Text style={styles.noteBox}>
            Dịch vụ được thiết kế theo nguyên tắc chống đổ vỡ: khi mất mạng hoặc không có API key thật,
            dữ liệu tự động lưu trữ cục bộ bảo đảm 100% không làm crash ứng dụng.
          </Text>
        </View>

        {/* Section 3: Gemini AI Configuration (Requirement R10) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="sparkles" size={20} color="#7C3AED" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.cardTitle}>Gemini AI Integration</Text>
              <Text style={styles.cardSubtitle}>Cấu hình API Key & Mô hình</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Mô hình:</Text>
            <Text style={styles.valueHighlight}>{CONFIG.DEFAULT_GEMINI_MODEL}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Khóa API hiện tại:</Text>
            <Text style={styles.value}>{currentKeyMasked}</Text>
          </View>

          <View style={styles.inputKeyRow}>
            <TextInput
              style={styles.keyInput}
              placeholder="Nhập khóa API Gemini mới (AIza...)"
              placeholderTextColor="#9CA3AF"
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              secureTextEntry
            />
            <TouchableOpacity style={styles.saveKeyBtn} onPress={handleSaveApiKey}>
              <Text style={styles.saveKeyBtnText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 4: Project & Release Evidence (Requirement R12) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="information-circle" size={20} color="#374151" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.cardTitle}>Thông tin đồ án & Release</Text>
              <Text style={styles.cardSubtitle}>Hồ sơ đánh giá Assignment 02</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Sinh viên thực hiện:</Text>
            <Text style={styles.value}>{CONFIG.STUDENT_NAME}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Mã số sinh viên:</Text>
            <Text style={styles.value}>{CONFIG.STUDENT_ID}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Mã môn học:</Text>
            <Text style={styles.value}>{CONFIG.CLASS_CODE}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phiên bản Expo SDK:</Text>
            <Text style={styles.value}>SDK 58.0.0 (Expo + React Native)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Cấu hình Release Android:</Text>
            <Text style={styles.value}>EAS Build APK / AAB Ready</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#4B5563',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillSuccess: {
    backgroundColor: '#D1FAE5',
  },
  statusPillSuccessText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  statusPillWarning: {
    backgroundColor: '#FEF3C7',
  },
  statusPillWarningText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  testBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 8,
  },
  testBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  testBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  valueHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
  },
  noteBox: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
    marginTop: 10,
  },
  inputKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  keyInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1F2937',
    marginRight: 8,
  },
  saveKeyBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveKeyBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});
