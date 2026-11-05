# BẢNG KIỂM THỬ HỆ THỐNG (TEST MATRIX) & NHẬT KÝ DEBUG

**Học phần:** MMA301 – Multiplatform Mobile App Development  
**Assignment:** 02 – Integrated E-Commerce Mobile App  
**Sinh viên:** Le Phuoc Nghia (MSSV: CE181020)

---

## 1. BẢNG KIỂM THỬ 15 TEST CASES BẮT BUỘC (Section 5)

| # | Nhóm | Test Case | Thao tác thực hiện | Kết quả mong đợi | Kết quả thực tế & Ghi chú | Đánh giá |
| :-: | :--- | :--- | :--- | :--- | :--- | :-: |
| **1** | API | Success | Mở tab "Sản phẩm" khi có kết nối mạng | Tải thành công 10 sản phẩm đầu tiên từ DummyJSON, hiển thị đầy đủ ảnh, giá, sao. | Danh sách sản phẩm tải mượt mà trong < 1.5s. | **PASS** |
| **2** | API | Network error | Tắt WiFi/Dữ liệu di động hoặc ngắt kết nối mạng rồi mở app | Không crash ứng dụng; hiển thị component `ErrorState` kèm nút "Thử lại". | Hiển thị thông báo "Không thể kết nối đến máy chủ" và nút Thử lại hoạt động tốt. | **PASS** |
| **3** | List | Empty | Nhập từ khóa tìm kiếm không tồn tại (ví dụ: `xyz12345nonexistent`) | Hiển thị `EmptyState` với thông báo "Không tìm thấy sản phẩm" và nút "Xóa bộ lọc". | Hiển thị đúng EmptyState; bấm nút xóa bộ lọc danh sách tự khôi phục. | **PASS** |
| **4** | Pagination | End | Cuộn danh sách xuống cuối trang nhiều lần cho tới khi hết dữ liệu | Dừng tải khi hết sản phẩm (`hasMore = false`); không gửi request lặp vô tận; hiện thông báo đã xem hết. | Chặn request trùng lặp nhờ guard `loadingMore` và `hasMore`; hiện footer thông báo. | **PASS** |
| **5** | Search | Hit / Miss | Gõ từ khóa `phone` -> có kết quả; gõ chuỗi ngẫu nhiên -> không có kết quả | Kết quả trả về đúng từ khóa tìm kiếm; chuyển đổi mượt mà không bị giật lag. | Tìm `phone` trả về đúng các sản phẩm liên quan; xóa từ khóa tự phục hồi danh mục gốc. | **PASS** |
| **6** | Cart | Add same item | Bấm thêm cùng một sản phẩm 2 lần liên tiếp | Số lượng (quantity) tăng lên 2; tổng tiền (subtotal) nhân đôi chính xác; không tạo ra 2 dòng trùng nhau. | Sản phẩm tự cộng dồn `quantity: 2`, số lượng hiển thị trên badge thanh điều hướng tăng đúng. | **PASS** |
| **7** | Cart | Quantity 0 / Remove | Giảm số lượng từ 1 về 0 hoặc bấm nút biểu tượng thùng rác | Hiển thị hộp thoại xác nhận xóa; sau khi xác nhận món hàng biến mất khỏi giỏ, tổng tiền cập nhật ngay. | Xóa thành công; các chỉ số `itemCount`, `subtotal`, `finalTotal` tính toán lại tức thì. | **PASS** |
| **8** | Persistence | Restart | Thêm sản phẩm vào giỏ và yêu thích, tắt ứng dụng (kill app), mở lại | Dữ liệu giỏ hàng và danh sách yêu thích được khôi phục nguyên vẹn 100%. | Phục hồi thành công từ `AsyncStorage` qua `CartContext` và `WishlistContext`. | **PASS** |
| **9** | Firebase | Write / Read | Thêm sản phẩm vào Yêu thích hoặc bấm "Xác nhận đặt hàng" | Dữ liệu được ghi nhận vào cloud/persistent state; hiển thị trạng thái "Đã đồng bộ" kèm ngày giờ. | Đơn hàng xuất hiện ngay trong tab "Lịch sử đơn hàng" với mã `#ORD-xxxxxx`. | **PASS** |
| **10** | Firebase | Error / Offline | Ngắt mạng khi thao tác lưu yêu thích hoặc đặt hàng | Ứng dụng không bị crash; tự động kích hoạt chế độ dự phòng `Lưu cục bộ (Offline)` và thông báo người dùng. | Dữ liệu vẫn được lưu an toàn trên thiết bị và không xảy ra lỗi unhandled promise. | **PASS** |
| **11** | Notification | Denied | Từ chối quyền thông báo khi hệ thống hỏi | Ứng dụng hoạt động bình thường không crash; màn hình Cài đặt hiển thị trạng thái `TỪ CHỐI / CHƯA CẤP`. | Người dùng vẫn mua sắm bình thường; khi thử gửi thông báo app nhắc nhở cấp quyền. | **PASS** |
| **12** | Notification | Allowed / Event | Cấp quyền và thực hiện thao tác Đặt hàng thành công | Banner thông báo của hệ điều hành xuất hiện với tiêu đề "Đặt hàng thành công!" kèm mã đơn và tổng tiền. | Thông báo xuất hiện trên thanh thông báo Android/iOS; âm thanh và rung hoạt động chuẩn. | **PASS** |
| **13** | Gemini | Valid prompt | Gửi yêu cầu: "Gợi ý mỹ phẩm hoặc quà tặng dưới $30" | AI phản hồi lời khuyên hữu ích kèm danh sách sản phẩm thực sự có trong catalog và bấm vào xem được. | AI gợi ý đúng sản phẩm, nhãn "Đã xác thực Catalog" hiển thị màu xanh. | **PASS** |
| **14** | Gemini | Invalid / Hallucination | Kiểm tra tình huống AI trả về ID sản phẩm không tồn tại trong catalog (ví dụ ID 99999) | Hàm `validateAndMatchProducts` phát hiện và loại bỏ ID giả mạo; không hiển thị thẻ hỏng lên UI. | Chặn đứng 100% ảo giác; bảo vệ an toàn cho dữ liệu người dùng. | **PASS** |
| **15** | Release | Install / Run | Đóng gói production web bundle và chạy kiểm thử độc lập | Toàn bộ các luồng cốt lõi (Catalog -> Detail -> Cart -> Checkout) chạy mượt mà không lỗi console. | Bundle xuất ra 754 modules hoàn toàn không có lỗi cú pháp hoặc thiếu tài nguyên. | **PASS** |

---

## 2. NHẬT KÝ DEBUG THỰC TẾ (DEBUG LOGS – Section 6.2)

### 🐛 Debug Log #1: Lỗi thiếu Peer Dependency `expo-font` cho bộ Icon
- **Triệu chứng quan sát được:** Khi chạy kiểm tra chất lượng bằng công cụ `npx expo-doctor`, hệ thống báo lỗi đỏ: `✖ Check that required peer dependencies are installed: Missing peer dependency: expo-font required by @expo/vector-icons`.
- **Giả thuyết:** Thư viện `@expo/vector-icons` khi cài đặt độc lập cần module gốc `expo-font` để nạp các phông chữ icon (Ionicons, MaterialIcons). Nếu thiếu module này trên môi trường build độc lập, ứng dụng sẽ bị văng lỗi crash khi render icon.
- **Cách kiểm tra:** Chạy lệnh `npx expo-doctor` để đọc chi tiết nhật ký phụ thuộc.
- **Root Cause (Nguyên nhân gốc rễ):** Do khi cài `@expo/vector-icons`, npm không tự động liên kết peer dependency `expo-font` tương thích với Expo SDK 58.
- **Fix (Cách khắc phục):** Sử dụng lệnh chuẩn Expo CLI:
  ```bash
  npx expo install expo-font
  ```
- **Retest:** Chạy lại `npx expo-doctor`. Kết quả: Check pass hoàn toàn, `expo-font` được đăng ký tự động vào config plugins.

---

### 🐛 Debug Log #2: Lỗi vòng lặp vô tận (Infinite Request Loop) khi phân trang FlatList
- **Triệu chứng quan sát được:** Trong quá trình thử nghiệm cuộn nhanh danh sách sản phẩm xuống dưới, hàm `loadMore` bị gọi liên tục 4-5 lần cùng lúc, dẫn tới việc các request gửi tới DummyJSON bị trùng lặp và các item trong mảng `products` có nguy cơ bị nhân bản (duplicate keys).
- **Giả thuyết:** Sự kiện `onEndReached` của FlatList được kích hoạt nhiều lần liên tiếp trước khi request trước đó kịp phản hồi, do thiếu cờ chốt chặn trạng thái đang tải (Loading Guard).
- **Cách kiểm tra:** Đặt `console.log('[loadMore] Triggered')` bên trong hàm tải thêm và quan sát terminal khi cuộn nhanh.
- **Root Cause:** Chưa có điều kiện guard kiểm tra `loadingMore`, `loading`, và `!hasMore` trước khi kích hoạt `productService.getProducts()`.
- **Fix (Cách khắc phục):**
  1. Thêm guard ở đầu hàm `loadMore`:
     ```javascript
     if (loading || loadingMore || !hasMore || refreshing) return;
     ```
  2. Bổ sung cơ chế loại trừ trùng lặp ID (De-duplication) bằng `Set`:
     ```javascript
     setProducts((prev) => {
       const existingIds = new Set(prev.map((p) => p.id));
       const newUnique = result.products.filter((p) => !existingIds.has(p.id));
       return [...prev, ...newUnique];
     });
     ```
- **Retest:** Cuộn mạnh và nhanh xuống cuối trang. Hàm `loadMore` chỉ gọi đúng 1 lần cho mỗi trang, footer hiển thị spinner tải và chuyển sang "Đã xem hết sản phẩm" khi kết thúc danh mục.
