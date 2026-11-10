# BÁO CÁO TÓM TẮT: CHỨNG MINH YÊU CẦU & GIẢI PHÁP KỸ THUẬT

* **Học phần:** MMA301 – Multiplatform Mobile App Development  
* **Đề tài:** Assignment 2 – Integrated E-Commerce Mobile App  
* **Sinh viên thực hiện:** Lê Phước Nghĩa – **CE181020**  
* **Tài khoản Git:** `nghialpce181020-debug`  
* **Repository:** `https://github.com/nghialpce181020-debug/Assignment2_MMA301.git`

---

## PHẦN 1: ĐỀ BÀI YÊU CẦU GÌ? (YÊU CẦU CỐT LÕI)

Đề bài Assignment 2 yêu cầu xây dựng ứng dụng thương mại điện tử di động hoàn chỉnh tích hợp đám mây, thông báo và trí tuệ nhân tạo (End-to-End E-Commerce Flow) gồm **6 nhóm chức năng chính**:

1. **Danh mục sản phẩm & Phân trang vô hạn (Catalog & Pagination - R01, R02, R03):**
   * Lấy danh sách sản phẩm từ xa qua API với đầy đủ hình ảnh, giá gốc, giá giảm, đánh giá sao, tồn kho.
   * Cuộn danh sách vô hạn (`Infinite Scroll` qua `FlatList`) mượt mà: cuộn xuống đáy tự nạp tiếp sản phẩm, có cờ chặn tải lặp và hiển thị thông báo khi hết sản phẩm.
   * Thanh tìm kiếm tức thì theo từ khóa, thanh trượt chip lọc theo danh mục (`Beauty`, `Fragrances`, `Furniture`, `Groceries`...) và vuốt kéo để làm mới (`Pull-to-refresh`).

2. **Chi tiết sản phẩm & Kiểm tra tồn kho (Product Detail - R04):**
   * Xem bộ sưu tập hình ảnh, thông số kỹ thuật chi tiết, thương hiệu, đánh giá nhận xét từ khách hàng.
   * Bộ chọn số lượng có kiểm tra giới hạn tồn kho thực tế (`Max Stock Guard`), không cho phép chọn quá số lượng có sẵn.

3. **Quản lý Giỏ hàng & Tính tiền tự động (Cart State & Derived Totals - R05, R06):**
   * Thêm sản phẩm vào giỏ từ màn hình Danh sách hoặc Chi tiết; tăng/giảm số lượng linh hoạt.
   * Khi giảm số lượng về 0 → hiện hộp thoại xác nhận xóa món hàng. Hỗ trợ nút xóa toàn bộ giỏ hàng.
   * **Derived Totals (Tính toán tự động tức thì):** Tự động tính số lượng món, tạm tính (Subtotal), giảm giá theo mã coupon (`MMA301`, `SAVE10`, `FREESHIP`), phí vận chuyển (miễn phí khi đơn ≥ $50), và tổng thanh toán cuối cùng (Final Total).

4. **Lưu trữ Offline & Đồng bộ Đám mây (Persistence & Cloud Sync - R07, R08):**
   * **Lưu bền vững (AsyncStorage):** Tắt app mở lại giỏ hàng và danh sách yêu thích vẫn nguyên vẹn 100%.
   * **Firebase Cloud Integration (Resilient Hybrid Model):** Lưu trữ Wishlist và Lịch sử đơn hàng lên đám mây. Nếu mất mạng hoặc chưa cấu hình API key, ứng dụng tự động fallback lưu cục bộ an toàn, **tuyệt đối không bao giờ bị crash**.

5. **Hệ thống Thông báo & Quản lý quyền OS (Notifications Flow - R09):**
   * Xử lý luồng xin quyền thông báo hệ thống (`expo-notifications`) kèm kênh Android Notification Channel chuẩn.
   * Tự động bắn thông báo khi: Đặt hàng thành công (`Order Placed`) hoặc Thêm sản phẩm vào Wishlist.
   * Nếu người dùng từ chối cấp quyền → ứng dụng vẫn hoàn thành đơn hàng bình thường và hiển thị trạng thái `TỪ CHỐI / CHƯA CẤP` tại màn hình Cài đặt.

6. **Trợ lý ảo Gemini AI & Chống ảo giác (Gemini AI Advisor - R10):**
   * Trợ lý ảo tư vấn mua sắm và so sánh sản phẩm dựa trên catalog thực tế bằng Google Gemini 2.5 Flash.
   * **Cơ chế chống ảo giác (Anti-Hallucination Guard):** Tự động kiểm tra đối chiếu mã sản phẩm (`matched_product_ids`) do AI trả về với kho hàng thực tế của DummyJSON; lọc bỏ hoàn toàn các ID giả mạo trước khi render thẻ sản phẩm.
   * **Bảo mật:** Cho phép người dùng tự nhập và lưu trữ Gemini API Key cá nhân an toàn trên thiết bị, không hardcode lộ secret trên GitHub.

---

## PHẦN 2: EM GIẢI QUYẾT BẰNG CÁCH NÀO? (GIẢI PHÁP KỸ THUẬT & CÔNG NGHỆ)

### 1. Bảng công nghệ sử dụng trong dự án (Tech Stack)

| Hạng mục kỹ thuật | Công nghệ / Thư viện chính | Vai trò & Mục đích sử dụng |
|---|---|---|
| **Nền tảng ứng dụng** | **React Native v0.78 (Expo SDK 58)** | Nền tảng di động đa nền tảng hiện đại nhất, hiệu năng Native 60 FPS, Expo Doctor đạt 20/20 checks. |
| **Cốt lõi phản ứng (Core)** | **React v19.0.0** | Tận dụng bộ Hooks hiện đại (`useMemo`, `useCallback`, `useContext`, `useState`, `useEffect`) quản trị Reactive State mượt mà. |
| **Điều hướng (Navigation)** | **React Navigation v7** (`native-stack`, `bottom-tabs`) | Kiến trúc 5 Tabs chính (`Shop`, `Advisor`, `Cart` có huy hiệu số lượng, `Wishlist`, `Settings`) + Stack chuyển trang Chi tiết. |
| **Nguồn dữ liệu REST API** | **Axios v1.7.9 + DummyJSON API** | Gọi API lấy dữ liệu sản phẩm, phân trang (`limit`/`skip`), tìm kiếm từ khóa và lọc theo category; timeout 10000ms. |
| **Quản lý trạng thái (State)** | **React Context API** (4 Contexts độc lập) | `ProductContext`, `CartContext`, `WishlistContext`, `NotificationContext` chia nhỏ ngữ cảnh, tối ưu re-render. |
| **Lưu trữ bền vững (Storage)** | **`AsyncStorage`** bọc qua `storageHelper.js` | Lưu trữ offline an toàn có cơ chế `try/catch` và JSON parse guard, tắt app mở lại không mất dữ liệu. |
| **Đồng bộ đám mây (Cloud)** | **Firebase Firestore / REST Hybrid** | Đồng bộ Wishlist và Lịch sử đơn hàng, có cơ chế Resilient Hybrid Fallback tự lưu offline khi rớt mạng. |
| **Hệ thống thông báo** | **`expo-notifications` v0.30.0** | Quản lý vòng đời cấp quyền OS, Android Channel `order-updates`, kích hoạt thông báo sự kiện nghiệp vụ tức thì. |
| **Trí tuệ nhân tạo (AI)** | **Google Gemini 2.5 Flash REST API** | LLM thế hệ mới tư vấn mua sắm, tích hợp bộ lọc đối chiếu ID danh mục triệt tiêu hoàn toàn ảo giác (Anti-Hallucination). |
| **Biểu tượng giao diện (Icons)** | **`@expo/vector-icons` (Ionicons)** | Bộ icon chuẩn native hiển thị tab bar, icon giỏ hàng, ngôi sao đánh giá, nút yêu thích. |
| **Đóng gói phát hành (Build)** | **EAS Build (`eas.json`) + Expo Export** | Cấu hình release Android APK bundle `com.nghialpce181020.mma301assignment2` và xuất web bundle 754 modules. |

---

### 2. Bảng đối chiếu Giải pháp kỹ thuật theo từng bài toán

| Vấn đề cần giải quyết | Công nghệ & Giải pháp của em | Vì sao làm như vậy? (Lợi ích kỹ thuật) |
|---|---|---|
| **1. Tránh gọi trùng lặp khi cuộn danh sách (Pagination Loop)** | **Triple Guard Flag (`loadingMore`, `hasMore`, `refreshing`)** | Khi người dùng vuốt nhanh xuống đáy màn hình, cờ kiểm tra chặn đứng các request lặp; loại bỏ ID trùng bằng `Set`. |
| **2. Tránh mất đồng bộ tổng tiền giỏ hàng (Stale State)** | **Derived Totals qua `useMemo` trong `CartContext`** | Không lưu tổng tiền độc lập vào state; tổng tiền tự động tính lại 100% chính xác mỗi khi số lượng món hoặc coupon thay đổi. |
| **3. Chống sập app khi rớt mạng hoặc lỗi Firebase** | **Cơ chế Resilient Hybrid Fallback (`firebaseService.js`)** | Toàn bộ lệnh gọi cloud đều bọc `try/catch`. Nếu mất mạng, hệ thống tự lưu vào AsyncStorage và báo `Lưu cục bộ (Offline)`, app không bao giờ văng. |
| **4. Triệt tiêu ảo giác của AI (AI Hallucination)** | **Hàm `validateAndMatchProducts` (`aiService.js`)** | AI thường tự bịa ra ID không có thật. Hàm này đối chiếu ID do Gemini trả về với danh mục thực tế của DummyJSON, chỉ render sản phẩm có thật. |
| **5. Bảo mật API Key không lộ secret** | **Quản lý khóa an toàn tại `env.js` & Cài đặt UI** | Không bao giờ hardcode API key lên Git; cho phép người dùng/giảng viên tự nhập Gemini API Key trực tiếp trên giao diện màn hình Cài đặt. |
| **6. Người dùng từ chối quyền thông báo** | **Non-blocking Permission Check (`notificationService.js`)** | Nếu bấm từ chối, luồng mua sắm và tạo đơn hàng vẫn hoàn tất 100%, trạng thái hiển thị rõ tại màn hình Cài đặt kèm hướng dẫn cấp lại. |

---

## PHẦN 3: BẢNG TRA CỨU CODE (THẦY CÔ BẢO MỞ ĐÂU MỞ ĐÓ TRONG ≤ 30 GIÂY)

Khi phỏng vấn hoặc quay video, thầy cô yêu cầu kiểm tra chức năng nào, mở ngay file đó:

| Chức năng cần chứng minh | Mở file này | Chỉ vào đoạn code nào? |
|---|---|---|
| **Gọi API sản phẩm & Phân trang** | [`src/services/productService.js`](file:///d:/MMA301_Assignment2_nghialpce181020/src/services/productService.js) | Dòng 22: Hàm `getProducts({ limit, skip, category, sortBy, order })`. |
| **Chống lặp FlatList khi cuộn đáy** | [`src/screens/ProductListScreen.js`](file:///d:/MMA301_Assignment2_nghialpce181020/src/screens/ProductListScreen.js) | Dòng 74: `if (loading || loadingMore || !hasMore || refreshing) return;`. |
| **Giỏ hàng & Derived Totals** | [`src/context/CartContext.js`](file:///d:/MMA301_Assignment2_nghialpce181020/src/context/CartContext.js) | Dòng 44: Hook `useMemo(() => { ... }, [items, coupon])` tính toán `itemCount`, `subtotal`, `finalTotal`. |
| **Lưu trữ bền vững AsyncStorage** | [`src/utils/storageHelper.js`](file:///d:/MMA301_Assignment2_nghialpce181020/src/utils/storageHelper.js) | Hàm `getItem` và `setItem` có `try/catch` bọc an toàn kèm `JSON.parse`. |
| **Firebase Cloud & Resilient Fallback** | [`src/services/firebaseService.js`](file:///d:/MMA301_Assignment2_nghialpce181020/src/services/firebaseService.js) | Dòng 24: Hàm `saveOrder` và `syncWishlist` tự bắt lỗi và fallback lưu vào `storageHelper`. |
| **Xin quyền & Bắn thông báo đơn hàng** | [`src/services/notificationService.js`](file:///d:/MMA301_Assignment2_nghialpce181020/src/services/notificationService.js) | Hàm `requestPermissionsAsync()` và `notifyOrderPlaced({ orderId, total })`. |
| **Gemini AI & Lọc chống ảo giác** | [`src/services/aiService.js`](file:///d:/MMA301_Assignment2_nghialpce181020/src/services/aiService.js) | Dòng 45: Hàm `validateAndMatchProducts(productIds, actualCatalog)` lọc bỏ ID giả mạo. |
| **Bảo mật cấu hình & API Key** | [`src/config/env.js`](file:///d:/MMA301_Assignment2_nghialpce181020/src/config/env.js) | Đối tượng `CONFIG` không chứa hardcode secret, đọc từ storage an toàn. |

---

## PHẦN 4: KỊCH BẢN NÓI TRONG 1–2 PHÚT (KHI QUAY CLIP HOẶC BẢO VỆ ĐỒ ÁN)

> *"Kính chào thầy/cô, em tên là **Lê Phước Nghĩa**, MSSV: **CE181020**, lớp môn học **MMA301**.
> 
> Về **Yêu cầu đề bài Assignment 2**, ứng dụng của em thực hiện chu trình mua sắm E-Commerce hoàn chỉnh gồm 6 phần:
> 1. Tải danh mục sản phẩm từ DummyJSON API với phân trang vô hạn `FlatList`, tìm kiếm từ khóa và lọc danh mục.
> 2. Màn hình chi tiết sản phẩm hiển thị thông số, đánh giá, tồn kho và kiểm tra số lượng mua tối đa.
> 3. Quản lý giỏ hàng với **Derived Totals** tự động tính tạm tính, mã giảm giá, phí ship và tổng tiền tức thì.
> 4. Lưu bền vững bằng **AsyncStorage** và đồng bộ đám mây qua **Firebase**, tự động chuyển sang chế độ Offline Fallback khi mất mạng.
> 5. Quản lý xin quyền thông báo hệ thống và tự động gửi thông báo khi đặt hàng hoặc thêm sản phẩm yêu thích.
> 6. Tích hợp trợ lý ảo **Google Gemini 2.5 Flash** tư vấn mua sắm, có hàm **Anti-Hallucination Guard** đối chiếu mã sản phẩm để triệt tiêu hoàn toàn ảo giác.
> 
> Về **Giải pháp & Công nghệ sử dụng**:
> * Dự án được em xây dựng trên nền tảng **React Native 0.78 với Expo SDK 58 và React 19**.
> * Điều hướng kết hợp **Bottom Tabs 5 màn hình** và **Native Stack** chuyển trang chi tiết.
> * Em chia tách kiến trúc rõ ràng theo nguyên tắc **Separation of Concerns**: màn hình UI chỉ hiển thị dữ liệu, toàn bộ logic được quản lý bởi **4 Contexts độc lập** và các **Services chuyên biệt**.
> * Em đặt cờ **Triple Guard** để chống tải lặp khi cuộn FlatList; dùng **useMemo** tính Derived Totals để tránh tình trạng lệch tiền (Stale State); và bọc toàn bộ tương tác Cloud/Storage trong **try/catch** để đảm bảo ứng dụng **100% không bao giờ bị crash**."*
