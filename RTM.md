# REQUIREMENT TRACEABILITY MATRIX (RTM) & DESIGN DECISION RECORD

**Học phần:** MMA301 – Multiplatform Mobile App Development  
**Assignment:** 02 – Integrated E-Commerce Mobile App  
**Sinh viên:** Le Phuoc Nghia (MSSV: CE181020)

---

## 1. REQUIREMENT TRACEABILITY MATRIX (RTM) TỐI THIỂU (Section 1.3)

| ID | Yêu cầu | Bằng chứng UI / Code File | Test Case & Kết quả kiểm chứng |
| :--- | :--- | :--- | :--- |
| **R01** | Remote product data | `src/services/productService.js`<br>`src/context/ProductContext.js` | Load dữ liệu từ DummyJSON API thành công; hiển thị màn hình lỗi khi mất mạng kèm nút "Thử lại". |
| **R02** | FlatList + pagination / infinite | `src/screens/ProductListScreen.js`<br>`onEndReached`, `ListFooterComponent` | Cuộn đến cuối trang tải tiếp 10 sản phẩm mới; có cờ guard `loadingMore` và `hasMore` chặn request lặp; hiển thị footer kết thúc khi hết sản phẩm. |
| **R03** | Search / filter + refresh | `src/screens/ProductListScreen.js`<br>`categoryList`, `RefreshControl` | Tìm kiếm theo từ khóa thực tế; bấm chip danh mục (Beauty, Fragrances,...); kéo để làm mới (`pull-to-refresh`) tải lại danh sách sạch sẽ. |
| **R04** | Product detail | `src/screens/ProductDetailScreen.js`<br>`route.params.productId` | Mở chi tiết sản phẩm hợp lệ hiển thị ảnh, thông số, đánh giá, tồn kho; truyền `productId` sai hiển thị ErrorState và cho phép quay lại an toàn. |
| **R05** | Cart state | `src/context/CartContext.js`<br>`src/screens/CartScreen.js` | Thêm vào giỏ từ card hoặc detail; tăng/giảm số lượng; giảm về 0 hiện hộp thoại xác nhận xóa; xóa từng món hoặc xóa sạch giỏ hàng. |
| **R06** | Derived totals | `src/context/CartContext.js` (useMemo `totals`) | Tính toán tự động số lượng món, tạm tính, phí ship (miễn phí khi >= $50), giảm giá khi nhập coupon (`MMA301`, `SAVE10`), tổng thanh toán tức thì. |
| **R07** | Persistence | `src/utils/storageHelper.js`<br>`@ecommerce_cart_v1` | Tắt hoàn toàn ứng dụng và mở lại, giỏ hàng và danh sách yêu thích vẫn được giữ nguyên vẹn 100%. |
| **R08** | Firebase use case | `src/services/firebaseService.js`<br>`src/screens/WishlistScreen.js` | Lưu trữ Wishlist và đơn hàng đám mây; hiển thị trạng thái đồng bộ; nếu offline tự động fallback cục bộ không làm crash app. |
| **R09** | Notification flow | `src/services/notificationService.js`<br>`src/screens/SettingsNotificationScreen.js` | Xin quyền thông báo hệ thống; tự động gửi thông báo khi đặt hàng thành công hoặc thêm sản phẩm yêu thích; nút test thông báo hoạt động chính xác. |
| **R10** | Gemini AI integration | `src/services/aiService.js`<br>`src/screens/AiAdvisorScreen.js` | Gửi context danh mục thực tế cho Gemini 2.5 Flash; hàm `validateAndMatchProducts` chặn đứng ID ảo giác (hallucination); fallback heuristic khi offline. |
| **R11** | Debug evidence | `TEST_MATRIX.md`<br>2 Debug logs thực tế | Phân tích rõ Triệu chứng -> Giả thuyết -> Nơi kiểm tra -> Root cause -> Fix -> Retest. |
| **R12** | Release build | `app.json`, `eas.json`, `dist/` bundle | Đã cấu hình EAS build profile, bundle identifier `com.nghialpce181020.mma301assignment2`, export web bundle thành công 754 modules. |

---

## 2. DESIGN DECISION RECORD (DDR) – TỐI THIỂU 6 QUYẾT ĐỊNH (Section 3.2)

| # | Quyết định kỹ thuật | Lựa chọn của tôi | Lý do lựa chọn | Impact nếu đổi requirement |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **State Management** | Context API (`CartContext`, `ProductContext`, `WishlistContext`, `NotificationContext`) | Phù hợp quy mô ứng dụng, không cần boilerplate phức tạp của Redux, chia nhỏ ngữ cảnh giúp tối ưu render. | Nếu đổi sang Redux Toolkit / Zustand: chỉ cần refactor tầng Context, các Screens gọi qua custom hook giữ nguyên interface. |
| **2** | **API / Service Structure** | Tách riêng tầng Service (`productService`, `firebaseService`, `aiService`, `notificationService`) | Tuân thủ nguyên tắc Separation of Concerns; screens chỉ làm nhiệm vụ hiển thị và tương tác người dùng. | Dễ dàng thay đổi nguồn API (ví dụ đổi từ DummyJSON sang backend thật) mà không cần sửa code giao diện. |
| **3** | **Pagination Strategy** | Offset/Limit Pagination (`limit=10`, `skip=products.length`) kết hợp guards `loadingMore` và `hasMore` | DummyJSON hỗ trợ tham số `skip` và `limit` kèm trường `total`, bảo đảm danh sách tải mượt mà không bị trùng lặp. | Nếu đổi sang Cursor-based pagination: chỉ cần cập nhật tham số gọi trong `productService` và lưu `nextCursor`. |
| **4** | **Persistence Layer** | `AsyncStorage` bọc trong `storageHelper` tập trung | Xử lý lỗi `try/catch` và JSON parse/stringify tập trung một nơi, tránh rải rác cú pháp khắp các màn hình. | Nếu chuyển sang SQLite / WatermelonDB: chỉ cần sửa logic bên trong file `storageHelper.js`. |
| **5** | **Firebase Business Use Case** | Lưu trữ và đồng bộ hóa Danh sách yêu thích (Wishlist) & Lịch sử đơn hàng (Order History) | Giải quyết bài toán nghiệp vụ thực tế cho khách hàng mua sắm; áp dụng mô hình Resilient Hybrid không sập khi mất mạng. | Có thể mở rộng sang Cloud Firestore thời gian thực hoặc Firebase Authentication một cách dễ dàng. |
| **6** | **Gemini AI Context & Anti-Hallucination** | Truyền Context Catalog rút gọn vào Prompt + Hàm kiểm tra đối chiếu `validateAndMatchProducts` | Ngăn chặn hoàn toàn việc AI tự bịa ra ID hoặc sản phẩm không có trong kho; bảo đảm mọi sản phẩm gợi ý đều bấm vào mua được. | Nếu đổi sang Vector Database / Embeddings: cấu trúc kiểm tra ID ở client vẫn giữ vai trò chốt chặn an toàn cuối cùng. |
| **7** | **Notification Flow** | Local / Push Notifications qua `expo-notifications` gắn với sự kiện Đặt hàng & Yêu thích | Minh chứng rõ ràng quyền truy cập hệ thống và kích hoạt sự kiện nghiệp vụ ngay trên thiết bị mà không phụ thuộc backend ngoài. | Có thể kết nối thêm Firebase Cloud Messaging (FCM) để nhận thông báo đẩy từ server. |

---

## 3. INTEGRATION MAP (BẢN ĐỒ TÍCH HỢP HỆ THỐNG)

```
[ User Interaction ]
        │
        ▼
[ Screens Layer ] (ProductList, ProductDetail, Cart, Wishlist, AiAdvisor, Settings)
        │
        ▼
[ Context & State Layer ] (ProductContext, CartContext, WishlistContext, NotificationContext)
        │
        ├──────────────────────┬──────────────────────┬──────────────────────┐
        ▼                      ▼                      ▼                      ▼
[ productService ]     [ firebaseService ]      [ aiService ]     [ notificationService ]
        │                      │                      │                      │
        ▼                      ▼                      ▼                      ▼
(DummyJSON Public API)  (Firestore / Hybrid)   (Gemini 2.5 Flash)    (expo-notifications)
                               │                      │
                               ▼                      ▼
                       [ storageHelper ]      [ Catalog Match Guard ]
                        (AsyncStorage)         (Lọc bỏ ID giả mạo)
```
