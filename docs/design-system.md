# Design System – BizOn Bật Nghiệp 2026 (3D Claymorphism)

Hệ thống thiết kế chính thức của BizOn Bật Nghiệp.

## Design Tokens

### Bảng màu (Primary Palette)
| Token | Hex | Dùng cho |
|---|---|---|
| Primary | `#006687` | Action buttons, active states |
| Primary Container | `#00c4ff` | Highlight cards, badges |
| Surface Bright | `#f4faff` | Nền chính |
| Deep Teal | `#033337` | Headings, text tương phản cao |

### Typography
- **Plus Jakarta Sans** – Headline / Display
- **Manrope** – Body / Reports

### Bo góc & đổ bóng (Clay Effect)
- Border radius card/button: `24px`
- Outer shadow: `0 10px 30px -5px rgba(0, 102, 135, 0.05)`
- Inner shadow (độ khối): `inset 0 -4px 0 rgba(0, 0, 0, 0.05)`

### Component tiêu biểu (Clay Card)
```html
<div class="bg-white rounded-[24px] p-6
  shadow-[0_10px_30px_-5px_rgba(0,102,135,0.05),inset_0_-4px_0_rgba(0,0,0,0.05)]">
  <!-- Content -->
</div>
```

## Kiến trúc màn hình
- **Shell layout:** `flex-col` với `BottomNavBar` cố định (`fixed bottom-0`).
- Luồng chính: Splash → Login → Dashboard → Quyết định → Lumina AI → Báo cáo.
- Gamification: Cây kỹ năng, Cửa hàng & Kho đồ, Thành tựu, Chứng chỉ, Bảng xếp hạng.

## Hiệu ứng hoạt họa
- **Loading:** logo chữ B với hiệu ứng Pulse.
- **Thành công:** `createConfetti()`.
- **Biến cố thị trường (Suy thoái):** class `animate-shake` (CSS keyframes).

## Nhân vật & thương hiệu
- Cố vấn AI **Lumina – "Je m'appelle Hương"** (2 phiên bản: Office Suit quốc tế, Áo dài Việt Nam).
- Logo chữ **B 3D** gradient Primary → Primary Container.
- Bộ icon menu 3D: Trang chủ, Kỹ năng, Hồ sơ, Nhiệm vụ, Bảng xếp hạng, Cửa hàng, Cài đặt.

> Ảnh nhân vật Lumina đã được tích hợp tại `assets/character/`:
> `lumina-ao-dai.png` (bản Việt Nam – màn hình Splash, Đăng nhập, Chứng chỉ) và
> `lumina-vest.png` (bản công sở – Dashboard, Cố vấn AI, khung chat).
> Bộ icon menu 3D hiện dùng emoji placeholder – sẽ thay bằng bộ icon 3D độc quyền.
