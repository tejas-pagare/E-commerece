# Industry API

Base URL: `/api/v1/industry`

Auth: JWT set as an HTTP-only cookie named `token` after login. For fetch calls in React, use `credentials: 'include'` and ensure CORS allows credentials.

## Authentication

### POST /login
Authenticate an industry user and receive a cookie token.

- **Auth:** No
- **Body (JSON):**
  - `email` (string, required)
  - `password` (string, required)
- **Response 200 (application/json):**
```json
{
  "success": true,
  "message": "Login successful",
  "industry": { "_id": "...", "companyName": "...", "email": "..." }
}
```
- **Side effects:** Sets `token` httpOnly cookie.
- **Errors:**
  - 400: `{ success: false, error: 'Email and password are required' }`
  - 401: `{ success: false, error: 'Invalid email or password' }`
  - 500: `{ success: false, error: 'An unexpected error occurred' }`

### POST /signup
Create a new industry account.

- **Auth:** No
- **Body (JSON):**
  - `companyName` (string, required)
  - `email` (string, required)
  - `password` (string, required)
- **Response 201:**
```json
{
  "success": true,
  "message": "Signup successful",
  "industry": { "_id": "...", "companyName": "...", "email": "..." }
}
```
- **Errors:**
  - 400: `{ success: false, error: 'Missing required fields' }`
  - 409: `{ success: false, error: 'Email already registered' }`
  - 500: `{ success: false, error: 'Failed to sign up' }`

### GET /logout
Clear the auth cookie.

- **Auth:** Yes
- **Response 200:**
```json
{ "message": "Logged out successfully" }
```

## Products & Home

### GET /home
Get aggregated list of available products (combinations).

- **Auth:** Yes
- **Response 200 (application/json):**
```json
[
  {
    "_id": "<combination_id>",
    "quantity": 10,
    "estimated_value": 50,
    "fabric": "Cotton",
    "size": "M",
    "usageDuration": "1 year"
  }
]
```
- **Errors:**
  - 500: `{ "message": "Internal Server Error", "error": {...} }`

## Profile

### GET /profile
Get current industry user's profile.

- **Auth:** Yes
- **Response 200 (application/json):**
```json
{
  "industryName": "...",
  "email": "...",
  "address": "...",
  "date": "..."
}
```
- **Errors:**
  - 404: `{ "message": "Industry profile not found" }`
  - 500: `{ "message": "Error fetching profile" }`

### GET /profile/edit
Get data for editing the current industry user's profile.

- **Auth:** Yes
- **Response 200 (application/json):**
```json
{
  "companyName": "...",
  "email": "...",
  "address": "..."
}
```
- **Errors:**
  - 404: `{ "message": "Industry profile not found" }`
  - 500: `{ "message": "Error fetching profile for editing" }`

### POST /profile/edit
Update the current industry user's profile.

- **Auth:** Yes
- **Body (JSON):**
  - `companyName` (string)
  - `email` (string)
  - `address` (string)
  - `password` (string, optional)
- **Response 200 (application/json):**
```json
{
  "message": "Profile updated successfully",
  "industry": { ...updatedFields }
}
```
- **Errors:**
  - 404: `{ "message": "Industry profile not found" }`
  - 500: `{ "message": "An error occurred while updating your profile" }`

## Cart & Checkout

### GET /cart
Get the industry user's current cart.

- **Auth:** Yes
- **Response 200 (application/json):**
```json
{
  "industryName": "...",
  "email": "...",
  "address": "...",
  "cart": [
    {
      "fabric": "Cotton",
      "size": "M",
      "usageDuration": "1 year",
      "quantity": 5,
      "amount": 250,
      "combination_id": "...",
      "id": "..."
    }
  ]
}
```
- **Errors:**
  - 500: `{ "msg": "Server Error" }`

### POST /cart
Add an item to the cart.

- **Auth:** Yes
- **Body (JSON):**
    - `_id` (string, combination_id)
    - `new_quantity` (number)
    - `estimated_value` (number)
    - `fabric` (string)
    - `size` (string)
    - `usageDuration` (string)
- **Response 200 (application/json):** (Returns the updated cart)
```json
{
  "industryName": "...",
  "email": "...",
  "address": "...",
  "cart": [ ... ]
}
```
- **Errors:**
  - 500: `{ "msg": "Server Error" }`

### POST /cart/delete
Delete an item from the cart.

- **Auth:** Yes
- **Body (JSON):**
  - `id` (string, required, this is the unique id of the cart item)
- **Response 200 (application/json):**
```json
{
  "updatedIndustry": { ... },
  "cart": [ ... ]
}
```
- **Errors:**
  - 500: `"Error occurred while deleting item from cart."`

### GET /checkout
Get information needed for checkout (cart, address, etc.).

- **Auth:** Yes
- **Response 200 (application/json):**
```json
{
  "industryName": "...",
  "email": "...",
  "address": "...",
  "cart": [ ... ]
}
```
- **Errors:**
  - 404: `{ "message": "Industry not found" }`
  - 500: `{ "message": "Internal Server Error" }`

### POST /checkout
Process the checkout. This will move items from cart to the dashboard.

- **Auth:** Yes
- **Response 200 (application/json):**
```json
{
  "orders": [ ... ],
  "totalAmount": 500
}
```
- **Errors:**
  - 404: `{ "message": "Industry not found" }`
  - 500: `{ "message": "Internal Server Error" }`


## Dashboard

### GET /dashboard
Get dashboard data for the industry user, including past orders.

- **Auth:** Yes
- **Response 200 (application/json):**
```json
{
  "orders": [
    {
      "fabric": "Cotton",
      "size": "M",
      "usageDuration": "1 year",
      "quantity": 5,
      "amount": 250,
      "combination_id": "...",
      "id": "..."
    }
  ],
  "totalAmount": 250
}
```
- **Errors:**
  - 400: `{ "message": "Industry ID missing" }`
  - 404: `{ "message": "Industry not found" }`
  - 500: `{ "message": "Server error" }`
