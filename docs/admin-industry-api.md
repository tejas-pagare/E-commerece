# Admin Industry API Documentation

## Base URL
`/api/v1/admin`

## Authentication
All endpoints require admin authentication via cookie (`adminToken`).

---

## Endpoints

### 1. Get All Industries

**Endpoint:** `GET /industries`

**Method:** `GET`

**Authentication:** Required (Admin)

**Request Headers:**
```
Cookie: adminToken=<jwt_token>
```

**Request Body:** None

**Query Parameters:** None

**Response:**

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Industries fetched",
  "data": {
    "items": [
      {
        "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
        "companyName": "ABC Textiles Ltd",
        "email": "contact@abctextiles.com",
        "Address": "123 Industrial Area, Mumbai, Maharashtra, 400001",
        "cart": [
          {
            "fabric": "Cotton",
            "size": "L",
            "usageDuration": 6,
            "quantity": 100,
            "amount": 5000,
            "combination_id": "cotton_l_6",
            "id": "item_001"
          }
        ],
        "dashboard": [
          {
            "fabric": "Silk",
            "size": "M",
            "usageDuration": 12,
            "quantity": 50,
            "amount": 8000,
            "combination_id": "silk_m_12",
            "id": "item_002",
            "date": "2026-02-10T10:30:00.000Z"
          }
        ],
        "createdAt": "2026-01-15T08:20:00.000Z",
        "updatedAt": "2026-02-13T04:00:00.000Z"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 50
  },
  "errors": null
}
```

**Error (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "Failed to fetch industries",
  "data": null,
  "errors": {
    "message": "Error details"
  }
}
```

**Fields Returned:**

| Field | Type | Description |
|-------|------|-------------|
| `_id` | String | Unique industry identifier |
| `companyName` | String | Name of the company |
| `email` | String | Company email address |
| `Address` | String | Company physical address |
| `cart` | Array | Array of cart items (fabric, size, quantity, etc.) |
| `cart[].fabric` | String | Fabric type |
| `cart[].size` | String | Size specification |
| `cart[].usageDuration` | Number | Duration of usage in months |
| `cart[].quantity` | Number | Quantity of items |
| `cart[].amount` | Number | Total amount |
| `cart[].combination_id` | String | Unique combination identifier |
| `cart[].id` | String | Item identifier |
| `dashboard` | Array | Array of dashboard items (similar to cart) |
| `dashboard[].date` | String (ISO 8601) | Date of dashboard entry |
| `createdAt` | String (ISO 8601) | Registration date |
| `updatedAt` | String (ISO 8601) | Last update date |

---

### 2. Get Industry by ID

**Endpoint:** `GET /industries/:id`

**Method:** `GET`

**Authentication:** Required (Admin)

**Request Headers:**
```
Cookie: adminToken=<jwt_token>
```

**URL Parameters:**
- `id` (required): Industry MongoDB ObjectId

**Request Body:** None

**Response:**

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Industry details",
  "data": {
    "industry": {
      "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
      "companyName": "ABC Textiles Ltd",
      "email": "contact@abctextiles.com",
      "Address": "123 Industrial Area, Mumbai, Maharashtra, 400001",
      "cart": [...],
      "dashboard": [...],
      "createdAt": "2026-01-15T08:20:00.000Z",
      "updatedAt": "2026-02-13T04:00:00.000Z"
    }
  },
  "errors": null
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid industry id",
  "data": null,
  "errors": {
    "message": "Error details"
  }
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "message": "Industry not found",
  "data": null,
  "errors": {
    "message": "Error details"
  }
}
```

**Error (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "Server Error",
  "data": null,
  "errors": {
    "message": "Error details"
  }
}
```

---

### 3. Delete Industry

**Endpoint:** `DELETE /industries/:id`

**Method:** `DELETE`

**Authentication:** Required (Admin)

**Request Headers:**
```
Cookie: adminToken=<jwt_token>
```

**URL Parameters:**
- `id` (required): Industry MongoDB ObjectId

**Request Body:** None

**Response:**

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Industry deleted successfully",
  "data": {},
  "errors": null
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid industry id",
  "data": null,
  "errors": {
    "message": "Error details"
  }
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "message": "Industry not found",
  "data": null,
  "errors": {
    "message": "Error details",
    "code": "INDUSTRY_NOT_FOUND"
  }
}
```

**Error (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "Failed to delete industry",
  "data": null,
  "errors": {
    "message": "Error details"
  }
}
```

---

## React Frontend Integration Examples

### Fetch All Industries
```javascript
const fetchIndustries = async () => {
  try {
    const response = await fetch('/api/v1/admin/industries', {
      method: 'GET',
      credentials: 'include', // Important for cookie authentication
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Industries:', result.data.items);
      console.log('Total:', result.data.total);
      return result.data.items;
    } else {
      console.error('Error:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to fetch industries:', error);
    throw error;
  }
};
```

### Fetch Single Industry
```javascript
const fetchIndustryById = async (industryId) => {
  try {
    const response = await fetch(`/api/v1/admin/industries/${industryId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data.industry;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to fetch industry:', error);
    throw error;
  }
};
```

### Delete Industry
```javascript
const deleteIndustry = async (industryId) => {
  try {
    const response = await fetch(`/api/v1/admin/industries/${industryId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Industry deleted successfully');
      return true;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to delete industry:', error);
    throw error;
  }
};
```

### Using Axios (Alternative)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1/admin',
  withCredentials: true // Important for cookie authentication
});

// Fetch all industries
const fetchIndustries = async () => {
  const { data } = await api.get('/industries');
  return data.data.items;
};

// Fetch single industry
const fetchIndustryById = async (id) => {
  const { data } = await api.get(`/industries/${id}`);
  return data.data.industry;
};

// Delete industry
const deleteIndustry = async (id) => {
  const { data } = await api.delete(`/industries/${id}`);
  return data.success;
};
```

---

## Data Model

### Industry Schema
```typescript
interface Industry {
  _id: string;
  companyName: string;
  email: string;
  password: string; // Not returned in API responses
  Address: string;
  cart: CartItem[];
  dashboard: DashboardItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface CartItem {
  fabric: string;
  size: string;
  usageDuration: number; // in months
  quantity: number;
  amount: number;
  combination_id: string;
  id: string;
}

interface DashboardItem extends CartItem {
  date: Date;
}
```

---

## Notes

1. **Authentication**: All endpoints require admin authentication. Ensure the admin is logged in and has a valid `adminToken` cookie.

2. **CORS**: If your React app is on a different port/domain during development, ensure CORS is properly configured in your backend.

3. **Error Handling**: All endpoints follow a consistent error response format with `success`, `message`, `data`, and `errors` fields.

4. **Pagination**: Currently returns all results with a default limit of 50. You may want to implement query parameters for pagination (`?page=1&limit=20`) in the future.

5. **Field Privacy**: The `password` field is never returned in API responses for security purposes.

6. **Date Format**: All dates are returned in ISO 8601 format (e.g., `"2026-02-13T04:00:00.000Z"`).
