# CHI TIẾT 8 LOẠI BÓNG & QUY TẮC HIỆU ỨNG ĐẶC BIỆT

Tài liệu này mô tả chi tiết cơ chế hoạt động, tỷ lệ kích hoạt, hiệu ứng dây chuyền và quy tắc giải quyết của 8 loại bóng trong game.

---

## 1. BÓNG THƯỜNG (NORMAL) 🔴 🔵 🟢 🟡 🟣
- **Vai trò**: Yếu tố cốt lõi của trò chơi.
- **Cơ chế**: Tạo cụm từ 3 quả cùng màu trở lên để làm nổ.
- **Điểm số**:
  - 3 bóng: +30 điểm
  - 4 bóng: +50 điểm
  - 5 bóng: +80 điểm
  - 6 bóng: +120 điểm
  - 7+ bóng: +120 + 20 điểm/bóng thêm
- **Hình ảnh**: Đổ bóng khối cầu 3D với 5 màu sắc cao cấp (Đỏ, Xanh dương, Xanh lá, Vàng, Tím), đốm sáng bóng gương và phản quang cạnh đáy.

---

## 2. BÓNG THƯỞNG (BONUS) ⭐
- **Vai trò**: Phần thưởng giá trị cao.
- **Cơ chế**: Không tham gia Match-3 màu. Được kích nổ khi nằm cạnh một cụm bóng nổ hoặc bị phá bởi Bom/Sét.
- **Phần thưởng ngẫu nhiên**:
  - **+100 điểm**: 50% xác suất
  - **+250 điểm**: 30% xác suất
  - **+500 điểm**: 15% xác suất
  - **+1000 điểm**: 5% xác suất
- **Giới hạn**: Tối đa 2 bóng Thưởng trên bàn cờ cùng lúc. Không bao giờ xuất hiện quá sát bệ pháo.
- **Hình ảnh**: Khối cầu mạ vàng ánh kim lấp lánh khắc ngôi sao 4 cánh tỏa sáng.

---

## 3. BÓNG CẦU VỒNG (RAINBOW) 🌈
- **Vai trò**: Bóng vạn năng (Wildcard).
- **Cơ chế**: Có thể ghép đôi với bất kỳ màu sắc nào bên cạnh.
- **Thứ tự ưu tiên ghép**:
  1. Cụm màu liền kề có số lượng bóng lớn nhất.
  2. Nếu số lượng bằng nhau: chọn cụm gần điểm va chạm nhất.
  3. Dự phòng xác định theo thứ tự màu (Đỏ $\to$ Xanh dương $\to$ Xanh lá $\to$ Vàng $\to$ Tím).
- **Giới hạn**: Tối đa 1 bóng trên bàn cờ ở giai đoạn đầu.
- **Hình ảnh**: Khối cầu tán sắc lăng kính cầu vồng với biểu tượng hoa sao 6 cánh.

---

## 4. BÓNG BOM (BOMB) 💣
- **Vai trò**: Vũ khí nổ diện rộng chiến thuật.
- **Cơ chế**: Kích hoạt khi được bắn trực tiếp hoặc bị nổ bởi bóng/bom lân cận.
- **Vùng nổ**: Phá hủy toàn bộ ô lục giác trong phạm vi bán kính 3x3 xung quanh.
- **Điểm số**: +10 điểm cho mỗi quả bóng bị nổ.
- **Hiệu ứng dây chuyền**: Có thể kích nổ các quả Bom khác lọt vào vùng nổ (chuỗi tối đa 3 lần).
- **Tương tác**: Kích hoạt luôn bóng Thưởng hoặc Lời Nguyền nằm trong phạm vi nổ. Rung lắc camera nhẹ (120ms).
- **Hình ảnh**: Khối cầu kim loại đen mun với lõi năng lượng đỏ rực rỡ và vạch ngắm chữ thập.

---

## 5. BÓNG SẤT (LIGHTNING) ⚡
- **Vai trò**: Quét sạch hàng ngang tức thì.
- **Cơ chế**: Bắn trúng hoặc kích hoạt lân cận sẽ phóng tia sét hủy diệt toàn bộ bóng trên cùng hàng đó.
- **Điểm số**: +15 điểm cho mỗi bóng bị quét sạch.
- **Hiệu ứng dây chuyền**: Kích hoạt chuỗi với bóng Sét khác (tối đa 2 lần).
- **Hình ảnh**: Khối cầu điện quang xanh tím mang biểu tượng tia chớp sắc lẹm kèm hiệu ứng chớp sáng laser toàn hàng.

---

## 6. BÓNG ĐÓNG BĂNG (FREEZE) ❄️
- **Vai trò**: Đóng băng hỗ trợ chiến thuật.
- **Cơ chế**: Khi kích hoạt, đóng băng tối đa 8 quả bóng xung quanh trong vòng **2 lượt**.
- **Đặc tính khi bị đóng băng**:
  - Không rơi (tự bám trụ ngay cả khi mất kết nối trần).
  - Không tham gia ghép Match-3.
  - Không bị kích nổ bởi bom hay sét cho đến khi tan băng.
  - Tự động tan băng về trạng thái bình thường sau 2 lượt.
- **Hình ảnh**: Lớp vỏ bọc băng tuyết pha lê trong suốt với các vết nứt tinh thể tuyết.

---

## 7. BÓNG LỜI NGUYỀN (CURSE) ☠️
- **Vai trò**: Cạm bẫy trừ điểm rủi ro cao.
- **Cơ chế**: Không tham gia Match-3. Khi bị phá hủy sẽ phạt điểm người chơi:
  - **-100 điểm**: 50% xác suất
  - **-200 điểm**: 35% xác suất
  - **-300 điểm**: 15% xác suất
- **Cơ chế bảo vệ**: Chống chuỗi phạt vô hạn; hoàn toàn ngừng xuất hiện khi bàn cờ quá tải $> 90\%$.
- **Hình ảnh**: Khối cầu tím thẫm huyền bí mang cổ tự ma thuật màu đỏ thẫm.

---

## 8. BÓNG BẪY (TRAP) 🧨
- **Vai trò**: Cạm bẫy gia tăng độ khó cho bàn cờ.
- **Cơ chế**: Khi bị phá hủy, phun thêm tối đa 4 quả bóng thường vào các ô trống lân cận.
- **Cơ chế bảo vệ**: Tự động vô hiệu hóa nếu mật độ bóng trên bàn cờ $> 85\%$.
- **Hình ảnh**: Khối cầu cam cảnh báo công nghiệp với biểu tượng tam giác nguy hiểm.

---

## 9. THỨ TỰ ƯU TIÊN TRONG HÀNG ĐỢI EFFECT RESOLVER
Để tránh xung đột bất đồng bộ, mọi hành động xử lý tuần tự theo pipeline:
1. `MATCH` (Cụm cùng màu)
2. `BOMB` (Nổ bom)
3. `LIGHTNING` (Quét sét)
4. `RAINBOW` (Giải quyết cầu vồng)
5. `BONUS` (Cộng điểm thưởng)
6. `FREEZE` (Đóng băng)
7. `CURSE` (Trừ điểm phạt)
8. `TRAP` (Phun bóng bẫy)
9. `FLOATING` (Kiểm tra bóng mất kết nối rơi xuống)
10. `SCORE` & `COMBO` (Tính điểm tổng và hệ số combo)
