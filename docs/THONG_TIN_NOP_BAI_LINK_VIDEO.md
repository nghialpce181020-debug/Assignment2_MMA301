# THÔNG TIN NỘP BÀI & LIÊN KẾT VIDEO CHECKPOINT

* **Học phần:** MMA301 – Multiplatform Mobile App Development  
* **Đề tài Assignment:** Assignment 2 – Integrated E-Commerce Mobile App  
* **Sinh viên thực hiện:** Lê Phước Nghĩa  
* **Mã số sinh viên:** CE181020  
* **Tài khoản Git:** `nghialpce181020-debug`  
* **Email sinh viên:** `nghialpce181020@fpt.edu.vn`

---

## 1. LIÊN KẾT MÃ NGUỒN GITHUB & VIDEO DRIVE

| Hạng mục nộp bài | Đường dẫn liên kết (URL) | Ghi chú |
|---|---|---|
| **🔗 GitHub Repository** | [https://github.com/nghialpce181020-debug/Assignment2_MMA301.git](https://github.com/nghialpce181020-debug/Assignment2_MMA301.git) | Mã nguồn đầy đủ, commit history theo tiến độ, header tác giả CE181020 đầu mỗi file |
| **🎥 Video Checkpoint (Google Drive Folder)** | **`[DÁN_LINK_GOOGLE_DRIVE_TỔNG_CỦA_BẠN_VÀO_ĐÂY]`** | Thư 


> ⚠️ **LƯU Ý QUAN TRỌNG KHI TẢI VIDEO LÊN GOOGLE DRIVE:**  
> 1. Chuột phải vào file/thư mục video trên Google Drive ➔ Chọn **Chia sẻ (Share)**.  
> 2. Đổi quyền truy cập chung thành: **"Bất kỳ ai có đường liên kết đều có thể xem" (Anyone with the link can view)** để giảng viên không bị chặn quyền truy cập.  
> 3. Copy đường link đó và dán thay thế vào vị trí **`[DÁN_LINK_GOOGLE_DRIVE_CỦA_BẠN_VÀO_ĐÂY]`** ở bảng trên và trong file `DANH_SACH_LINK_NOP_BAI.txt`.

---

## 2. NỘI DUNG TRÌNH BÀY TRONG VIDEO ĐÃ THỰC HIỆN

Video phỏng vấn tuân thủ 100% các tiêu chí hướng dẫn của giảng viên:

1. **Khuôn mặt & Nhận diện sinh viên:**
   * Có webcam quay rõ khuôn mặt, đọc to họ tên **Lê Phước Nghĩa**, MSSV **CE181020**, lớp học phần **MMA301**.
2. **Câu 1: Chứng minh hiểu yêu cầu & Phương pháp giải quyết (kèm công nghệ):**
   * Chiếu file tài liệu minh họa tóm tắt yêu cầu (`BAO_CAO_YEU_CAU_VA_GIAI_PHAP_MMA301.docx` hoặc `docs/CHUNG_MINH_YEU_CAU_GIAI_PHAP.md`).
   * Trình bày đầy đủ 12 Use Cases (R01 đến R12) và bộ công nghệ tiên tiến áp dụng: React Native 0.78, Expo SDK 58, React 19, Axios, AsyncStorage, Firebase Resilient Hybrid, Expo Notifications, Google Gemini 2.5 Flash, EAS Build.
3. **Câu 2: Minh chứng Git & Cấu trúc file:**
   * Mở GitHub cá nhân xác nhận đúng tài khoản `nghialpce181020-debug`, email trường và lịch sử commit theo tiến trình đúng hẹn.
   * Mở mã nguồn VS Code chỉ rõ header tác giả ở đầu mỗi file (`Tác giả: Lê Phước Nghĩa - CE181020 | Git Account: nghialpce181020-debug | Module ID`) và ý nghĩa từng thư mục/file theo nguyên tắc Separation of Concerns.
4. **Câu 3: Giải thích code & Luồng thực thi (Workflow):**
   * Giải thích chi tiết luồng Danh mục & Phân trang: hàm `loadMore()` với Triple Guard chống tải lặp.
   * Giải thích luồng Giỏ hàng & Derived Totals: hook `useMemo` tính toán tự động tránh Stale State.
   * Giải thích luồng Đồng bộ đám mây & Phục hồi lỗi: hàm `saveOrder()` / `syncWishlist()` với cơ chế Offline Fallback an toàn.
   * Giải thích luồng Trợ lý ảo AI: hàm `validateAndMatchProducts()` lọc bỏ mã ảo giác trước khi render.

