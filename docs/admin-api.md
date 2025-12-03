# Admin API (React Frontend)

Base path: `/api/v1/admin`

All responses are JSON with `{ success: boolean, message?: string }` and data.
IDs must be valid Mongo ObjectIds; invalid IDs return `400`.

## Auth
- Route: `GET /login`
- Method: GET
- Request: none (optional `?error=...`)
- Response 200:
```json
{ "success": true, "error": null }
```

- Route: `POST /dashboard`
- Method: POST
- Payload:
```json
{ "email": "adminLogin@gmail.com", "password": "swiftmart" }
```
- Responses:
  - 200:
  ```json
  { "success": true, "message": "Authenticated", "redirect": "/api/v1/admin/dashboard" }
  ```
  - 400:
  ```json
  { "success": false, "message": "Email and password are required" }
  ```
  - 401:
  ```json
  { "success": false, "message": "Invalid credentials" }
  ```

## Dashboard
- Route: `GET /dashboard`
- Method: GET
- Request: none
- Response 200:
```json
{
  "success": true,
  "metrics": {
    "totalCartAmount": 0,
    "customerOrders": 0,
    "sellerOrders": 0,
    "UserCount": 0,
    "CustomerCount": 0
  },
  "users": [ /* user documents */ ],
  "products": [ /* product documents */ ],
  "registeredProducts": [ /* same as products */ ]
}
```

## Blogs
- Route: `GET /blogs`
- Method: GET
- Response 200:
```json
{ "success": true, "blogs": [ /* blogs, newest first */ ] }
```

- Route: `GET /blogs/page` (React-compatible listing)
- Method: GET
- Response 200:
```json
{ "success": true, "blogs": [ /* blogs, newest first */ ] }
```

- Route: `GET /blog/create`
- Method: GET
- Response 200 (guidance for client-side form):
```json
{ "success": true, "message": "Render blog creation UI on the client. Use POST /api/v1/admin/blog to create." }
```

- Route: `POST /blog`
- Method: POST (multipart/form-data)
- Form fields: `title`, `content`, `author`, optional file field `image`
- Responses:
  - 201:
  ```json
  { "success": true, "message": "Blog created successfully", "blog": { /* created blog */ } }
  ```
  - 500:
  ```json
  { "success": false, "message": "Failed to create blog" }
  ```

## Customers
- Route: `GET /customers`
- Method: GET
- Response 200:
```json
{ "success": true, "customers": [ /* users */ ] }
```

- Route: `GET /api/customers` (alternate path)
- Method: GET
- Response 200:
```json
{ "success": true, "customers": [ /* users */ ] }
```

- Route: `DELETE /customer/:id`
- Method: DELETE
- Responses:
  - 200:
  ```json
  { "success": true, "message": "User deleted successfully" }
  ```
  - 400:
  ```json
  { "success": false, "message": "Invalid user id" }
  ```
  - 404:
  ```json
  { "success": false, "message": "No user with given id exists" }
  ```

## Products
See `docs/admin-product-api.md` for complete details.

Key endpoints (all JSON):
- `GET /api/products` (aliases: `/products`, `/products/details`)
- `DELETE /product/:id`
- `GET /product/approve/:id`
- `GET /product/disapprove/:id`

## Sellers & Vendors
- Route: `GET /seller`
- Method: GET
- Response 200:
```json
{ "success": true, "sellers": [ /* sellers */ ] }
```

- Route: `GET /api/sellers` (alternate path)
- Method: GET
- Response 200:
```json
{ "success": true, "sellers": [ /* sellers */ ] }
```

- Route: `GET /seller/details`
- Method: GET
- Response 200:
```json
{ "success": true, "sellers": [ /* sellers */ ], "message": "Seller retireved Successfully" }
```

- Route: `GET /seller/approve/:id`
- Method: GET
- Responses:
  - 200: `{ "success": true, "message": "Seller approved successfully" }`
  - 400: `{ "success": false, "message": "Invalid seller id" }`
  - 404: `{ "success": false, "message": "No Such user exist" }`

- Route: `DELETE /seller/:id`
- Method: DELETE
- Responses:
  - 200: `{ "success": true, "message": "Seller deleted successfully" }`
  - 400: `{ "success": false, "message": "Invalid seller id" }`
  - 404: `{ "success": false, "message": "Seller not found" }`

- Route: `GET /vendors` (returns sellers as vendors)
- Method: GET
- Response 200:
```json
{ "success": true, "vendors": [ /* sellers */ ] }
```

## Orders
- Route: `GET /orders`
- Method: GET
- Response 200: grouped view (via POST handler too)
```json
{ "<userId>": { "_id": "<userId>", "name": "...", "email": "...", "orders": [ /* orders */ ] } }
```

- Route: `POST /orders`
- Method: POST
- Request: none (reuses same grouped handler)
- Response 200: same as GET /orders

- Route: `GET /orders/:userId`
- Method: GET
- Responses:
  - 200: `{ "success": true, "orders": [ /* user orders */ ] }`
  - 400: `{ "success": false, "message": "Invalid user id" }`
  - 404: `{ "success": false, "message": "User not found" }`

- Route: `PUT /orders/:orderId/status`
- Method: PUT
- Payload:
```json
{ "orderStatus": "Pending|Processing|Shipped|Delivered|Cancelled|Returned" }
```
- Responses:
  - 200: `{ "success": true, "message": "Order status updated successfully", "order": { /* order */ } }`
  - 400: `{ "success": false, "message": "Invalid order id|Invalid order status" }`
  - 404: `{ "success": false, "message": "Order not found" }`

- Route: `GET /orders/user/:orderId`
- Method: GET
- Responses:
  - 200:
  ```json
  { "success": true, "userId": "...", "userData": { "name": "...", "email": "...", "orders": [ /* orders */ ] } }
  ```
  - 400: `{ "success": false, "message": "Invalid order id" }`
  - 404: `{ "success": false, "message": "Order not found" }`

## Second-hand (Sell Product)
- Route: `GET /dashboard/sellproduct`
- Method: GET
- Response 200:
```json
{ "success": true, "products": [ { "id": "...", "username": "...", "items": "...", "fabric": "...", "size": "...", "gender": "...", "usageDuration": 1, "readableUsage": "> 1 year|< 6 months", "imageSrc": null, "clothesDate": "...", "timeSlot": "...", "userStatus": "...", "adminStatus": "...", "estimated_value": 0 } ] }
```

- Route: `POST /dashboard/sellproduct`
- Method: POST
- Payload:
```json
{ "id": "<sellProductId>", "userStatus": "Approved|Rejected|Pending" }
```
- Responses:
  - 200: `{ "success": true, "message": "User status updated" }`
  - 400: `{ "success": false, "message": "Valid id is required" }`

## Delivery (Placeholder)
- Route: `GET /delivery`
- Method: GET
- Response 200:
```json
{ "success": true, "message": "Use client UI to manage deliveries." }
```
