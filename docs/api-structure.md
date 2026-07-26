# API Architecture Guide — BizArena 2026

- **Base URL:** `https://api.bizarena2026.com/v1`
- **Auth:** Bearer Token (JWT) trong header
- **Content-Type:** `application/json`

## Teams & Sessions

### `GET /team/dashboard`
Dữ liệu màn hình Dashboard.

```json
{
  "team_id": "T001",
  "current_round": 3,
  "status": "waiting_decisions",
  "metrics": { "cash_flow": 2500000, "market_share": 15.5, "brand_value": "A+" }
}
```

## Decision Flow

### `POST /decisions/commit`
Khóa và gửi quyết định (đẩy vào queue xử lý).

```json
{
  "round": 3,
  "decisions": { "price": 150, "marketing_budget": 50000, "production_volume": 1200, "rd_investment": 30000 }
}
```

## Lumina AI Advisor

### `GET /ai/advisor/suggestions`
Kịch bản "Nếu — Thì" hiển thị qua nhân vật Je m'appelle Hương.

```json
{
  "advisor_message": "Nếu tăng ngân sách Marketing thêm 15%, thị phần có thể đạt 18% ở vòng sau.",
  "risk_level": "low",
  "recommendations": ["Marketing Boost", "R&D Upgrade"]
}
```

## Shop & Inventory

- `POST /shop/purchase` — body `{"item_id": "MKT_BOOST_01"}`; trừ ví ảo, thêm vào inventory.
- `GET /inventory` — danh sách item/blueprint của đội.

## Instructor API

- `POST /instructor/grant-funds` — body `{"target_team_id": "T001", "amount": 500000}`.

## Error Codes

| HTTP | Business Code | Message | Mô tả |
|---|---|---|---|
| 400 | `ERR_INVALID_DATA` | Dữ liệu không hợp lệ | Thông số vượt khung cho phép |
| 403 | `ERR_ROUND_LOCKED` | Vòng chơi đã khóa | Gửi quyết định khi hết giờ / đã commit |
| 403 | `ERR_INSUFFICIENT_FUNDS` | Không đủ vốn | Ví ảo không đủ cho giao dịch |
| 404 | `ERR_ITEM_NOT_FOUND` | Vật phẩm không tồn tại | ID vật phẩm không hợp lệ |
| 409 | `ERR_ALREADY_COMMITTED` | Quyết định đã được gửi | Đội đã commit vòng này |
| 429 | `ERR_AI_LIMIT` | Lumina đang bận | Vượt giới hạn lượt hỏi AI trong vòng |
| 500 | `ERR_SIMULATION_FAIL` | Lỗi mô phỏng | Engine gặp sự cố khi xử lý vòng |
