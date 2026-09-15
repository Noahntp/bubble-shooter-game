# TÀI LIỆU THIẾT KẾ KIẾN TRÚC GAME — BUBBLE SHOOTER
**Phiên bản:** 1.0.0  
**Nền tảng mục tiêu:** Web (Tương thích Desktop, Tablet, Mobile)  
**Công nghệ lõi:** React, TypeScript, Phaser 3, Web Audio API, NestJS / Kiến trúc REST API  
**Phong cách hình ảnh:** Modern Casual / Premium Arcade Puzzle (Dark Mode, Spherical 3D Shading, Micro-VFX, Không dùng Emoji)

---

## 1. TỔNG QUAN KIẾN TRÚC & PHÂN TÁCH TRÁCH NHIỆM

Hệ thống được tổ chức thành 3 tầng độc lập, tách biệt rõ ràng:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           TẦNG GIAO DIỆN REACT                          │
│   (HUD, Điểm/Combo, Menu chọn màn, Modal Thắng/Thua, Tạm dừng, Âm thanh)│
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Event Bridge / Reactive Store
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        TẦNG GAME ENGINE PHASER 3                        │
│  (GameScene, Lưới lục giác, Đường nhắm Raycast, Vật lý, VFX, Shaders)   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ State Machine: IDLE ➔ AIMING ➔ SHOOTING ➔ ATTACH ➔ RESOLVE ➔ TURN │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────── Pipeline Xác Định ──────────────────────┐  │
│  │ GridManager ➔ CollisionManager ➔ MatchFinder ➔ EffectResolver    │  │
│  │ ➔ SpecialBubbleManager ➔ FloatingDetector ➔ Score/ComboManager  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Async REST / Local Fallback
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           TẦNG BACKEND / API                            │
│ (NestJS: Xác thực phiên chơi, Chống gian lận, Cấu hình màn, Bảng xếp hạng)│
└─────────────────────────────────────────────────────────────────────────┘
```

### Nguyên Tắc Phân Tách Bắt Buộc
1. **Phaser quản lý Game Loop 60 FPS**: Vật lý bắn bóng, tính toán phản xạ tường, particle pooling, canvas rendering, hoạt ảnh lưới và va chạm được thực thi hoàn toàn trong Phaser, tuyệt đối không xử lý trong React.
2. **React quản lý Luồng Người Dùng & UI Tổng Quan**: Header HUD, thanh tiến độ, các bảng thông báo kết quả (Chiến Thắng, Thua Cuộc, Tạm Dừng), chọn màn chơi được render bằng HTML/CSS tối ưu hóa phần cứng.
3. **Cầu Nối Sự Kiện Hai Chiều (Event Bridge)**: Sử dụng EventEmitter (`GameEventBridge`) phát các sự kiện từ Phaser sang React (`SCORE_UPDATED`, `COMBO_UPDATED`, `LEVEL_WON`, `LEVEL_LOST`) và truyền lệnh từ React vào Phaser (`PAUSE_GAME`, `RESUME_GAME`, `RESTART_LEVEL`, `LOAD_LEVEL`, `SWAP_BUBBLES`).

---

## 2. HỆ THỐNG LƯỚI LỤC GIÁC (HEXAGONAL STAGGERED GRID)

Lưới bóng được xây dựng theo hệ tọa độ lục giác so le (Staggered Hex Grid). Vị trí logic được quản lý chặt chẽ theo cặp `(row, col)`.

### 2.1 Quy Ước Tọa Độ (So Le Hàng Chẵn)
- **Hàng chẵn (`row % 2 === 0`)**: Gồm `GRID_COLS` ô (8 bóng). Tâm bóng đầu tiên bắt đầu tại $x = \text{LEFT\_MARGIN} + R$.
- **Hàng lẻ (`row % 2 === 1`)**: Gồm `GRID_COLS - 1` ô (7 bóng). Thụt lùi vào một khoảng $+R$ so với hàng chẵn, tâm bóng đầu tiên tại $x = \text{LEFT\_MARGIN} + 2R$.
- **Khoảng cách dọc giữa các hàng (Vertical Spacing)**:
  $$\Delta y = R \times \sqrt{3} \approx R \times 1.732$$
- **Khoảng cách ngang giữa các bóng (Horizontal Spacing)**:
  $$\Delta x = 2 \times R$$

### 2.2 Thuật Toán Tìm Ô Lân Cận (Neighbors)
Hàng chẵn và hàng lẻ có độ lệch delta khác nhau:
- **Hàng chẵn (`row % 2 === 0`)**:
  `(-1, -1)`, `(-1, 0)`, `(0, -1)`, `(0, +1)`, `(+1, -1)`, `(+1, 0)`
- **Hàng lẻ (`row % 2 === 1`)**:
  `(-1, 0)`, `(-1, +1)`, `(0, -1)`, `(0, +1)`, `(+1, 0)`, `(+1, +1)`

Mỗi ô ứng viên đều được kiểm tra giới hạn biên: $0 \le r < \text{GRID\_ROWS}$ và $0 \le c < \text{getColsInRow}(r)$.

---

## 3. MÁY TRẠNG THÁI HỮU HẠN (FINITE STATE MACHINE)

Vòng lặp game chuyển đổi mượt mà qua các trạng thái rời rạc, tránh hoàn toàn code spaghetti:

```
    ┌────────────────────────┐
    │          IDLE          │◄───────────────────────┐
    └───────────┬────────────┘                        │
                │ Nhấn giữ / Kéo chuột                │
                ▼                                     │
    ┌────────────────────────┐                        │
    │         AIMING         │                        │
    └───────────┬────────────┘                        │
                │ Thả chuột / Bắn                     │
                ▼                                     │
    ┌────────────────────────┐                        │
    │        SHOOTING        │                        │
    └───────────┬────────────┘                        │
                │ Va chạm trần hoặc bóng trên lưới    │
                ▼                                     │
    ┌────────────────────────┐                        │
    │       ATTACHING        │ (Hít vào hốc lục giác) │
    └───────────┬────────────┘                        │
                │ Hoàn thành hít bóng                 │
                ▼                                     │
    ┌────────────────────────┐                        │
    │      MATCH_CHECK       │                        │
    └───────────┬────────────┘                        │
                │ Match >= 3 hoặc trúng bóng đặc biệt │
                ▼                                     │
    ┌────────────────────────┐                        │
    │     EFFECT_RESOLVE     │ (Hàng đợi xác định)    │
    └───────────┬────────────┘                        │
                │ Nổ bóng & kích hoạt hiệu ứng xong   │
                ▼                                     │
    ┌────────────────────────┐                        │
    │     FLOATING_CHECK     │ (BFS từ trần row 0)    │
    └───────────┬────────────┘                        │
                │ Phát hiện bóng mất kết nối?         │
                ▼                                     │
    ┌────────────────────────┐                        │
    │      DROP_CASCADE      │ (Rơi so le gia tốc)    │
    └───────────┬────────────┘                        │
                │ Hoạt ảnh rơi kết thúc               │
                ▼                                     │
    ┌────────────────────────┐                        │
    │     SCORE_UPDATE       │ (Cộng điểm & Combo)    │
    └───────────┬────────────┘                        │
                │ Đánh giá tình trạng bàn cờ          │
                ▼                                     │
    ┌────────────────────────┐                        │
    │     CHECK_WIN_LOSE     │                        │
    └───────────┬────────────┘                        │
                │ Chưa thắng và chưa thua             │
                ▼                                     │
    ┌────────────────────────┐                        │
    │       NEXT_TURN        │────────────────────────┘
    └────────────────────────┘
```

---

## 4. 8 LOẠI BUBBLE & HÀNG ĐỢI HIỆU ỨNG XÁC ĐỊNH (EFFECT RESOLVER)

### Thứ Tự Ưu Tiên Giải Quyết (Priority Pipeline)
Nhằm loại trừ triệt để tình trạng race condition và xung đột bất đồng bộ, mọi hiệu ứng được xử lý tuần tự qua `EffectResolver`:

1. **MATCH**: Tìm kiếm cụm $\ge 3$ bóng cùng màu (kết hợp bóng Cầu Vồng).
2. **BOMB (Bom)**: Nổ lục giác diện tích 3x3 (+10 điểm/bóng, kích hoạt Bom/Thưởng/Lời Nguyền phụ cận, chuỗi tối đa 3).
3. **LIGHTNING (Sét)**: Quét sạch toàn bộ bóng trên cùng hàng (+15 điểm/bóng, chuỗi tối đa 2).
4. **RAINBOW (Cầu Vồng)**: Tự động đại diện cho màu có cụm lớn nhất xung quanh.
5. **BONUS (Thưởng)**: Quay số ngẫu nhiên (+100 50%, +250 30%, +500 15%, +1000 5%). Tối đa 2 bóng trên bàn.
6. **FREEZE (Đóng Băng)**: Đóng băng tối đa 8 bóng xung quanh trong 2 lượt (bóng băng không rơi, không nổ, không match).
7. **CURSE (Lời Nguyền)**: Phạt điểm khi bị phá hủy (50%: -100, 35%: -200, 15%: -300 điểm).
8. **TRAP (Bẫy)**: Phun thêm tối đa 4 bóng thường vào các ô trống liền kề (vô hiệu hóa nếu bàn cờ $> 85\%$).
9. **FLOATING**: Duyệt đồ thị BFS từ trần hàng 0; mọi bóng mất kết nối sẽ rơi xuống.
10. **SCORE & COMBO**: Áp dụng hệ số Combo nhân điểm, hiển thị số điểm bay (+100, +1200, COMBO x3).

---

## 5. HỆ THỐNG BẮN BÓNG, ĐƯỜNG NHẮM & DỘI TƯỜNG

1. **Raycasting Phản Xạ**:
   - Vector hướng bắn $\vec{v} = (\cos \theta, \sin \theta)$ từ bệ pháo $(260, 740)$.
   - Giới hạn góc ngắm an toàn (tránh bắn ngược xuống dưới hoặc bắn quá ngang).
   - Tự động phản xạ dội tường trái ($x = 50$) và tường phải ($x = 470$) theo công thức: $\vec{v}' = (-v_x, v_y)$.
2. **Đường Nhắm Trực Quan (Aim Guide)**:
   - 8–10 điểm tròn phát sáng cách đều nhau dọc quỹ đạo.
   - Độ mờ (opacity) giảm dần từ pháo đến đầu tia ngắm kết hợp hiệu ứng xung nhịp nhẹ nhàng.
3. **Vật Lý Bắn & Hít Lưới (Snapping)**:
   - Tốc độ bắn chuẩn xác 1400 px/giây.
   - Khi va chạm: tính khoảng cách Euclidean nhỏ nhất tới các ô lục giác trống lân cận và thực hiện hoạt ảnh hít từ tính (50ms).

---

## 6. HỆ THỐNG CHỐNG ỨC CHẾ (ANTI-FRUSTRATION) & ĐỘ KHÓ ĐỘNG

1. **Phân Bố Penalty Hợp Lý**: Khoảng cách tối thiểu giữa 2 bóng Lời Nguyền hoặc Bẫy.
2. **Bảo Vệ Bàn Cờ Quá Tải**: Nếu mật độ bóng $> 85\%$, bóng Bẫy sẽ không phun thêm bóng. Nếu $> 90\%$, hoàn toàn ngừng xuất hiện bóng phạt.
3. **Chặn Chuỗi Phạt**: Tuyệt đối không sinh 3 bóng phạt liên tiếp.
4. **Bảo Đảm Thưởng Đầu Game**: Trong 5 lượt bắn đầu tiên của mỗi màn, luôn đảm bảo ít nhất 1 cơ hội xuất hiện bóng Thưởng/Bom/Cầu Vồng.
5. **Giới Hạn Điều Chỉnh Độ Khó Động**: Tỷ lệ xuất hiện chỉ dao động tối đa $\pm 15\%$ so với bảng tỷ lệ gốc.

---

## 7. ĐỒ HỌA PROCEDURAL 3D & ÂM THANH NỘI BỘ (KHÔNG DÙNG EMOJI)

1. **Shader Procedural 3D Trên Canvas**:
   - Gradient tỏa tròn cầu nổi với nguồn sáng đặt góc trên bên trái ($135^\circ$).
   - Đốm sáng phản quang bóng bẩy (specular highlight) hình elip mềm mại.
   - Phản quang hắt đáy (floor bounce light) và viền sáng kim loại tinh tế.
   - Biểu tượng vector riêng biệt khắc chìm/nổi cho từng loại bóng đặc biệt.
2. **Hệ Thống Âm Thanh Web Audio API**:
   - Tự động tổng hợp sóng âm polyphonic đa âm sắc cho toàn bộ 13 sự kiện âm thanh.
   - Hoạt động tức thì trên mọi trình duyệt, không độ trễ, không lỗi thiếu file asset, tích hợp điều chỉnh âm lượng và lưu trạng thái vào `localStorage`.
