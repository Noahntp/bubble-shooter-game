# LUẬT CHƠI & CƠ CHẾ GAME — BUBBLE POP ARCADE

## 1. Giới Thiệu Tổng Quan
Bubble Pop Arcade là game giải đố bắn bóng hiện đại phong cách Arcade Casual. Người chơi điều khiển bệ pháo ở cạnh dưới màn hình, nhắm bắn các quả bóng màu sắc vào lưới lục giác so le phía trên để tạo chuỗi bóng cùng màu và dọn sạch bàn cờ.

---

## 2. Mục Tiêu & Điều Kiện Thắng / Thua
- **Điều Kiện Thắng (Chiến Thắng)**:
  - Dọn sạch toàn bộ bóng trên bàn cờ.
  - Xếp hạng Sao (1 đến 3 Sao) dựa trên tổng số điểm đạt được so với ngưỡng điểm của màn:
    - ★ (1 Sao): Hoàn thành cơ bản.
    - ★★ (2 Sao): Có nhiều chuỗi Combo đẹp mắt.
    - ★★★ (3 Sao): Điểm số vượt bậc và tiết kiệm tối đa lượt bắn.
- **Điều Kiện Thua (Thua Cuộc)**:
  - **Chạm Vạch Nguy Hiểm**: Bất kỳ quả bóng nào trên bàn cờ hạ xuống chạm hoặc vượt qua vạch đỏ nguy hiểm ($y \ge 660\text{px}$).
  - **Hết Lượt Bắn**: Hết toàn bộ lượt đạn khi bàn cờ vẫn còn bóng.

---

## 3. Thao Tác Điều Khiển
- **Ngắm Bắn**: Di chuyển chuột hoặc chạm vuốt trên màn hình cảm ứng. Đường nhắm chấm tròn phát sáng sẽ hiển thị quỹ đạo chính xác và phản xạ dội tường.
- **Khai Hỏa**: Thả ngón tay hoặc nhả chuột để bắn bóng bay lên.
- **Đổi Bóng Dự Phòng (Swap)**: Nhấn vào ô chứa bóng kế tiếp hoặc nút "Đổi bóng" góc trái dưới để hoán đổi quả bóng đang nạp với quả bóng dự phòng.

---

## 4. Công Thức Tính Điểm
$$\text{Tổng Điểm} = (\text{Điểm Match Cơ Bản} + \text{Điểm Bóng Đặc Biệt} + \text{Điểm Bóng Rơi}) \times \text{Hệ Số Combo}$$

### 4.1 Điểm Nổ Match-3 Cơ Bản
- 3 bóng: **+30 điểm**
- 4 bóng: **+50 điểm**
- 5 bóng: **+80 điểm**
- 6 bóng: **+120 điểm**
- Từ 7 bóng trở lên: **+120 điểm + 20 điểm cho mỗi bóng thêm**

### 4.2 Điểm Bóng Rơi (Bóng Mất Kết Nối Với Trần)
Khi bóng bị cắt đứt đường nối với trần hàng 0, chúng sẽ rơi tự do:
$$\text{Điểm Rơi} = 20 \times (\text{Số lượng bóng rơi})^{1.15}$$

### 4.3 Hệ Số Nhân Combo Liên Tiếp
Mỗi lượt bắn liên tiếp làm nổ bóng sẽ gia tăng hệ số Combo:
- Lượt 1: **x1.0**
- Lượt 2: **x1.5**
- Lượt 3: **x2.0**
- Lượt 4: **x3.0**
- Từ lượt 5 trở đi: **x4.0**
*(Nếu một lượt bắn không làm nổ bóng nào, hệ số Combo sẽ reset về x1.0).*

### 4.4 Thưởng Bóng Thừa (Ammunition Bonus)
Khi hoàn thành màn chơi, mỗi lượt đạn chưa sử dụng sẽ cộng thêm **+150 điểm thưởng**.
