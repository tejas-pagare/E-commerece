# Frontend Migration Guide - Phase 1: Security & Route Stabilization

**Date:** January 16, 2026
**Status:** REQUIRED IMMEDIATE ACTION

This document outlines the required changes for frontend applications (React, Dashboard EJS, etc.) to align with the backend stabilization refactor.

## 1. Authentication & Security

The backend now enforces strict **HTTP-Only Cookies** for admin authentication.

### **Login Flow**
*   **Endpoint:** `POST /api/v1/admin/login` (Replaces legacy endpoints)
*   **Payload:** `{ "email": "...", "password": "..." }`
*   **Response:**
    *   Success: 200 OK. Sets `adminToken` cookie automatically.
    *   Error: 401 Unauthorized.
*   **Frontend Requirement:**
    *   **Do not** expect a token in the JSON response body.
    *   **Do not** store tokens in `localStorage`.
    *   **Enable Credentials:** All API requests must include `withCredentials: true` (Axios) or `credentials: 'include'` (Fetch).

### **Check Auth (Persistent Login)**
*   **Endpoint:** `GET /api/v1/admin/check-auth`
*   **Usage:** Call this on app load to verify if the user is logged in.
*   **Returns:** user details if valid, 401 if not.

### **Logout**
*   **Endpoint:** `POST /api/v1/admin/logout`
*   **Action:** Clears the cookie server-side.

---

## 2. Breaking API Changes (Route Standardization)

We have removed redundant routes and standardized RESTful patterns. Update your API calls as follows:

| Feature | Old Route (Removed/Deprecated) | **New Canonical Route** | Method | Note |
| :--- | :--- | :--- | :--- | :--- |
| **Customers** | `/api/customers`, `/customer/details` | `/api/v1/admin/customers` | `GET` | Returns paginated list |
| | `/customer/:id` (Delete) | `/api/v1/admin/customers/:id` | `DELETE` | |
| **Products** | `/api/products`, `/products/details` | `/api/v1/admin/products` | `GET` | |
| **Product Approval** | `/product/approve/:id` (GET) | `/api/v1/admin/products/:id/approval` | **`PUT`** | Body: `{ "approved": true }` |
| **Product Rejection** | `/product/disapprove/:id` (GET) | `/api/v1/admin/products/:id/approval` | **`PUT`** | Body: `{ "approved": false }` |
| **Sellers/Vendors** | `/vendors`, `/seller/details`, `/api/sellers` | `/api/v1/admin/sellers` | `GET` | |
| **Seller Approval** | `/seller/approve/:id` (GET) | `/api/v1/admin/sellers/:id/approve` | **`PUT`** | Standard REST PUT |
| **Managers** | `/create/manager` | `/api/v1/admin/managers` | `POST` | |
| **Second Hand** | `/dashboard/sellproduct` (GET) | `/api/v1/admin/secondhand-products` | `GET` | |

---

## 3. Dashboard Data Structure

The `/api/v1/admin/dashboard` endpoint now returns **real database data**. The response structure is guaranteed:

**Endpoint:** `GET /api/v1/admin/dashboard`

**Response Shape:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "users": 150,           // Total registered users
      "products": 45,         // Total products
      "sellers": 12,          // Total validated sellers
      "managers": 3,
      "orders": 89,
      "totalRevenue": 12500,  // Total revenue sum
      "totalOrders": 89
    },
    "series": {
      // Arrays for charting (e.g., Recharts / Chart.js)
      // Guaranteed to be zero-filled for empty days
      "revenue": [
        { "date": "2026-01-01", "value": 100, "label": "revenue" },
        { "date": "2026-01-02", "value": 0, "label": "revenue" }
      ],
      "usersCreated": [...],
      "productsAdded": [...],
      "ordersCount": [...]
    },
    "window": {
      "start": "2025-12-17",
      "end": "2026-01-16",
      "days": 30
    }
  }
}
```

**Frontend Action:**
*   Remove any hardcoded mock data files.
*   Bind dashboard charts to `data.series`.
*   Bind summary cards to `data.summary`.

---

## 4. Error Handling Standard

All API errors now follow a strict format. Update your error interceptors:

```json
{
  "success": false,
  "message": "Human readable error message",
  "errors": {
    "code": "ERROR_CODE_STRING",  // e.g. "INVALID_CREDENTIALS", "NO_TOKEN"
    "fields": ["email"],          // Optional array of invalid fields
    "message": "Technical details" // Optional debug info
  }
}
```

## 5. Environment Config

If you are running the frontend locally, ensure your proxy or API URL points to:
`http://localhost:8000/api/v1/admin`

**Note:** The backend is now fail-safe. If you encounter 500 errors on startup, check the backend server logs for missing `.env` variables.
