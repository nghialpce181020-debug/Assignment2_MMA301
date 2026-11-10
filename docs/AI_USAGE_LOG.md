# NHẬT KÝ SỬ DỤNG AI CÓ TRÁCH NHIỆM (AI USAGE LOG)

**Học phần:** MMA301 – Multiplatform Mobile App Development  
**Assignment:** 02 – Integrated E-Commerce Mobile App  
**Sinh viên:** Le Phuoc Nghia (MSSV: CE181020)  
**Chính sách tuân thủ:** Tuân thủ mục 0.2 và mục 9 (AI Usage & Engineering Practice).

---

## BẢNG GHI NHẬN SỬ DỤNG AI (Section 9.4)

| # | Task / Prompt / Reference | Mục đích | Output AI có dùng? | Tôi đã sửa và tinh chỉnh gì? | Tôi kiểm chứng thế nào? |
| :-: | :--- | :--- | :-: | :--- | :--- |
| **1** | "Thiết kế cấu trúc phân tầng Separation of Concerns cho ứng dụng thương mại điện tử React Native Expo" | Lên khung kiến trúc chuẩn chia tách giữa Screen, Context, Service, Storage và Config. | Có (dùng ý tưởng kiến trúc) | Tự viết mã nguồn thực tế, chia tách rõ ràng file `env.js`, `storageHelper.js`, và các file `Context` độc lập. | Kiểm tra cấu trúc thư mục, bảo đảm không có logic fetch hay API gọi trực tiếp trong Screen component. |
| **2** | "Cách viết hàm kiểm tra chống ảo giác (hallucination guard) cho kết quả trả về từ Gemini AI khi tích hợp với catalog" | Tìm giải pháp bảo đảm AI chỉ gợi ý các sản phẩm thực sự có trong danh mục của cửa hàng. | Có (tham khảo logic validation) | Viết hàm `validateAndMatchProducts` sử dụng `Map` để tra cứu theo `id` thực tế, tự động loại bỏ các ID giả mạo và đếm số lượng lỗi ảo giác. | Viết test case giả lập đầu vào gồm ID hợp lệ (1) và ID giả mạo (99999). Hàm đã loại bỏ thành công ID 99999 và giữ lại ID 1. |
| **3** | "Cấu trúc schema cho DummyJSON products và xử lý phân trang bằng `skip` và `limit`" | Xác định các trường dữ liệu cần hiển thị (thumbnail, discountPercentage, rating, stock, reviews). | Có (dùng thông tin endpoint) | Thêm cơ chế chuẩn hóa dữ liệu, bọc trong `try/catch` và trả về đối tượng `{ products, total, hasMore, error }` đồng nhất. | Chạy lệnh test Node kiểm tra trực tiếp kết nối tới `https://dummyjson.com/products?limit=2`. |
| **4** | "Cách thiết lập Notification Handler và Channel cho Android với `expo-notifications`" | Cấu hình kênh thông báo Android và xử lý hiển thị banner thông báo khi ứng dụng đang mở ở foreground. | Có (tham khảo cấu hình API) | Bổ sung hàm kiểm tra trạng thái quyền (`getStatus`), chỉ gửi khi `granted === true`; nếu bị từ chối sẽ trả về lý do rõ ràng mà không gây lỗi. | Chạy nút "Thử gửi thông báo ngay" trên màn hình Cài đặt, quan sát popup thông báo của hệ thống. |
| **5** | "Xử lý xung đột phiên bản giữa Expo SDK 58 và `@react-native-async-storage/async-storage`" | Tìm hiểu nguyên nhân cảnh báo đỏ của `expo-doctor`. | Có (tham khảo giải pháp) | Sử dụng lệnh `npx expo install --fix` để tự động hạ phiên bản về đúng bản tương thích chuẩn của SDK 58. | Chạy lại `npx expo-doctor`, đạt 20/20 checks passed tuyệt đối. |
