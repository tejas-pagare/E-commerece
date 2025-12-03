# Admin Product API (React Frontend)

Base path: `/api/v1/admin`

All responses are JSON with `{ success: boolean, message?: string }` and optional payload fields.

## List Products
- Route: `GET /api/products` (alias: `GET /products`, `GET /products/details`)
- Payload: none
- Success 200:
```json
{
  "success": true,
  "products": [
    {
      "_id": "64f...",
      "title": "Product name",
      "price": 1999,
      "description": "...",
      "category": "...",
      "image": "https://...",
      "stock": true,
      "verified": false,
      "quantity": 10,
      "sellerId": { "_id": "63a...", "firstname": "...", "lastname": "...", "email": "..." },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-02T00:00:00.000Z"
    }
  ]
}
```
- Error 500:
```json
{ "success": false, "message": "Server Error" }
```

## Delete Product
- Route: `DELETE /product/:id`
- Payload: none
- Path params:
  - `id`: product ObjectId
- Success 200:
```json
{ "success": true, "message": "Product deleted successfully" }
```
- Error 400 (invalid id):
```json
{ "success": false, "message": "Invalid product id" }
```
- Error 404 (not found):
```json
{ "success": false, "message": "Product not found" }
```
- Error 500:
```json
{ "success": false, "message": "Server error" }
```

## Approve Product
- Route: `GET /product/approve/:id`
- Payload: none
- Path params:
  - `id`: product ObjectId
- Effect: sets `verified: true`
- Success 200:
```json
{ "success": true, "message": "Product approved successfully" }
```
- Error 400/404/500: same shape as Delete Product

## Disapprove Product
- Route: `GET /product/disapprove/:id`
- Payload: none
- Path params:
  - `id`: product ObjectId
- Effect: sets `verified: false`
- Success 200:
```json
{ "success": true, "message": "Product disapproved successfully" }
```
- Error 400/404/500: same shape as Delete Product

---

### Notes
- Use `GET /api/products` as the primary listing endpoint; `/products` and `/products/details` are maintained for backward compatibility.
- `sellerId` is populated with user fields.
- All IDs must be valid Mongo ObjectIds; invalid IDs return 400.
