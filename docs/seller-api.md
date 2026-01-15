# Seller API (React-friendly)

Base URL: `/api/v1/seller`

Auth: JWT set as an HTTP-only cookie named `token` after login. For fetch calls in React, use `credentials: 'include'` and ensure CORS allows credentials.

Notes:
- Many endpoints require authentication. If unauthenticated, middleware may redirect to `/`. For React apps, ensure the cookie is present; otherwise you will receive a non-JSON response. Consider handling 302 as unauthenticated in the client or update global middleware to return 401 JSON for API routes.
- File uploads use `multipart/form-data`.

## Authentication

### POST /login
Authenticate a seller and receive a cookie token.

- Auth: No
- Body (JSON):
  - `email` (string, required)
  - `password` (string, required)
- Response 200 (application/json):
```
{
  "success": true,
  "message": "Login successful",
  "seller": { "_id": "...", "name": "...", "email": "...", "storeName": "...", ... }
}
```
- Side effects: Sets `token` httpOnly cookie. Expires ~5h.
- Errors:
  - 400: `{ success: false, error: 'Email and password are required' }`
  - 401: `{ success: false, error: 'Invalid email or password' }`
  - 500: `{ success: false, error: 'An unexpected error occurred' }`

### GET /logout
Clear the auth cookie.

- Auth: Yes
- Response 200:
```
{ "success": true, "message": "Logged out" }
```

### POST /signup
Create a seller account with identity documents.

- Auth: No
- Content-Type: `multipart/form-data`
- Fields (text):
  - `name`, `password`, `email`, `gstn`, `phoneNumber`, `storeName` (all required)
  - Optional: `accountNumber`, `ifscCode`, `bankName`, `street`, `city`, `state`, `pincode`, `country`
- Fields (files):
  - `profileImage` (required)
  - `aadhaarImage` (required)
- Response 201:
```
{
  "success": true,
  "message": "Signup successful",
  "seller": { "_id": "...", "name": "...", "email": "...", "storeName": "...", ... }
}
```
- Errors:
  - 400: `{ success:false, error: 'Missing required fields' | 'Profile image and Aadhaar image are required' }`
  - 409: `{ success:false, error: 'Email already registered' }`
  - 500: `{ success:false, error: 'Failed to sign up' }`

## Account

### GET /account/me
Get current seller profile.

- Auth: Yes
- Response 200:
```
{ "success": true, "seller": { "_id": "...", "name": "...", "email": "...", ... } }
```
- Errors: 404, 500

### PATCH /account
Update current seller profile.

- Auth: Yes
- Body (JSON): any of
  - `name`, `gstn`, `email`, `phoneNumber`, `storeName`, `address` (object)
- Response 200:
```
{ "success": true, "seller": { ...updatedFields } }
```
- Errors:
  - 400: `{ success:false, message:'No updatable fields provided' }`
  - 500: `{ success:false, message:'Failed to update account' }`

Legacy SSR route: `POST /account/update` now also returns JSON on error/success for API use.

## Products

### GET /products
List products created by current seller.

- Auth: Yes
- Response 200:
```
{ "success": true, "products": [ { "_id": "...", "title": "...", ... } ] }
```

### GET /product/:id
Get a single product by id (must be owned by seller).

- Auth: Yes
- Response 200:
```
{ "success": true, "product": { "_id": "...", "title": "...", ... } }
```
- Errors:
  - 404: not found
  - 403: forbidden (not owned)

### POST /create
Create a new product.

- Auth: Yes
- Content-Type: `multipart/form-data`
- Fields (text): `title` (string), `price` (number), `description` (string), `category` (string), `quantity` (number), `stock` (boolean)
- Field (file): `img` (required)
- Response 200:
```
{ "message": "Create Product", "success": true }
```
- Errors: 400, 500

### POST /update/:id
Update an existing product by id.

- Auth: Yes
- Body (JSON): any subset of `title`, `price`, `description`, `image`, `quantity`, `stock`
- Response 200:
```
{ "message": "product updated successfully", "success": true }
```
- Errors: 500

### DELETE /product/:id
Delete a product owned by the seller.

- Auth: Yes
- Response 200 on success:
```
{ "message": "Products removed successfully", "success": true }
```
- Response 200 on not-owned:
```
{ "message": "Error in removing product" }
```
- Errors: 500

## Orders / Sold products

### GET /sold-products/data
Get sold products for the current seller.

- Auth: Yes
- Response 200:
```
{
  "success": true,
  "soldProducts": [
    {
      "id": "<orderId>",
      "name": "<product title>",
      "price": 123.45,
      "quantity": 2,
      "buyerName": "<name>",
      "orderDate": "YYYY-MM-DD",
      "status": "Delivered|Shipped|Processing",
      "totalAmount": 246.9
    }
  ]
}
```
- Errors: 500

## Client integration tips

- Use `fetch(url, { method, headers, body, credentials: 'include' })` so the cookie is sent.
- For file uploads, construct `FormData` and do not set `Content-Type` manually; the browser will set boundary.
- On 401/redirect for API calls, treat as unauthenticated and redirect to your React login page.
