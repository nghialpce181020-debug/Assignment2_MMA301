# NHẬT KÝ DEBUG THỰC TẾ & XỬ LÝ SỰ CỐ (DEBUG LOGS)

* **Học phần:** MMA301 – Multiplatform Mobile App Development  
* **Đề tài:** Assignment 2 – Integrated E-Commerce Mobile App  
* **Sinh viên:** Lê Phước Nghĩa – **CE181020**  
* **Tài khoản Git:** `nghialpce181020-debug`  

---

## 🐛 Debug Log #1: Lỗi thiếu Peer Dependency `expo-font` cho bộ Icon

* **Mã lỗi liên quan:** Environment & Native Dependencies Setup
* **Triệu chứng quan sát được:**  
  Khi chạy kiểm tra chất lượng bằng công cụ `npx expo-doctor`, hệ thống báo lỗi đỏ cảnh báo:  
  `✖ Check that required peer dependencies are installed: Missing peer dependency: expo-font required by @expo/vector-icons`.
* **Giả thuyết đặt ra:**  
  Thư viện `@expo/vector-icons` khi cài đặt độc lập cần module gốc `expo-font` để nạp các phông chữ icon (Ionicons, MaterialIcons). Nếu thiếu module này trên môi trường build độc lập, ứng dụng sẽ bị văng lỗi crash khi render icon trên thiết bị thật.
* **Cách kiểm tra & Nơi kiểm tra:**  
  Chạy lệnh chẩn đoán `npx expo-doctor` để đọc chi tiết nhật ký cây phụ thuộc (`package.json`).
* **Root Cause (Nguyên nhân gốc rễ):**  
  Do khi cài đặt `@expo/vector-icons`, npm không tự động liên kết peer dependency `expo-font` tương thích với Expo SDK 58.
* **Fix (Cách khắc phục):**  
  Sử dụng lệnh chuẩn Expo CLI để cài đặt phiên bản tương thích chính xác:
  ```bash
  npx expo install expo-font
  ```
* **Retest:**  
  Chạy lại lệnh `npx expo-doctor`. Kết quả: `20/20 checks passed` hoàn toàn, `expo-font` được đăng ký tự động và biểu tượng Ionicons render sắc nét trên mọi màn hình.

---

## 🐛 Debug Log #2: Lỗi vòng lặp gọi lặp vô tận (Infinite Request Loop) khi phân trang FlatList

* **Mã lỗi liên quan:** R02 – FlatList & Smart Pagination
* **Triệu chứng quan sát được:**  
  Trong quá trình thử nghiệm cuộn nhanh danh sách sản phẩm xuống dưới, hàm `loadMore` bị gọi liên tục 4–5 lần cùng một lúc, dẫn tới việc các request gửi tới DummyJSON bị trùng lặp và các item trong mảng `products` có nguy cơ bị nhân bản (Duplicate React Keys warning).
* **Giả thuyết đặt ra:**  
  Sự kiện `onEndReached` của FlatList được kích hoạt nhiều lần liên tiếp trước khi request trước đó kịp phản hồi từ API, do thiếu cờ chốt chặn trạng thái đang tải (Loading Guard).
* **Cách kiểm tra & Nơi kiểm tra:**  
  Đặt log `console.log('[loadMore] Triggered')` bên trong hàm tải thêm tại `src/screens/ProductListScreen.js` và quan sát terminal khi cuộn nhanh.
* **Root Cause (Nguyên nhân gốc rễ):**  
  Chưa có điều kiện guard kiểm tra đồng thời cả 4 trạng thái: `loadingMore`, `loading`, `!hasMore`, và `refreshing` trước khi kích hoạt gọi service `productService.getProducts()`.
* **Fix (Cách khắc phục):**  
  1. Thêm cờ Triple Guard ở đầu hàm `loadMore`:
     ```javascript
     if (loading || loadingMore || !hasMore || refreshing) return;
     ```
  2. Bổ sung cơ chế loại trừ trùng lặp ID (De-duplication) bằng cấu trúc dữ liệu `Set`:
     ```javascript
     setProducts((prev) => {
       const existingIds = new Set(prev.map((p) => p.id));
       const newUnique = result.products.filter((p) => !existingIds.has(p.id));
       return [...prev, ...newUnique];
     });
     ```
* **Retest:**  
  Cuộn mạnh và nhanh xuống cuối trang. Hàm `loadMore` chỉ gọi đúng 1 lần cho mỗi trang, footer hiển thị spinner tải và chuyển sang "Đã xem hết sản phẩm" khi kết thúc danh mục. Không còn bất kỳ cảnh báo duplicate key nào.

---

## 🐛 Debug Log #3: Nguy cơ lệch tổng tiền giỏ hàng (Cart Totals Desynchronization)

* **Mã lỗi liên quan:** R05, R06 – Shopping Cart & Derived Totals
* **Triệu chứng quan sát được:**  
  Nếu lưu `totalAmount` trong một `useState` riêng biệt, khi người dùng bấm tăng giảm số lượng liên tục hoặc nhập mã giảm giá, tổng tiền đôi khi hiển thị giá trị cũ (chậm 1 nhịp render) so với số lượng thực tế trong giỏ hàng.
* **Giả thuyết đặt ra:**  
  State `totalAmount` phụ thuộc vào `cartItems` nhưng cập nhật không đồng thời trong cùng một vòng đời render, gây ra hiện tượng Stale Closure / Stale State.
* **Root Cause (Nguyên nhân gốc rễ):**  
  Lưu trữ dữ liệu có thể suy diễn (Derived Data) vào State độc lập vi phạm nguyên tắc Single Source of Truth của React.
* **Fix (Cách khắc phục):**  
  Xóa hoàn toàn `useState` cho `totalAmount`, chuyển sang tính toán suy diễn trực tiếp bằng hook `useMemo`:
  ```javascript
  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = calculateDiscount(subtotal, coupon);
    const shippingFee = subtotal >= 50 || subtotal === 0 ? 0 : 5.99;
    const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);
    return { subtotal, discountAmount, shippingFee, finalTotal };
  }, [items, coupon]);
  ```
* **Retest:**  
  Tăng/giảm số lượng bất kỳ món nào hoặc áp dụng coupon `MMA301`, tổng tiền tự động nhảy số tức thì với độ trễ 0ms, chính xác 100%.

