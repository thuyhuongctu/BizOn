# Database Schema — BizOn Bật Nghiệp 2026

Cấu trúc bảng dữ liệu cốt lõi (theo hồ sơ Stitch, dự kiến PostgreSQL).

## 1. Users & Teams

### `users`
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Định danh người dùng |
| `email` | String | Email đăng nhập |
| `full_name` | String | Tên hiển thị |
| `role` | Enum | `CEO`, `CFO`, `CMO`, `COO`, `SEC` |
| `team_id` | UUID (FK) | → `teams.id` |
| `avatar_url` | String | Ảnh avatar / nhân vật 3D |

### `teams`
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Định danh đội |
| `team_name` | String | Tên đội |
| `class_id` | UUID (FK) | Lớp học của giảng viên |
| `balance` | Decimal | Số dư ví ảo |
| `total_xp` | Integer | Tổng XP tích lũy |
| `level` | Integer | Cấp độ hiện tại |

## 2. Simulation Flow

### `rounds`
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | |
| `game_id` | UUID (FK) | Phiên chơi |
| `round_number` | Integer | 1–6 |
| `status` | Enum | `active`, `locked`, `processing`, `completed` |
| `market_event_id` | UUID (FK) | Biến cố thị trường của vòng |

### `decisions`
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | |
| `team_id` | UUID (FK) | |
| `round_id` | UUID (FK) | |
| `price` | Decimal | Giá bán |
| `marketing_budget` | Decimal | Ngân sách quảng cáo |
| `production_volume` | Integer | Sản lượng |
| `is_committed` | Boolean | Đã khóa quyết định |

## 3. Finance & Reports

### `financial_reports`
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | |
| `team_id` | UUID (FK) | |
| `round_id` | UUID (FK) | |
| `revenue` | Decimal | Doanh thu |
| `net_profit` | Decimal | Lợi nhuận ròng |
| `market_share` | Float | % thị phần |
| `inventory_stock` | Integer | Tồn kho còn lại |

## 4. Shop & Inventory

### `items`
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | |
| `name` | String | VD: Marketing Boost |
| `description` | Text | Tác dụng |
| `price` | Decimal | Giá mua |
| `item_type` | Enum | `consumable`, `blueprint`, `booster` |

### `inventory`
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | |
| `team_id` | UUID (FK) | |
| `item_id` | UUID (FK) | |
| `quantity` | Integer | Số lượng sở hữu |
| `is_active` | Boolean | Đang kích hoạt |
