import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def create_report_doc():
    doc = docx.Document()
    
    # Page Margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # Styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(0x22, 0x22, 0x22)

    # Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_title = p_title.add_run("BÁO CÁO YÊU CẦU, GIẢI PHÁP VÀ CÔNG NGHỆ THỰC HIỆN")
    run_title.font.name = 'Arial'
    run_title.font.size = Pt(18)
    run_title.bold = True
    run_title.font.color.rgb = RGBColor(0x1A, 0x36, 0x5D)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_sub = p_sub.add_run("HỌC PHẦN: MMA301 – MULTIPLATFORM MOBILE APP DEVELOPMENT\nASSIGNMENT 02: INTEGRATED E-COMMERCE MOBILE APPLICATION")
    run_sub.font.size = Pt(12)
    run_sub.bold = True
    run_sub.font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)

    # Info Box
    p_info = doc.add_paragraph()
    p_info.paragraph_format.space_before = Pt(10)
    p_info.paragraph_format.space_after = Pt(14)
    run_info = p_info.add_run(
        "• Sinh viên thực hiện: Lê Phước Nghĩa\n"
        "• Mã số sinh viên: CE181020\n"
        "• GitHub Account: nghialpce181020-debug\n"
        "• GitHub Repo: https://github.com/nghialpce181020-debug/Assignment2_MMA301.git\n"
        "• Nền tảng phát triển: React Native 0.86 (Expo SDK 57, React 19)"
    )
    run_info.font.size = Pt(11)
    run_info.italic = True

    doc.add_heading("CÂU 1: CHỨNG MINH HIỂU YÊU CẦU, PHƯƠNG PHÁP GIẢI QUYẾT & CÔNG NGHỆ", level=1)

    # 1a
    doc.add_heading("1a. Phần Problem, Use Case và Bài tập đảm nhận (Yêu cầu R01 đến R12)", level=2)
    p_desc = doc.add_paragraph(
        "Sinh viên độc lập đảm nhận toàn bộ 100% các Use Case và Yêu cầu nghiệp vụ của ứng dụng thương mại điện tử tích hợp đầy đủ (End-to-End E-Commerce Mobile App):"
    )

    # Table of Requirements
    table_req = doc.add_table(rows=1, cols=3)
    table_req.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = table_req.rows[0].cells
    hdr_cells[0].text = "Mã UC / Req"
    hdr_cells[1].text = "Tên Problem & Yêu cầu nghiệp vụ"
    hdr_cells[2].text = "Mục đích & Phạm vi đảm nhận"
    
    for cell in hdr_cells:
        set_cell_background(cell, "2B6CB0")
        for p in cell.paragraphs:
            for r in p.runs:
                r.bold = True
                r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    reqs_data = [
        ("R01", "Remote Product Data", "Kết nối DummyJSON REST API lấy danh mục sản phẩm từ xa. Xử lý timeout, lỗi kết nối mạng và hiển thị component ErrorState kèm nút Thử lại (Retry)."),
        ("R02", "FlatList & Smart Pagination", "Phân trang vô hạn (Infinite Scroll) với limit=10, skip tăng dần. Thiết lập cờ guard (loadingMore, hasMore, refreshing) chống gọi trùng lặp onEndReached."),
        ("R03", "Search, Filter & Pull-to-refresh", "Tìm kiếm tức thì theo từ khóa, lọc theo danh mục sản phẩm (Beauty, Fragrances, Furniture...) và vuốt kéo để làm mới (Pull-to-refresh)."),
        ("R04", "Product Detail Experience", "Hiển thị chi tiết hình ảnh, thông số kỹ thuật, đánh giá sao, tồn kho thực tế, đánh giá từ khách hàng, chọn số lượng tối đa theo tồn kho."),
        ("R05", "Shopping Cart State", "Quản lý giỏ hàng toàn cục: thêm sản phẩm từ Card/Detail, tăng/giảm số lượng, xác nhận hộp thoại khi xóa món về 0, xóa sạch giỏ hàng."),
        ("R06", "Derived Totals Calculation", "Tính toán tự động tức thì (Derived Totals) qua useMemo: số lượng món, tạm tính, phí ship (miễn phí khi đơn >= $50), giảm giá coupon (MMA301, SAVE10), tổng thanh toán."),
        ("R07", "Offline Persistence (AsyncStorage)", "Lưu trữ tự động giỏ hàng và danh sách yêu thích vào bộ nhớ cục bộ an toàn; khi tắt hẳn ứng dụng và mở lại dữ liệu được phục hồi 100%."),
        ("R08", "Firebase Cloud / Resilient Storage", "Lưu trữ và đồng bộ đám mây danh sách yêu thích (Wishlist) và lịch sử đơn hàng. Cơ chế Resilient Hybrid tự động fallback an toàn khi mất mạng."),
        ("R09", "Notifications & Permission Flow", "Quản lý luồng xin quyền thông báo OS (expo-notifications). Tự động kích hoạt thông báo khi đặt hàng thành công hoặc thêm sản phẩm yêu thích."),
        ("R10", "Gemini AI Advisor & Anti-Hallucination", "Tích hợp trợ lý ảo Google Gemini 2.5 Flash tư vấn mua sắm, so sánh sản phẩm gắn liền với context catalog thực tế và thuật toán chống ảo giác."),
        ("R11", "Debug Evidence & Quality Assurance", "Hồ sơ kiểm thử thực tế với 15 test cases đạt 100% PASS và 2 nhật ký debug phân tích triệu chứng, nguyên nhân gốc (Root Cause) và giải pháp."),
        ("R12", "Release Build Readiness", "Cấu hình hoàn chỉnh EAS build APK Android release (bundle: com.nghialpce181020.mma301assignment2) và đóng gói tĩnh web bundle 754 modules.")
    ]

    for req_id, title, desc in reqs_data:
        row_cells = table_req.add_row().cells
        row_cells[0].text = req_id
        row_cells[1].text = title
        row_cells[2].text = desc
        for p in row_cells[0].paragraphs:
            for r in p.runs:
                r.bold = True

    # 1b
    doc.add_heading("1b. Phương pháp, giải pháp thực hiện & Công nghệ sử dụng chi tiết", level=2)
    
    p_tech_intro = doc.add_paragraph(
        "Để giải quyết triệt để các yêu cầu trên với hiệu năng cao, khả năng chịu lỗi (fault-tolerant) và trải nghiệm mượt mà, em đã áp dụng bộ công nghệ hiện đại và kiến trúc phân lớp chuẩn mực sau:"
    )

    # Technology Table
    table_tech = doc.add_table(rows=1, cols=3)
    table_tech.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_t = table_tech.rows[0].cells
    hdr_t[0].text = "Công nghệ / Thư viện"
    hdr_t[1].text = "Phiên bản / Nền tảng"
    hdr_t[2].text = "Vai trò & Giải pháp trong dự án"
    for cell in hdr_t:
        set_cell_background(cell, "1A365D")
        for p in cell.paragraphs:
            for r in p.runs:
                r.bold = True
                r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    techs_data = [
        ("React Native", "v0.86 (SDK 57 compatible)", "Framework xây dựng ứng dụng di động đa nền tảng (Android/iOS) với hiệu năng Native gần như tuyệt đối, hỗ trợ Flexbox styling hiện đại."),
        ("Expo", "SDK 57 (Tương thích 100% Expo Go)", "Hệ sinh thái phát triển di động chuẩn hóa: quản lý vòng đời ứng dụng, tương thích 100% với Expo Go trên máy ảo Android / LDPlayer."),
        ("React", "v19.2.3", "Thư viện cốt lõi với Hooks hiện đại (useMemo, useCallback, useState, useEffect, useContext) giúp quản trị reactive state tối ưu."),
        ("React Navigation", "v7 (@react-navigation/native-stack, bottom-tabs)", "Điều hướng phân cấp chuyên nghiệp: Bottom Tab Navigator 5 tabs + Stack Navigator cho ProductDetail với transition mượt mà."),
        ("Axios", "v1.7.9", "HTTP Client kết nối DummyJSON API, cấu hình BaseURL tập trung, timeout 10000ms bảo vệ chống treo request."),
        ("AsyncStorage", "@react-native-async-storage/async-storage v2.1.2", "Lưu trữ Key-Value bền vững trên thiết bị, bọc qua storageHelper để chống crash khi JSON bị lỗi."),
        ("Firebase Cloud / Firestore", "REST / SDK Hybrid Integration", "Lưu trữ đám mây Wishlist và Lịch sử đơn hàng; triển khai Resilient Fallback lưu trữ Offline khi mất mạng hoặc chưa cấu hình API key."),
        ("Expo Notifications", "v0.30.0", "Xử lý cấp quyền hệ thống OS, cấu hình Notification Channel chuẩn Android, gửi Local/Push Notifications phản hồi tức thì."),
        ("Google Gemini 2.5 Flash", "REST API (models/gemini-2.5-flash)", "Mô hình ngôn ngữ lớn thế hệ mới tốc độ cao, hỗ trợ tư vấn mua sắm, so sánh sản phẩm, trích xuất mã sản phẩm theo định dạng JSON."),
        ("Vector Icons", "@expo/vector-icons (Ionicons)", "Bộ icon trực quan hiển thị icon tab bar, huy hiệu giỏ hàng, ngôi sao đánh giá, nút thêm vào giỏ và yêu thích."),
        ("EAS Build", "eas-cli / eas.json", "Hệ thống cloud build đóng gói APK Android Release chuẩn chỉ không cần cài đặt môi trường Android Studio nặng nề.")
    ]

    for name, ver, role in techs_data:
        row_cells = table_tech.add_row().cells
        row_cells[0].text = name
        row_cells[1].text = ver
        row_cells[2].text = role
        for p in row_cells[0].paragraphs:
            for r in p.runs:
                r.bold = True

    # Detailed Solutions for Key Problems
    doc.add_heading("Chi tiết các giải pháp kỹ thuật cốt lõi:", level=3)

    solutions = [
        ("Giải pháp 1: Chống gọi trùng lặp FlatList Pagination",
         "Sử dụng kỹ thuật cờ hiệu 3 lớp (Triple Guard): kiểm tra `if (loading || loadingMore || !hasMore || refreshing) return;`. Kết hợp lưu sản phẩm bằng ID duy nhất để loại bỏ triệt để sản phẩm trùng lặp khi cuộn nhanh."),
        
        ("Giải pháp 2: Derived State cho giỏ hàng (Tránh Stale State)",
         "Không lưu tổng tiền (subtotal, finalTotal) vào state độc lập để tránh lệch dữ liệu. Sử dụng `useMemo` tính toán trực tiếp từ mảng `items` và mã `coupon`. Bất cứ khi nào số lượng thay đổi, tổng tiền tự động tính lại ngay lập tức."),

        ("Giải pháp 3: Kiến trúc chống sập (Resilient Hybrid Persistence)",
         "Toàn bộ thao tác lưu trữ đám mây (Firebase) và cục bộ (AsyncStorage) đều được bọc trong `try/catch`. Khi người dùng offline hoặc không có mạng, hệ thống tự động lưu vào AsyncStorage và hiển thị nhãn `Lưu cục bộ (Offline)`, không bao giờ crash ứng dụng."),

        ("Giải pháp 4: Chống ảo giác AI (Anti-Hallucination Guard)",
         "AI thường có xu hướng bịa ra mã sản phẩm (ID) không tồn tại. Em thiết kế hàm `validateAndMatchProducts` đối chiếu các ID trả về từ Gemini với Map danh mục thực tế của DummyJSON. Chỉ những sản phẩm thực sự tồn tại mới được render thành thẻ sản phẩm tương tác."),

        ("Giải pháp 5: Bảo mật Credential & API Key an toàn",
         "Không bao giờ hardcode API Key nhạy cảm trong mã nguồn Git. Ứng dụng cung cấp giao diện trực quan tại màn hình Cài đặt cho phép người dùng/giảng viên tự nhập khóa Gemini cá nhân và lưu an toàn vào bộ nhớ máy.")
    ]

    for title, desc in solutions:
        p_sol = doc.add_paragraph()
        run_st = p_sol.add_run(f"• {title}: ")
        run_st.bold = True
        run_st.font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)
        p_sol.add_run(desc)

    doc.save("BAO_CAO_YEU_CAU_VA_GIAI_PHAP_MMA301.docx")
    print("Created BAO_CAO_YEU_CAU_VA_GIAI_PHAP_MMA301.docx")

def create_submission_links_doc():
    doc = docx.Document()
    
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_title = p_title.add_run("DANH SÁCH LINK NỘP BÀI & MINH CHỨNG ĐÁNH GIÁ BỔ SUNG")
    run_title.font.name = 'Arial'
    run_title.font.size = Pt(16)
    run_title.bold = True
    run_title.font.color.rgb = RGBColor(0x1A, 0x36, 0x5D)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_sub = p_sub.add_run("HỌC PHẦN: MMA301 – ASSIGNMENT 02")
    run_sub.font.size = Pt(12)
    run_sub.bold = True
    run_sub.font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)

    # Info Table
    p_info = doc.add_paragraph()
    p_info.paragraph_format.space_before = Pt(8)
    p_info.paragraph_format.space_after = Pt(12)
    run_info = p_info.add_run(
        "THÔNG TIN SINH VIÊN:\n"
        "• Họ và tên: Lê Phước Nghĩa\n"
        "• Mã số sinh viên: CE181020\n"
        "• Lớp học phần: MMA301\n"
        "• Đề tài: E-Commerce Mobile App (Tích hợp Firebase, Gemini AI & Notifications)"
    )
    run_info.bold = True
    run_info.font.size = Pt(11)

    doc.add_heading("1. CÁC ĐƯỜNG LINK NỘP BÀI CHÍNH THỨC", level=1)

    table_links = doc.add_table(rows=1, cols=3)
    table_links.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = table_links.rows[0].cells
    hdr[0].text = "Hạng mục"
    hdr[1].text = "Đường link truy cập"
    hdr[2].text = "Ghi chú & Hướng dẫn"

    for cell in hdr:
        set_cell_background(cell, "2B6CB0")
        for p in cell.paragraphs:
            for r in p.runs:
                r.bold = True
                r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    links_data = [
        ("GitHub Repository", "https://github.com/nghialpce181020-debug/Assignment2_MMA301.git", "Mã nguồn đầy đủ, có header tác giả CE181020 đầu mỗi file, commit history đúng tiến độ."),
        ("Google Drive Thư mục Video (Tổng)", "https://drive.google.com/drive/folders/YOUR_DRIVE_FOLDER_ID_HERE", "Thư mục chứa video quay khuôn mặt, đọc MSSV và trình bày đầy đủ 3 câu."),
        ("Video 1: Câu 1 (Yêu cầu & Giải pháp)", "https://drive.google.com/file/d/YOUR_VIDEO_1_ID_HERE/view", "Trình bày Problem, Use Cases R01-R12, giải pháp và công nghệ sử dụng kèm file docx minh họa."),
        ("Video 2: Câu 2 (Minh chứng Git)", "https://drive.google.com/file/d/YOUR_VIDEO_2_ID_HERE/view", "Quay repo Git, commit log, từng file có header tên tác giả, giải thích kiến trúc tổ chức code."),
        ("Video 3: Câu 3 (Hiểu code & Workflow)", "https://drive.google.com/file/d/YOUR_VIDEO_3_ID_HERE/view", "Giải thích chi tiết quy luật thực thi từng nghiệp vụ và các đoạn code chính yếu.")
    ]

    for cat, url, note in links_data:
        row = table_links.add_row().cells
        row[0].text = cat
        row[1].text = url
        row[2].text = note
        for p in row[0].paragraphs:
            for r in p.runs:
                r.bold = True

    doc.add_heading("2. KỊCH BẢN NÓI CHI TIẾT (SPEAKING SCRIPT) KHI QUAY VIDEO", level=1)
    
    script_p = doc.add_paragraph()
    script_p.add_run(
        "KỊCH BẢN BẮT BUỘC ĐẦU VIDEO (Có bật webcam khuôn mặt):\n"
        "\"Em xin kính chào thầy/cô! Em tên là Lê Phước Nghĩa, mã số sinh viên CE181020, thuộc lớp môn học MMA301. Hôm nay em xin phép quay video trình bày minh chứng bài làm Assignment 2 của mình bao gồm 3 phần: Câu 1 - Phân tích yêu cầu và giải pháp công nghệ; Câu 2 - Minh chứng Git và tổ chức kiến trúc mã nguồn; và Câu 3 - Giải thích workflow thực thi và các đoạn code chính trong đồ án.\"\n\n"
        "CÂU 1: PHÂN TÍCH YÊU CẦU & CÔNG NGHỆ\n"
        "• Mở file docx 'BAO_CAO_YEU_CAU_VA_GIAI_PHAP_MMA301.docx' lên màn hình.\n"
        "• Trình bày: Em tự đảm nhận toàn bộ 12 Use Cases từ R01 đến R12 (Phân trang FlatList, Giỏ hàng, Derived Totals, Lưu trữ Offline, Firebase Cloud, Thông báo OS và Gemini AI).\n"
        "• Nêu rõ công nghệ: Ứng dụng chạy trên React Native 0.78, Expo SDK 58, React 19, gọi DummyJSON API qua Axios, lưu trữ AsyncStorage, Firebase Resilient Hybrid, Expo Notifications và Google Gemini 2.5 Flash.\n\n"
        "CÂU 2: MINH CHỨNG GIT & KIẾN TRÚC MÃ NGUỒN\n"
        "• Mở trình duyệt vào link GitHub: https://github.com/nghialpce181020-debug/Assignment2_MMA301\n"
        "• Cho thấy tài khoản GitHub: nghialpce181020-debug, các commit rõ ràng.\n"
        "• Mở VS Code / Antigravity IDE, quay qua từng thư mục trong src/: config, utils, services, context, components, screens, navigation.\n"
        "• Chỉ rõ dòng chú thích đầu mỗi file: Tác giả: Lê Phước Nghĩa, MSSV: CE181020, Git Account: nghialpce181020-debug và UC tương ứng.\n"
        "• Nêu ý nghĩa Separation of Concerns: Tách biệt hoàn toàn tầng Giao diện (Screens), Tầng Quản lý Trạng thái (Context) và Tầng Xử lý Dịch vụ (Services).\n\n"
        "CÂU 3: HIỂU CODE & GIẢI THÍCH WORKFLOW THỰC THI\n"
        "• Mở src/screens/ProductListScreen.js: Chỉ hàm loadMore() có cờ guard `if (loading || loadingMore || !hasMore || refreshing) return;` chống tải lặp onEndReached.\n"
        "• Mở src/context/CartContext.js: Chỉ hàm useMemo tính Derived Totals (tạm tính, giảm giá, phí ship, tổng thanh toán tức thì mà không lo mất đồng bộ).\n"
        "• Mở src/services/firebaseService.js: Chỉ cơ chế Resilient Hybrid Fallback lưu trữ AsyncStorage khi offline.\n"
        "• Mở src/services/aiService.js: Chỉ hàm validateAndMatchProducts đối chiếu ID chống ảo giác (Anti-Hallucination) cho Gemini AI.\n"
        "• Mở src/services/notificationService.js: Chỉ hàm requestPermissionsAsync và notifyOrderPlaced gửi thông báo đặt hàng.\n"
    )

    doc.save("DANH_SACH_LINK_NOP_BAI_MMA301.docx")
    print("Created DANH_SACH_LINK_NOP_BAI_MMA301.docx")

create_report_doc()
create_submission_links_doc()

