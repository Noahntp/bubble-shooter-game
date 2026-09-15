# KẾ HOẠCH KIỂM THỬ TOÀN DIỆN & TIÊU CHUẨN CHẤT LƯỢNG (TEST PLAN)

Tài liệu này xác định chiến lược kiểm thử, độ phủ kiểm thử tự động và quy trình nghiệm thu chất lượng (Quality Gate) cho dự án Bubble Pop Arcade.

---

## 1. Bộ Kiểm Thử Tự Động (Vitest Unit Tests)
Tệp kiểm thử tại `tests/gameplay.test.ts`, được thực thi và xác nhận qua lệnh `npm run test`:

| # | Kịch Bản Kiểm Thử | Kết Quả Kỳ Vọng | Trạng Thái |
|---|---|---|---|
| **1** | Tra cứu ô lân cận lục giác (Hex Neighbors) | Tính đúng tọa độ cho hàng chẵn (8 cột) và hàng lẻ so le (7 cột) | ĐẠT (PASS) |
| **2** | Nhận diện cụm Match-3 | Tìm chính xác cụm $\ge 3$ bóng cùng màu liền kề | ĐẠT (PASS) |
| **3** | Cụm lớn Match-4 & Match-5 | Thuật toán BFS loang đầy đủ qua các nhánh kết nối phức tạp | ĐẠT (PASS) |
| **4** | Bóng Cầu Vồng (Rainbow Wildcard) | Ghép nối với mọi màu lân cận; tự động ưu tiên cụm lớn nhất | ĐẠT (PASS) |
| **5** | Nổ Bom & Kích hoạt dây chuyền (Bomb Chain) | Phá hủy bán kính lục giác 3x3; lan truyền sang quả Bom kế tiếp (tối đa 3 lần) | ĐẠT (PASS) |
| **6** | Quét Sét toàn hàng (Lightning) | Quét sạch toàn bộ bóng trên cùng hàng, giới hạn chuỗi 2 lần | ĐẠT (PASS) |
| **7** | Bóng Đóng Băng & Tự Tan Băng (Freeze) | Bọc băng tối đa 8 bóng; ngăn ghép/rơi; tự tan sau 2 lượt | ĐẠT (PASS) |
| **8** | Phạt điểm Lời Nguyền (Curse) | Trừ điểm chuẩn xác theo xác suất (-100, -200, -300 điểm) | ĐẠT (PASS) |
| **9** | Phun bóng Bẫy (Trap) | Phun thêm tối đa 4 bóng thường; tự ngắt khi bàn cờ $> 85\%$ | ĐẠT (PASS) |
| **10**| Phát hiện bóng mất kết nối trần (Floating Bubbles) | Duyệt BFS từ trần hàng 0 phát hiện mọi bóng cô lập để kích hoạt rơi | ĐẠT (PASS) |
| **11**| Gia tăng hệ số Combo | Các lượt bắn dọn bóng liên tiếp tăng hệ số: x1.0 $\to$ x1.5 $\to$ x2.0 $\to$ x3.0 $\to$ x4.0 | ĐẠT (PASS) |
| **12**| Cơ chế chống ức chế (Anti-Frustration) | Bàn cờ quá tải $> 90\%$ hoàn toàn không sinh bóng phạt | ĐẠT (PASS) |
| **13**| Kiểm tra chống gian lận (Anti-Cheat API) | Tự động phát hiện và từ chối các phiên chơi có thời gian hoặc điểm số bất thường | ĐẠT (PASS) |

---

## 2. Tiêu Chuẩn Nghiệm Thu Hình Ảnh & Trải Nghiệm (Visual Quality Gate)

- [x] **Đồ Họa Bóng 3D**: Khối cầu dựng procedural độ nét cao với ánh sáng góc, đốm phản quang elip và phản chiếu đáy mềm mại.
- [x] **Tuyệt Đối Không Dùng Emoji**: Cả 8 loại bóng sử dụng biểu tượng vector đồ họa riêng biệt.
- [x] **Tia Ngắm Raycast Trơn Tru**: 8–10 đốm sáng mờ dần, dội tường sắc nét, dừng chuẩn xác tại điểm tiếp xúc.
- [x] **Cảm Giác Bắn (Game Feel)**: Pháo xoay mượt mà, có hiệu ứng thở nhẹ khi chờ và giật lùi (recoil 65ms) khi khai hỏa.
- [x] **Rung Màn Hình Tiết Chế**: Chỉ rung khi nổ Bom hoặc quét Sét lớn (thời lượng 120ms, biên độ thấp), không gây mỏi mắt.
- [x] **Âm Thanh Nội Hóa**: Hệ thống Web Audio API tổng hợp trực tiếp toàn bộ 13 sự kiện âm thanh, không lỗi thiếu file asset.
- [x] **Giao Diện Responsive**: Tự động co giãn tối ưu trên Desktop, Tablet và Màn hình điện thoại (16:9, 18:9, 19.5:9, 4:3).
- [x] **Hiệu Năng Vận Hành**: Đảm bảo 60 FPS ổn định trên nền tảng WebGL/Canvas; React tách biệt hoàn toàn khỏi vòng lặp vật lý.
