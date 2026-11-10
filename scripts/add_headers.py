import os

files_meta = {
    'App.js': (
        'Root Application & Context Providers Entry',
        'Điểm khởi nhập chính của ứng dụng, bọc toàn bộ hệ thống bằng các Context Provider (Product, Cart, Wishlist, Notification) và AppNavigator.'
    ),
    'src/config/env.js': (
        'R01, R08, R09, R10 - Centralized App Configuration & Secrets',
        'Quản lý cấu hình tập trung: API Base URL, Firebase Keys, Notification Channels, Gemini API endpoint. Bảo đảm an toàn bí mật.'
    ),
    'src/utils/storageHelper.js': (
        'R07 - Local Persistence Helper (AsyncStorage)',
        'Wrapper an toàn cho AsyncStorage với try/catch và JSON parse guard, phục vụ lưu trữ giỏ hàng, danh sách yêu thích và cài đặt offline.'
    ),
    'src/utils/formatters.js': (
        'R04, R06 - Data Transformation & Currency Formatter',
        'Cung cấp các hàm định dạng giá tiền USD ($), tính giá khuyến mãi sau giảm và định dạng ngày tháng.'
    ),
    'src/services/productService.js': (
        'R01, R02, R03, R04 - Remote Product Service',
        'Gọi DummyJSON REST API qua Axios: phân trang (limit/skip), lọc theo danh mục, tìm kiếm và lấy chi tiết sản phẩm.'
    ),
    'src/services/firebaseService.js': (
        'R08 - Firebase Cloud & Resilient Hybrid Storage',
        'Quản lý lưu trữ đám mây cho danh sách yêu thích và đơn hàng; tự động kích hoạt cơ chế Offline Fallback khi mất mạng.'
    ),
    'src/services/notificationService.js': (
        'R09 - Expo Notifications & Permission Management',
        'Quản lý xin quyền thông báo hệ thống, cấu hình Android Notification Channel, và kích hoạt thông báo sự kiện.'
    ),
    'src/services/aiService.js': (
        'R10 - Google Gemini AI Integration & Anti-Hallucination Guard',
        'Kết nối Google Gemini 2.5 Flash REST API, gửi context danh mục và đối chiếu ID (Anti-Hallucination) ngăn ngừa thông tin ảo.'
    ),
    'src/context/ProductContext.js': (
        'R01, R02, R03 - Global Product State Management',
        'Quản lý trạng thái danh mục sản phẩm, phân trang vô hạn (Infinite Scroll), tìm kiếm, lọc danh mục, kéo để làm mới (Pull-to-refresh).'
    ),
    'src/context/CartContext.js': (
        'R05, R06, R07 - Cart State & Derived Totals Management',
        'Quản lý giỏ hàng (thêm, cập nhật số lượng, xóa), tính Derived Totals qua useMemo, áp dụng mã ưu đãi và lưu AsyncStorage.'
    ),
    'src/context/WishlistContext.js': (
        'R08 - Wishlist & Cloud Sync State Management',
        'Quản lý danh sách sản phẩm yêu thích (toggle thêm/bớt), đồng bộ Firebase Cloud và lưu trữ cục bộ dự phòng.'
    ),
    'src/context/NotificationContext.js': (
        'R09 - Notification State Management',
        'Theo dõi trạng thái cấp quyền thông báo OS, cung cấp các hàm kích hoạt thông báo đặt hàng/yêu thích cho toàn ứng dụng.'
    ),
    'src/components/ProductCard.js': (
        'R02, R05, R08 - Reusable Product Card Component',
        'Hiển thị thẻ sản phẩm gồm hình ảnh, tên, giá gốc, giá sau giảm, đánh giá sao, nút yêu thích nhanh và nút thêm vào giỏ hàng.'
    ),
    'src/components/EmptyState.js': (
        'R02, R03, R05 - Reusable Empty State UI',
        'Giao diện thân thiện khi danh sách sản phẩm trống, giỏ hàng chưa có hàng hoặc tìm kiếm không thấy kết quả.'
    ),
    'src/components/ErrorState.js': (
        'R01, R11 - Reusable Error & Retry Component',
        'Hiển thị thông báo lỗi mạng / tải dữ liệu và cung cấp nút Thử lại (Retry) giúp phục hồi ứng dụng an toàn.'
    ),
    'src/screens/ProductListScreen.js': (
        'R01, R02, R03 - Product Catalog Screen',
        'Màn hình danh mục sản phẩm với thanh tìm kiếm, bộ lọc chip danh mục, FlatList phân trang vô hạn kèm cờ guard chống tải lặp.'
    ),
    'src/screens/ProductDetailScreen.js': (
        'R04, R05, R08 - Product Detail Screen',
        'Màn hình chi tiết sản phẩm: xem ảnh, thông số kỹ thuật, đánh giá khách hàng, chọn số lượng kiểm tra tồn kho và thêm vào giỏ.'
    ),
    'src/screens/CartScreen.js': (
        'R05, R06, R08, R09 - Shopping Cart & Checkout Screen',
        'Màn hình giỏ hàng hiển thị danh sách món hàng, nhập mã ưu đãi, bảng tóm tắt chi phí (Derived Totals), và thanh toán kích hoạt thông báo.'
    ),
    'src/screens/WishlistScreen.js': (
        'R08 - Wishlist & Order History Screen',
        'Màn hình quản lý danh sách yêu thích và lịch sử đơn hàng với chỉ báo trạng thái đồng bộ Firebase Cloud / Offline.'
    ),
    'src/screens/AiAdvisorScreen.js': (
        'R10 - Gemini AI Advisor & Product Comparison Screen',
        'Màn hình trợ lý ảo AI tư vấn mua sắm và so sánh sản phẩm thông minh, lọc bỏ ảo giác và hiển thị thẻ sản phẩm tương tác thực tế.'
    ),
    'src/screens/SettingsNotificationScreen.js': (
        'R09, R10 - System Settings & Notification Permission Screen',
        'Màn hình cài đặt quyền thông báo hệ thống OS, nút thử nghiệm thông báo và giao diện nhập API Key an toàn cho Gemini AI.'
    ),
    'src/navigation/AppNavigator.js': (
        'Navigation Architecture (Tabs + Stacks)',
        'Định tuyến luồng di chuyển với 5 Tabs chính (Shop, Advisor, Cart có badge, Wishlist, Settings) và Stack Navigator cho ProductDetail.'
    )
}

for file_path, (req_id, purpose) in files_meta.items():
    if not os.path.exists(file_path):
        print(f'Not found: {file_path}')
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'Tác giả: Lê Phước Nghĩa' in content:
        print(f'Already has header: {file_path}')
        continue
    header = f"""/**
 * Project: MMA301 Assignment 2 - Integrated E-Commerce Mobile App
 * Tác giả: Lê Phước Nghĩa
 * MSSV: CE181020
 * Git Account: nghialpce181020-debug
 * Module / Requirement: {req_id}
 * Ý nghĩa & Mục đích: {purpose}
 */

"""
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(header + content)
    print(f'Updated header for: {file_path}')
