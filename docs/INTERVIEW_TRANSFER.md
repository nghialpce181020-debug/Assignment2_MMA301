# TÀI LIỆU CHUẨN BỊ PHỎNG VẤN VÀ BẢO VỆ ĐỒ ÁN (INTERVIEW & TRANSFER GUIDE)

* **Học phần:** MMA301 – Multiplatform Mobile App Development  
* **Đề tài:** Assignment 2 – Integrated E-Commerce Mobile App  
* **Sinh viên:** Lê Phước Nghĩa – **CE181020**  
* **Tài khoản Git:** `nghialpce181020-debug`  

---

## 1. REHEARSAL CHECKLIST – "MỞ FILE VÀ CHỈ CODE TRONG ≤ 30 GIÂY"

| Yêu cầu của Giảng viên | File cần mở ngay lập tức | Đoạn code chính xác cần chỉ vào |
| :--- | :--- | :--- |
| **Mở product service + fetch logic** | `src/services/productService.js` | Hàm `getProducts({ limit, skip, category, sortBy })` và `searchProducts()` |
| **Mở pagination & guard tránh lặp** | `src/screens/ProductListScreen.js` | Hàm `loadMore()`: dòng `if (loading || loadingMore || !hasMore || refreshing) return;` |
| **Mở cart state, reducer & derived totals** | `src/context/CartContext.js` | Hook `useMemo(() => { ... }, [items, coupon])` tính `itemCount`, `subtotal`, `finalTotal` |
| **Mở Firebase service và business record** | `src/services/firebaseService.js` | Hàm `syncWishlist()`, `saveOrder()`, và `fetchOrders()` |
| **Mở notification permission & handler** | `src/services/notificationService.js` | `Notifications.requestPermissionsAsync()` và `notifyOrderPlaced()` |
| **Mở AI service + response validation** | `src/services/aiService.js` | Hàm `validateAndMatchProducts(productIds, actualCatalog)` |
| **Mở cấu hình/secret an toàn** | `src/config/env.js` | `CONFIG`: cấu hình không chứa hardcoded secret, đọc từ `AsyncStorage` hoặc UI |

---

## 2. TRẢ LỜI 12 CÂU HỎI VẤN ĐÁP BẮT BUỘC

### 2.1 Nhóm Data / List / State
* **Câu hỏi 1: `onEndReached` của FlatList có thể bị gọi lặp khi nào?**  
  *Trả lời:* `onEndReached` có thể bị gọi lặp khi người dùng cuộn nhanh xuống đáy màn hình trong khi request trước đó vẫn đang chờ mạng (pending), hoặc khi chiều cao danh sách hiển thị chưa lấp đầy màn hình khiến threshold liên tục thỏa mãn. Em xử lý bằng cách đặt cờ guard: `if (loading || loadingMore || !hasMore || refreshing) return;` và loại bỏ ID trùng bằng `Set`.
* **Câu hỏi 2: Source data và Displayed data khác nhau thế nào?**  
  *Trả lời:* Source data là dữ liệu thô nhận từ API (mảng đầy đủ thuộc tính `price`, `discountPercentage`, `stock`, `reviews`). Displayed data là dữ liệu đã qua xử lý (transform), lọc theo danh mục, tính giá sau giảm qua `formatDiscountPrice()`, hoặc giới hạn số lượng hiển thị trên từng trang.
* **Câu hỏi 3: Cart total nên lưu trong state hay derive? Vì sao?**  
  *Trả lời:* Cart total **bắt buộc nên derive** (tính toán suy diễn từ danh sách món hàng) bằng `useMemo`. Lý do: Tránh hiện tượng mất đồng bộ (Desynchronization / Stale State). Khi số lượng hoặc giá của bất kỳ sản phẩm nào thay đổi, tổng tiền tự động tính lại chính xác 100%, không lo tình trạng giỏ hàng có 2 món nhưng tổng tiền vẫn lưu giá trị cũ.

---

### 2.2 Nhóm Firebase / Notification
* **Câu hỏi 4: Firebase feature trong app giải quyết business problem gì?**  
  *Trả lời:* Giải quyết bài toán lưu trữ danh sách yêu thích (Wishlist) và lịch sử mua hàng (Order History) của người dùng trên đám mây, giúp người dùng không bị mất dữ liệu khi đổi thiết bị hoặc đăng nhập lại.
* **Câu hỏi 5: Nếu người dùng từ chối (deny) quyền notification thì workflow thay đổi ra sao?**  
  *Trả lời:* Ứng dụng **tuyệt đối không bị crash**. Hàm `notificationService.getStatus()` trả về `{ granted: false }`. Luồng đặt hàng vẫn hoàn tất thành công 100%, màn hình Cài đặt hiển thị rõ trạng thái `TỪ CHỐI / CHƯA CẤP` và cung cấp nút hướng dẫn cấp quyền lại khi người dùng có nhu cầu.
* **Câu hỏi 6: Nếu Firebase offline hoặc lỗi mạng thì UI thể hiện gì?**  
  *Trả lời:* Ứng dụng kích hoạt cơ chế **Resilient Hybrid Fallback**: dữ liệu tự động lưu an toàn vào `AsyncStorage` qua `storageHelper`. Giao diện màn hình Yêu thích hiển thị nhãn cảnh báo nhẹ nhàng: `Trạng thái: Lưu cục bộ (Offline)`, bảo đảm khách hàng vẫn xem và sửa được danh sách đã lưu.

---

### 2.3 Nhóm Gemini AI
* **Câu hỏi 7: Prompt và context của AI lấy từ đâu?**  
  *Trả lời:* Context được lấy trực tiếp từ danh mục sản phẩm thực tế đang hiển thị trong `ProductContext` (gồm ID, tên sản phẩm, danh mục, giá, sao). Prompt kết hợp câu hỏi người dùng với danh sách sản phẩm này và ép AI trả về đúng định dạng JSON có chứa `matched_product_ids`.
* **Câu hỏi 8: Output nào của AI bắt buộc phải validate trước khi dùng?**  
  *Trả lời:* Bắt buộc phải validate mảng `matched_product_ids`. Không bao giờ tin tưởng mã ID do AI trả về trực tiếp.
* **Câu hỏi 9: Nếu AI bị ảo giác (hallucination) tạo ra product ID không tồn tại thì phát hiện thế nào?**  
  *Trả lời:* Em xây dựng hàm `validateAndMatchProducts()`: duyệt từng ID do AI trả về, tra cứu trong `Map` danh mục thực tế của DummyJSON. Nếu ID không khớp, hệ thống ghi nhận là ảo giác (`hallucinationsCount++`) và loại bỏ ngay, chỉ render lên màn hình các sản phẩm có thật trong kho.
* **Câu hỏi 10: Chiến lược bảo mật credential / API key của bạn là gì?**  
  *Trả lời:* Không bao giờ hardcode hoặc commit API key thật vào repository Git. Khóa được đưa vào biến môi trường `EXPO_PUBLIC_GEMINI_API_KEY` hoặc cho phép người dùng/giảng viên tự nhập trực tiếp tại màn hình Cài đặt, sau đó lưu trữ trong bộ nhớ an toàn của thiết bị.

---

### 2.4 Nhóm Debug / Release / Transfer
* **Câu hỏi 11: Nếu app chạy tốt trên Dev nhưng lỗi khi Release, bạn khoanh vùng thế nào?**  
  *Trả lời:* Em khoanh vùng 3 điểm:
  1. Biến môi trường và cấu hình `app.json` (kiểm tra package name, permissions, plugins).
  2. Các native modules thiếu cấu hình build độc lập (như lỗi thiếu `expo-font` đã ghi nhận trong Debug Log #1).
  3. Cú pháp import động hoặc sử dụng API chưa hỗ trợ trên môi trường đóng gói (kiểm tra qua `npx expo export`).
* **Câu hỏi 12: Nếu giảng viên yêu cầu Transfer Task: "Thêm sắp xếp (Sort) theo giá/rating hoặc thêm nút Retry", bạn làm thế nào?**  
  *Trả lời:* Em đã thiết kế sẵn kiến trúc tách lớp hoàn chỉnh:
  * Để đổi Sort: Thêm state `sortBy` và `sortOrder` trong `ProductContext`, truyền vào tham số `productService.getProducts({ sortBy, order })`, giao diện `ProductListScreen` chỉ cần kích hoạt hàm `handleSelectSort()`.
  * Để thêm Retry: Sử dụng component `ErrorState` có sẵn nhận prop `onRetry`, khi bấm nút sẽ gọi lại `loadProducts(false)`.

