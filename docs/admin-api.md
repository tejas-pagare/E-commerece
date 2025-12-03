# Admin API (React-compatible)

This document describes the admin endpoints and the dashboard analytics response to power charts in the React UI.
## GET `/api/v1/admin/dashboard`

Returns summary metrics and chart-ready time-series for the last N days.

- Query params
  - `days`: number of days window; allowed values `7|30|90` (default `30`)
  - `tz`: timezone for date bucketing; allowed values `UTC|local` (default `UTC`)
- Summary
  - `users`: total number of users
  - `products`: total number of products
  - `sellers`: total number of sellers
  - `managers`: total number of managers
  - `orders`: total number of orders
  - `totalRevenue`: sum of `Order.totalAmount`
  - `totalOrders`: same as `orders` (for convenience)
- Series (each item is `{ date: 'YYYY-MM-DD', value: number, label: string }`)
  - `usersCreated`: daily count of users created
  - `productsAdded`: daily count of products created
  - `ordersCount`: daily count of orders created
  - `revenue`: daily sum of order `totalAmount`

- Top
  - `products`: latest verified products (title, price, category, createdAt)
  - `sellers`: latest sellers (firstname, lastname, email, createdAt)

- Breakdowns (for pie/bar charts)
  - `categories`: array of `{ category, count }` — product count per category
  - `sellers`: array of `{ sellerId, productCount, seller: { firstname, lastname, email } }`

- Window
  - `start`: start ISO date string (inclusive)
  - `end`: end ISO date string (inclusive)
  - `days`: number of days window
  - `tz`: timezone mode used (`UTC` or `local`)
Example response:

```
{
  "success": true,
  "message": "Dashboard analytics",
  "data": {
    "summary": {
      "users": 1234,
      "products": 456,
      "sellers": 78,
      "managers": 2,
      "orders": 321,
      "totalRevenue": 98765.43,
      "totalOrders": 321
    },
    "series": {
      "usersCreated": [ { "date": "2025-11-04", "value": 3, "label": "usersCreated" }, ... ],
      "productsAdded": [ { "date": "2025-11-04", "value": 5, "label": "productsAdded" }, ... ],
      "ordersCount": [ { "date": "2025-11-04", "value": 12, "label": "ordersCount" }, ... ],
      "revenue": [ { "date": "2025-11-04", "value": 1234.56, "label": "revenue" }, ... ]
    },
    "top": {
      "products": [ { "title": "T-Shirt", "price": 20, "category": "Clothing", "createdAt": "..." } ],
      "sellers": [ { "firstname": "Alex", "lastname": "Doe", "email": "alex@example.com", "createdAt": "..." } ]
    },
    "breakdowns": {
      "categories": [ { "category": "Clothing", "count": 120 }, { "category": "Footwear", "count": 45 } ],
      "sellers": [ { "sellerId": "64s...", "productCount": 42, "seller": { "firstname": "Alice", "lastname": "Doe", "email": "alice@example.com" } } ]
    },
    "window": { "start": "2025-11-04", "end": "2025-12-03", "days": 30, "tz": "UTC" }
  },
  "errors": null
}
```

Notes:
- All series are zero-filled across the window so charts can be plotted directly without additional client-side filling.
- The response is stable and designed for line charts, bar charts, and KPI cards.
- Responses may be cached for short periods (e.g., 60s) to improve performance; set client refresh accordingly.
# Admin API (Standardized)

Base path: `/api/v1/admin`

All responses are JSON and follow a strict, predictable shape:
- `success`: boolean
- `message`: string
- `data`: object containing only schema-defined fields
- `errors`: optional object or array with validation or processing errors

For list endpoints, pagination uses:
- `items`: array of schema objects
- `total`: integer total items
- `page`: integer current page (default 1)
- `limit`: integer page size (default 50 unless noted)

IDs must be valid Mongo ObjectIds; invalid IDs return `400` with standardized shape.

## Auth
- Route: `GET /login`
- Method: GET
- Query: optional `error` (string)
- Response 200:
```json
{
  "success": true,
  "message": "Login page",
  "data": { "error": null },
  "errors": null
}
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
  {
    "success": true,
    "message": "Authenticated",
    "data": { "redirect": "/api/v1/admin/dashboard" },
    "errors": null
  }
  ```
  - 400:
  ```json
  {
    "success": false,
    "message": "Email and password are required",
    "data": null,
    "errors": { "fields": ["email", "password"] }
  }
  ```
  - 401:
  ```json
  {
    "success": false,
    "message": "Invalid credentials",
    "data": null,
    "errors": { "code": "INVALID_CREDENTIALS" }
  }
  ```

## Dashboard
- Route: `GET /dashboard`
- Method: GET
- Response 200:
```json
{
  "success": true,
  "message": "Dashboard metrics",
  "data": {
    "metrics": {
      "totalCartAmount": 0,
      "customerOrders": 0,
      "sellerOrders": 0,
      "UserCount": 0,
      "CustomerCount": 0
    },
    "users": {
      "items": [
        {
          "_id": "64f...",
          "firstname": "John",
          "lastname": "Doe",
          "email": "john@example.com",
          "products": ["65a..."],
          "cart": [ { "productId": "65a...", "quantity": 2 } ],
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z",
          "sellProduct": ["67b..."],
          "Address": {
            "plotno": "12A",
            "street": "Main St",
            "city": "Pune",
            "state": "MH",
            "pincode": 411001,
            "phone": "9999999999"
          },
          "reviews": ["66c..."]
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 50
    },
    "products": {
      "items": [
        {
          "_id": "65a...",
          "sellerId": "64s...",
          "title": "T-Shirt",
          "price": 499,
          "description": "Cotton tee",
          "category": "Clothing",
          "image": "https://.../image.jpg",
          "reviews": ["66c..."],
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z",
          "stock": true,
          "verified": false,
          "quantity": 10
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 50
    },
    "registeredProducts": {
      "items": [],
      "total": 0,
      "page": 1,
      "limit": 50
    }
  },
  "errors": null
}
```

## Blogs
- Route: `GET /blogs`
- Method: GET
- Response 200:
```json
{
  "success": true,
  "message": "Blogs fetched",
  "data": {
    "items": [
      {
        "_id": "64b...",
        "title": "Spring Sale",
        "content": "Details about sale",
        "author": "Admin",
        "image": "https://.../banner.jpg",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 50
  },
  "errors": null
}
```

- Route: `GET /blogs/page`
- Method: GET
- Response 200: same shape as `GET /blogs`.

- Route: `GET /blog/create`
- Method: GET
- Response 200:
```json
{
  "success": true,
  "message": "Render blog creation UI on the client. Use POST /api/v1/admin/blog to create.",
  "data": {},
  "errors": null
}
```

- Route: `POST /blog`
- Method: POST (multipart/form-data)
- Form fields: `title` (string), `content` (string), `author` (string), optional file field `image` (string URL after upload)
- Responses:
  - 201:
  ```json
  {
    "success": true,
    "message": "Blog created successfully",
    "data": {
      "blog": {
        "_id": "64b...",
        "title": "Spring Sale",
        "content": "Details about sale",
        "author": "Admin",
        "image": "https://.../banner.jpg",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    },
    "errors": null
  }
  ```
  - 500:
  ```json
  {
    "success": false,
    "message": "Failed to create blog",
    "data": null,
    "errors": { "code": "BLOG_CREATE_FAILED" }
  }
  ```

## Customers
- Route: `GET /customers`
- Method: GET
- Response 200:
```json
{
  "success": true,
  "message": "Customers fetched",
  "data": {
    "items": [
      {
        "_id": "64f...",
        "firstname": "John",
        "lastname": "Doe",
        "email": "john@example.com",
        "products": ["65a..."],
        "cart": [ { "productId": "65a...", "quantity": 2 } ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "sellProduct": ["67b..."],
        "Address": {
          "plotno": "12A",
          "street": "Main St",
          "city": "Pune",
          "state": "MH",
          "pincode": 411001,
          "phone": "9999999999"
        },
        "reviews": ["66c..."]
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 50
  },
  "errors": null
}
```

- Route: `GET /api/customers`
- Method: GET
- Response 200: same as `GET /customers`.

- Route: `DELETE /customer/:id`
- Method: DELETE
- Responses:
  - 200:
  ```json
  {
    "success": true,
    "message": "User deleted successfully",
    "data": {},
    "errors": null
  }
  ```
  - 400:
  ```json
  {
    "success": false,
    "message": "Invalid user id",
    "data": null,
    "errors": { "fields": ["id"] }
  }
  ```
  - 404:
  ```json
  {
    "success": false,
    "message": "No user with given id exists",
    "data": null,
    "errors": { "code": "USER_NOT_FOUND" }
  }
  ```

## Products
Key endpoints (JSON, Product schema-aligned):

- Route: `GET /api/products` (aliases: `/products`, `/products/details`)
- Method: GET
- Response 200:
```json
{
  "success": true,
  "message": "Products fetched",
  "data": {
    "items": [
      {
        "_id": "65a...",
        "sellerId": "64s...",
        "title": "T-Shirt",
        "price": 499,
        "description": "Cotton tee",
        "category": "Clothing",
        "image": "https://.../image.jpg",
        "reviews": ["66c..."],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "stock": true,
        "verified": false,
        "quantity": 10
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 50
  },
  "errors": null
}
```

- Route: `DELETE /product/:id`
- Method: DELETE
- Responses:
  - 200:
  ```json
  { "success": true, "message": "Product deleted successfully", "data": {}, "errors": null }
  ```
  - 400:
  ```json
  { "success": false, "message": "Invalid product id", "data": null, "errors": { "fields": ["id"] } }
  ```
  - 404:
  ```json
  { "success": false, "message": "Product not found", "data": null, "errors": { "code": "PRODUCT_NOT_FOUND" } }
  ```

- Route: `GET /product/approve/:id`
- Method: GET
- Response 200:
```json
{ "success": true, "message": "Product approved successfully", "data": {}, "errors": null }
```

- Route: `GET /product/disapprove/:id`
- Method: GET
- Response 200:
```json
{ "success": true, "message": "Product disapproved successfully", "data": {}, "errors": null }
```

## Sellers & Vendors
- Route: `GET /seller`
- Method: GET
- Response 200:
```json
{
  "success": true,
  "message": "Sellers fetched",
  "data": {
    "items": [
      {
        "_id": "64s...",
        "name": "Alice",
        "storeName": "Alice Store",
        "email": "alice@example.com",
        "password": "<hashed>",
        "gstn": "22AAAAA0000A1Z5",
        "profileImage": "https://.../profile.jpg",
        "products": ["65a..."],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "address": {
          "street": "Market Rd",
          "city": "Mumbai",
          "state": "MH",
          "pincode": "400001",
          "country": "India"
        },
        "identityVerification": {
          "aadharCard": "xxxx-xxxx-xxxx",
          "status": "Verified"
        },
        "bankDetails": {
          "accountNumber": "1234567890",
          "ifscCode": "HDFC0000123",
          "bankName": "HDFC Bank"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 50
  },
  "errors": null
}
```

- Route: `GET /api/sellers`
- Method: GET
- Response 200: same as `GET /seller`.

- Route: `GET /seller/details`
- Method: GET
- Response 200:
```json
{
  "success": true,
  "message": "Seller retrieved successfully",
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "limit": 50
  },
  "errors": null
}
```

- Route: `GET /seller/approve/:id`
- Method: GET
- Responses:
  - 200: `{ "success": true, "message": "Seller approved successfully", "data": {}, "errors": null }`
  - 400: `{ "success": false, "message": "Invalid seller id", "data": null, "errors": { "fields": ["id"] } }`
  - 404: `{ "success": false, "message": "No Such user exist", "data": null, "errors": { "code": "SELLER_NOT_FOUND" } }`

- Route: `DELETE /seller/:id`
- Method: DELETE
- Responses:
  - 200: `{ "success": true, "message": "Seller deleted successfully", "data": {}, "errors": null }`
  - 400: `{ "success": false, "message": "Invalid seller id", "data": null, "errors": { "fields": ["id"] } }`
  - 404: `{ "success": false, "message": "Seller not found", "data": null, "errors": { "code": "SELLER_NOT_FOUND" } }`

- Route: `GET /vendors`
- Method: GET
- Response 200: same shape as `GET /seller` but under `message: "Vendors fetched"`.

## Orders
- Route: `GET /orders`
- Method: GET
- Response 200: grouped by user
```json
{
  "success": true,
  "message": "Orders grouped by user",
  "data": {
    "items": [
      {
        "_id": "64f...",
        "firstname": "John",
        "lastname": "Doe",
        "email": "john@example.com",
        "orders": [
          {
            "_id": "70o...",
            "userId": "64f...",
            "products": [ { "productId": "65a...", "quantity": 1, "price": 499 } ],
            "orderStatus": "Pending",
            "trackingId": null,
            "totalAmount": 499,
            "paymentStatus": "Pending",
            "paymentMethod": "Online",
            "shippingAddress": {
              "fullname": "John Doe",
              "street": "Main St",
              "city": "Pune",
              "state": "MH",
              "pincode": 411001,
              "phone": "9999999999"
            },
            "createdAt": "2024-01-01T00:00:00.000Z",
            "updatedAt": "2024-01-01T00:00:00.000Z"
          }
        ]
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 50
  },
  "errors": null
}
```

- Route: `POST /orders`
- Method: POST
- Response 200: same as `GET /orders`.

- Route: `GET /orders/:userId`
- Method: GET
- Responses:
  - 200:
  ```json
  {
    "success": true,
    "message": "User orders fetched",
    "data": {
      "items": [
        {
          "_id": "70o...",
          "userId": "64f...",
          "products": [ { "productId": "65a...", "quantity": 1, "price": 499 } ],
          "orderStatus": "Pending",
          "trackingId": null,
          "totalAmount": 499,
          "paymentStatus": "Pending",
          "paymentMethod": "Online",
          "shippingAddress": {
            "fullname": "John Doe",
            "street": "Main St",
            "city": "Pune",
            "state": "MH",
            "pincode": 411001,
            "phone": "9999999999"
          },
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 50
    },
    "errors": null
  }
  ```
  - 400: `{ "success": false, "message": "Invalid user id", "data": null, "errors": { "fields": ["userId"] } }`
  - 404: `{ "success": false, "message": "User not found", "data": null, "errors": { "code": "USER_NOT_FOUND" } }`

- Route: `PUT /orders/:orderId/status`
- Method: PUT
- Payload:
```json
{ "orderStatus": "Pending|Processing|Shipped|Delivered|Cancelled|Returned" }
```
- Responses:
  - 200:
  ```json
  {
    "success": true,
    "message": "Order status updated successfully",
    "data": {
      "order": {
        "_id": "70o...",
        "orderStatus": "Processing"
      }
    },
    "errors": null
  }
  ```
  - 400: `{ "success": false, "message": "Invalid order id|Invalid order status", "data": null, "errors": { "fields": ["orderId"], "validStatuses": ["Pending","Processing","Shipped","Delivered","Cancelled","Returned"] } }`
  - 404: `{ "success": false, "message": "Order not found", "data": null, "errors": { "code": "ORDER_NOT_FOUND" } }`

- Route: `GET /orders/user/:orderId`
- Method: GET
- Responses:
  - 200:
  ```json
  {
    "success": true,
    "message": "Order user data fetched",
    "data": {
      "userId": "64f...",
      "userData": {
        "name": null,
        "email": "john@example.com",
        "orders": [
          {
            "_id": "70o...",
            "products": [ { "productId": "65a...", "quantity": 1, "price": 499 } ],
            "orderStatus": "Pending",
            "totalAmount": 499
          }
        ]
      }
    },
    "errors": null
  }
  ```
  - 400: `{ "success": false, "message": "Invalid order id", "data": null, "errors": { "fields": ["orderId"] } }`
  - 404: `{ "success": false, "message": "Order not found", "data": null, "errors": { "code": "ORDER_NOT_FOUND" } }`

## Second-hand (Sell Product)
- Route: `GET /dashboard/sellproduct`
- Method: GET
- Response 200:
```json
{
  "success": true,
  "message": "Second-hand products fetched",
  "data": {
    "items": [
      {
        "_id": "68sp...",
        "user_id": "64f...",
        "items": "T-Shirt",
        "fabric": "Cotton",
        "size": "L",
        "gender": "mens",
        "usageDuration": 12,
        "image": { "data": null, "contentType": "image/jpeg" },
        "description": "Used tee",
        "clothesDate": "2024-01-10T00:00:00.000Z",
        "timeSlot": "morning",
        "userStatus": "Pending",
        "adminStatus": "Pending",
        "estimated_value": 250,
        "created_at": "2024-01-11T00:00:00.000Z",
        "combination_id": "Cotton_L_12"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 50
  },
  "errors": null
}
```

- Route: `POST /dashboard/sellproduct`
- Method: POST
- Payload:
```json
{ "id": "<sellProductId>", "userStatus": "Pending|Verified|Rejected" }
```
- Responses:
  - 200: `{ "success": true, "message": "User status updated", "data": {}, "errors": null }`
  - 400: `{ "success": false, "message": "Valid id is required", "data": null, "errors": { "fields": ["id"] } }`

## Managers
- Route: `GET /managers`
- Method: GET
- Response 200:
```json
{
  "success": true,
  "message": "Managers fetched",
  "data": {
    "items": [
      {
        "_id": "64m...",
        "email": "manager@example.com",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 50
  },
  "errors": null
}
```

- Route: `POST /create/manager`
- Method: POST
- Payload:
```json
{ "email": "manager@example.com", "password": "secret123" }
```
- Responses:
  - 201: `{ "success": true, "message": "Manager created successfully!", "data": {}, "errors": null }`
  - 400: `{ "success": false, "message": "Email and password are required", "data": null, "errors": { "fields": ["email","password"] } }`
  - 409: `{ "success": false, "message": "Manager already exists", "data": null, "errors": { "code": "MANAGER_EXISTS" } }`

- Route: `DELETE /managers/:id`
- Method: DELETE
- Responses:
  - 200: `{ "success": true, "message": "Manager deleted successfully", "data": {}, "errors": null }`
  - 404: `{ "success": false, "message": "Manager not found", "data": null, "errors": { "code": "MANAGER_NOT_FOUND" } }`

## Delivery (Placeholder)
- Route: `GET /delivery`
- Method: GET
- Response 200:
```json
{ "success": true, "message": "Use client UI to manage deliveries.", "data": {}, "errors": null }
```

## Admin Analytics
- Route: `GET /analytics`
- Method: GET
- Query params: `from` (ISO date), `to` (ISO date), `page` (int, default 1), `limit` (int, default 50)
- Description: Returns aggregated analytics derived only from schema-defined fields in Users, Products, Orders, Sellers.
- Example request:
```
GET /api/v1/admin/analytics?from=2024-01-01&to=2024-01-31&page=1&limit=50
```
- Example standardized response:
```json
{
  "success": true,
  "message": "Analytics fetched",
  "data": {
    "summary": {
      "users": { "total": 120 },
      "sellers": { "total": 35 },
      "products": { "total": 560, "verified": 420 },
      "orders": {
        "total": 240,
        "statusBreakdown": {
          "Pending": 50,
          "Processing": 60,
          "Shipped": 40,
          "Delivered": 80,
          "Cancelled": 5,
          "Returned": 5
        },
        "paymentStatusBreakdown": {
          "Pending": 30,
          "Completed": 200,
          "Failed": 5,
          "Refunded": 5
        }
      }
    },
    "items": [
      {
        "_id": "70o...",
        "userId": "64f...",
        "totalAmount": 499,
        "orderStatus": "Delivered",
        "paymentStatus": "Completed",
        "createdAt": "2024-01-12T00:00:00.000Z"
      }
    ],
    "total": 240,
    "page": 1,
    "limit": 50
  },
  "errors": null
}
```

Notes:
- All object fields strictly mirror model schemas:
  - Blog: `_id`, `title`, `content`, `author`, `image`, `createdAt`
  - Product: `_id`, `sellerId`, `title`, `price`, `description`, `category`, `image`, `reviews`, `createdAt`, `updatedAt`, `stock`, `verified`, `quantity`
  - Seller: `_id`, `name`, `storeName`, `email`, `password`, `gstn`, `profileImage`, `products`, `createdAt`, `address`, `identityVerification`, `bankDetails`
  - Order: `_id`, `userId`, `products[] { productId, quantity, price }`, `orderStatus`, `trackingId`, `totalAmount`, `paymentStatus`, `paymentMethod`, `shippingAddress`, `createdAt`, `updatedAt`
  - User: `_id`, `firstname`, `lastname`, `email`, `password`, `products`, `cart[] { productId, quantity }`, `createdAt`, `updatedAt`, `sellProduct`, `Address`, `reviews`
  - SellProduct: `_id`, `user_id`, `items`, `fabric`, `size`, `gender`, `usageDuration`, `image { data, contentType }`, `description`, `clothesDate`, `timeSlot`, `userStatus`, `adminStatus`, `estimated_value`, `created_at`, `combination_id`

