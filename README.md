# MMA301 - ASSIGNMENT 02: INTEGRATED E-COMMERCE MOBILE APPLICATION

**Sinh viên thực hiện:** Le Phuoc Nghia  
**Mã số sinh viên:** CE181020  
**Lớp / Môn học:** MMA301 – Multiplatform Mobile App Development  
**Tên dự án:** `MMA301_Assignment2_nghialpce181020`  
**Nền tảng:** React Native (Expo SDK 58, React 19)

---

## 1. TỔNG QUAN BUSINESS WORKFLOW (Section 1.1)

Ứng dụng thương mại điện tử tích hợp đầy đủ chu trình mua sắm từ đầu đến cuối (End-to-End E-Commerce Flow):

1. **Startup & Restoration:** Khi mở ứng dụng, hệ thống tự động phục hồi giỏ hàng (`CartContext`), danh sách yêu thích (`WishlistContext`), và lịch sử đơn hàng từ bộ nhớ cục bộ an toàn (`AsyncStorage`) thông qua `storageHelper`.
2. **Catalog & Pagination:** Tải danh mục sản phẩm từ DummyJSON API với phân trang vô hạn (`FlatList onEndReached`), hỗ trợ tìm kiếm trực tiếp, lọc theo danh mục, sắp xếp theo giá / đánh giá, và kéo để làm mới (`Pull-to-refresh`).
3. **Product Detail:** Hiển thị chi tiết ảnh, giá gốc, giá khuyến mãi, đánh giá sao, tồn kho, thông số kỹ thuật, đánh giá từ khách hàng; hỗ trợ chọn số lượng có kiểm tra tồn kho tối đa.
4. **Cart Management:** Quản lý giỏ hàng với tính toán tức thì (Derived Totals: subtotal, discount, shipping fee, final total, item count); áp dụng mã giảm giá (`MMA301`, `SAVE10`, `FREESHIP`).
5. **Firebase Business State:** Lưu trữ và đồng bộ đám mây cho danh sách yêu thích và lịch sử đơn hàng với cơ chế chống sập (Resilient Hybrid Persistence - fallback cục bộ an toàn khi mất mạng hoặc không có API key).
6. **Business Notifications:** Xử lý luồng xin quyền (`expo-notifications`) và tự động kích hoạt thông báo khi đặt hàng thành công hoặc thêm sản phẩm yêu thích; có giao diện kiểm tra trạng thái quyền OS.
7. **Gemini AI Integration:** Tích hợp AI tư vấn mua sắm và so sánh sản phẩm gắn liền với context catalog thực tế. Hệ thống kiểm tra đối chiếu mã sản phẩm (Anti-Hallucination Guard) để không bao giờ hiển thị sản phẩm giả mạo.
8. **Failure & Error Resilience:** Không bao giờ làm ứng dụng bị crash khi gặp lỗi mạng, lỗi Firebase, lỗi AI hoặc người dùng từ chối quyền thông báo.

---

## 2. KIẾN TRÚC HỆ THỐNG VÀ SEPARATION OF CONCERNS (Section 3.1)

```
src/
├── config/
│   └── env.js                 # Cấu hình tập trung, không commit secret/API key thật
├── utils/
│   ├── storageHelper.js       # Wrapper an toàn cho AsyncStorage (JSON parse guard)
│   └── formatters.js          # Định dạng tiền tệ ($), ngày tháng, tính toán giảm giá
├── services/
│   ├── productService.js      # Gọi DummyJSON API: phân trang, tìm kiếm, lọc, chi tiết
│   ├── firebaseService.js     # Đọc/ghi Firestore/Cloud với cơ chế Offline Fallback
│   ├── notificationService.js # Quản lý quyền và gửi thông báo đơn hàng/yêu thích
│   └── aiService.js           # Gemini AI tư vấn grounded trên catalog + lọc ảo giác
├── context/
│   ├── ProductContext.js      # Quản lý state danh mục, tìm kiếm, lọc danh mục, phân trang
│   ├── CartContext.js         # Quản lý giỏ hàng, derived totals, mã giảm giá, lưu trữ
│   ├── WishlistContext.js     # Quản lý danh sách yêu thích + trạng thái đồng bộ Cloud
│   └── NotificationContext.js # Quản lý trạng thái cấp quyền và trigger thông báo
├── components/
│   ├── ProductCard.js         # Card sản phẩm hiển thị ảnh, giá, sao, nút yêu thích, nút thêm giỏ
│   ├── EmptyState.js          # Giao diện khi danh sách trống hoặc không có kết quả tìm kiếm
│   └── ErrorState.js          # Giao diện khi lỗi mạng kèm nút "Thử lại" (Retry)
├── screens/
│   ├── ProductListScreen.js   # Màn hình danh mục sản phẩm (R02, R03)
│   ├── ProductDetailScreen.js # Màn hình chi tiết sản phẩm (R04)
│   ├── CartScreen.js          # Màn hình giỏ hàng và thanh toán đơn hàng (R05, R06)
│   ├── WishlistScreen.js      # Màn hình danh sách yêu thích & Lịch sử đơn hàng (R08)
│   ├── AiAdvisorScreen.js     # Màn hình AI tư vấn & So sánh sản phẩm (R10)
│   └── SettingsNotificationScreen.js # Màn hình cài đặt quyền thông báo & API Key (R09)
└── navigation/
    └── AppNavigator.js        # BottomTabNavigator (5 tabs) + NativeStackNavigator
```

---

## 3. HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY ỨNG DỤNG

### 3.1 Cài đặt dependencies
```bash
npm install
# Hoặc sử dụng Expo CLI:
npx expo install --fix
```

### 3.2 Khởi chạy môi trường phát triển
- **Khởi chạy ứng dụng:**
  ```bash
  npx expo start
  ```
- **Chạy trên trình duyệt Web (dành cho demo nhanh):**
  ```bash
  npx expo start --web
  ```
- **Chạy trên thiết bị Android (Expo Go / Emulator):**
  ```bash
  npx expo start --android
  ```

### 3.3 Chẩn đoán sức khỏe dự án
```bash
npx expo-doctor
```
*(Kết quả: 20/20 checks passed - không có bất kỳ xung đột thư viện nào)*

---

## 4. THIẾT LẬP CÁC DỊCH VỤ TÍCH HỢP

### 4.1 Firebase (Wishlist & Order History)
- Cấu hình tại `src/config/env.js`.
- Không cần commit private key: nếu cấu hình Firebase mặc định hoặc môi trường ngoại tuyến, `firebaseService.js` tự động kích hoạt **Resilient Hybrid Mode**, lưu trữ an toàn trong `AsyncStorage` và hiển thị nhãn `Lưu cục bộ (Offline)` trên giao diện.
- Người dùng có thể theo dõi trạng thái đồng bộ trực tiếp tại màn hình `WishlistScreen`.

### 4.2 Push & Local Notifications
- Sử dụng thư viện chuẩn `expo-notifications`.
- Đã cấu hình Android Notification Channel tại `src/services/notificationService.js`.
- Luồng cấp quyền được bảo vệ an toàn: nếu người dùng bấm từ chối, ứng dụng hiển thị trạng thái `TỪ CHỐI / CHƯA CẤP` tại màn hình Cài đặt mà không làm gián đoạn luồng mua sắm.

### 4.3 Gemini AI Integration
- Mô hình: `gemini-2.5-flash` qua REST API của Google Generative AI.
- Người dùng có thể nhập Gemini API Key cá nhân trực tiếp tại màn hình **Cài đặt & Tích hợp hệ thống** (`SettingsNotificationScreen`). Khóa được lưu vào bộ nhớ an toàn của thiết bị.
- **Cơ chế chống ảo giác (Anti-Hallucination Guard):** Hàm `validateAndMatchProducts` trong `aiService.js` tự động đối chiếu các `matched_product_ids` do AI trả về với danh mục thực tế của DummyJSON. Chỉ các sản phẩm thực sự tồn tại mới được render thành thẻ tương tác.
- **Chế độ thông minh dự phòng (Offline Fallback):** Khi chưa nhập API Key hoặc mất mạng, thuật toán heuristic thông minh tự động gợi ý sản phẩm tốt nhất từ danh mục mà không làm gián đoạn trải nghiệm.

---

## 5. HƯỚNG DẪN BUILD RELEASE ANDROID (Requirement R12)

Dự án đã được cấu hình đầy đủ `eas.json` và `app.json` với bundle package `com.nghialpce181020.mma301assignment2`.

### 5.1 Tạo bản build APK Release qua EAS:
```bash
npx eas-cli build --platform android --profile preview
```

### 5.2 Kiểm tra đóng gói tĩnh:
```bash
npx expo export --platform web
```
*(Đã kiểm thử thành công: tạo thư mục `dist/` bundle hoàn chỉnh không lỗi).*

---

## 6. HỒ SƠ TÀI LIỆU KÈM THEO
- **[RTM.md](file:///d:/MMA301_Assignment2_nghialpce181020/RTM.md):** Ma trận truy vết yêu cầu R01 đến R12 + Design Decision Record (6 quyết định kỹ thuật) + Integration Map.
- **[TEST_MATRIX.md](file:///d:/MMA301_Assignment2_nghialpce181020/TEST_MATRIX.md):** Bảng kiểm thử 15 test cases chuẩn theo đề bài + 2 Debug Logs thực tế.
- **[AI_USAGE_LOG.md](file:///d:/MMA301_Assignment2_nghialpce181020/AI_USAGE_LOG.md):** Nhật ký sử dụng AI có trách nhiệm (Section 9.4).
- **[INTERVIEW_CHEAT_SHEET.md](file:///d:/MMA301_Assignment2_nghialpce181020/INTERVIEW_CHEAT_SHEET.md):** Bộ câu hỏi vấn đáp và checklist giải thích code trong 30 giây phục vụ buổi chấm điểm.
