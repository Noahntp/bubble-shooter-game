# THIẾT KẾ MÀN CHƠI & ĐỘ KHÓ TIẾN TRÌNH (LEVEL DESIGN)

## 1. Triết Lý Thiết Kế Màn Chơi
Bubble Pop Arcade được thiết kế với lộ trình thử thách chuẩn Arcade thương mại:
- **Giai đoạn 1 (Màn 1–5 - Căn Bản & Làm Quen)**: Tập trung vào trải nghiệm bắn sướng tay, tạo chuỗi Combo lớn, làm quen với bóng Thưởng và Bom. Tỷ lệ bóng phạt là 0%.
- **Giai đoạn 2 (Màn 6–10 - Thử Thách & Chiến Thuật)**: Bổ sung bóng Sét, Băng giá và các mối hiểm họa (Lời Nguyền, Bẫy). Người chơi cần tính toán kỹ lưỡng hướng bắn, tận dụng bóng dự phòng và bảo toàn hệ số Combo.

---

## 2. Bảng Cấu Hình 10 Màn Chơi

| Màn | Tên Màn Chơi | Màu Sắc | Số Hàng Ban Đầu | Số Lượt Bắn | Điểm Mục Tiêu | Ngưỡng 1 / 2 / 3 Sao | Đặc Điểm Nổi Bật |
|---|---|---|---|---|---|---|---|
| **1** | Rừng Ngọc Bích | Đỏ, Xanh dương, Xanh lá | 5 | 26 | 1,200 | 800 / 1,200 / 1,800 | Hướng dẫn, Bóng Thưởng |
| **2** | Chân Trời Vàng | Đỏ, Xanh dương, Xanh lá, Vàng | 6 | 28 | 1,800 | 1,200 / 1,800 / 2,600 | Xuất hiện Bóng Bom |
| **3** | Hang Pha Lê | Đỏ, Xanh dương, Xanh lá, Tím | 6 | 30 | 2,400 | 1,600 / 2,400 / 3,400 | Xuất hiện Bóng Đóng Băng |
| **4** | Vết Nứt Cầu Vồng | Đủ 5 màu | 7 | 32 | 3,000 | 2,000 / 3,000 / 4,200 | Xuất hiện Bóng Cầu Vồng |
| **5** | Đỉnh Sấm Sét | Đủ 5 màu | 7 | 34 | 3,600 | 2,400 / 3,600 / 5,000 | Xuất hiện Bóng Sét |
| **6** | Mật Thất Bóng Đêm | Đủ 5 màu | 7 | 35 | 4,200 | 2,800 / 4,200 / 5,800 | Xuất hiện Lời Nguyền (phạt) |
| **7** | Vùng Cực Hạn | Đủ 5 màu | 8 | 36 | 4,800 | 3,200 / 4,800 / 6,500 | Xuất hiện Bóng Bẫy |
| **8** | Thánh Địa Băng Giá | Đủ 5 màu | 8 | 38 | 5,400 | 3,600 / 5,400 / 7,200 | Cụm bóng băng dày đặc |
| **9** | Thành Trì Hắc Diệu | Đủ 5 màu | 8 | 40 | 6,000 | 4,000 / 6,000 / 8,000 | Chuỗi Bom & Sét liên hoàn |
| **10**| Nhật Thực Huyền Thoại | Đủ 5 màu | 9 | 42 | 7,000 | 4,500 / 7,000 / 9,500 | Bàn cờ cao cấp đỉnh cao |

---

## 3. Tỷ Lệ Xuất Hiện Bóng Đặc Biệt Theo Cấp Độ

| Giai Đoạn Màn | Thường (Normal) | Thưởng (Bonus) | Cầu Vồng (Rainbow) | Bom (Bomb) | Sét (Lightning) | Băng (Freeze) | Nguyền (Curse) | Bẫy (Trap) |
|---|---|---|---|---|---|---|---|---|
| **Màn 1–5** | 85% | 8% | 3% | 2% | 0% | 2% | 0% | 0% |
| **Màn 6–10** | 78% | 8% | 4% | 3% | 2% | 3% | 1% | 1% |
| **Màn 11–20**| 70% | 8% | 4% | 4% | 3% | 3% | 4% | 4% |
| **Màn 21+** | 65% | 9% | 5% | 5% | 4% | 3% | 4% | 5% |

---

## 4. Quy Tắc Chống Ức Chế (Anti-Frustration)
1. **Bảo Vệ Quá Tải Bàn Cờ**:
   - Nếu mật độ bóng trên bàn cờ $> 85\%$, bóng Bẫy sẽ không sinh thêm bóng.
   - Nếu mật độ bóng trên bàn cờ $> 90\%$, bóng phạt (Lời Nguyền, Bẫy) hoàn toàn không xuất hiện.
2. **Chặn Chuỗi Phạt**: Tuyệt đối không sinh 3 bóng phạt liên tiếp.
3. **Bảo Đảm Cơ Hội Thưởng Sớm**: Trong 5 lượt bắn đầu tiên, luôn đảm bảo ít nhất 1 bóng Thưởng/Bom/Cầu Vồng để người chơi khai mở thế trận.
4. **Giới Hạn Biên Độ Thích Ứng**: Mọi điều chỉnh xác suất động chỉ được dao động tối đa $\pm 15\%$ so với xác suất gốc.
