# User Purchase Analytics API Documentation

API endpoint for admin to view a specific user's purchase behavior — which categories they buy most, with time-based filtering.

---

## Base URL

```
http://localhost:8000/api/v1/admin
```

## Authentication

**Method**: Cookie-based (`adminToken`)  
**Required**: Yes — admin must be logged in via `POST /api/v1/admin/login`

---

## Endpoint: Get User Purchase Analytics

```
GET /analytics/users/:userId/purchases
```

**Method**: `GET`

### Path Parameters

| Parameter | Type   | Required | Description                         |
|-----------|--------|----------|-------------------------------------|
| `userId`  | string | Yes      | MongoDB ObjectId of the target user |

### Query Parameters

| Parameter | Type   | Required | Default | Valid Values              | Description              |
|-----------|--------|----------|---------|---------------------------|--------------------------|
| `period`  | string | No       | `3m`    | `3m`, `6m`, `1y`, `lifetime` | Time period for filtering |

**Period Values:**
- `3m` — Last 3 months
- `6m` — Last 6 months
- `1y` — Last 1 year
- `lifetime` — All-time purchase history

---

## Request Examples

### cURL

```bash
# Last 3 months (default)
curl -X GET "http://localhost:8000/api/v1/admin/analytics/users/507f1f77bcf86cd799439011/purchases?period=3m" \
  -H "Content-Type: application/json" \
  -b "adminToken=YOUR_ADMIN_TOKEN"

# Last 6 months
curl -X GET "http://localhost:8000/api/v1/admin/analytics/users/507f1f77bcf86cd799439011/purchases?period=6m" \
  -H "Content-Type: application/json" \
  -b "adminToken=YOUR_ADMIN_TOKEN"

# Last 1 year
curl -X GET "http://localhost:8000/api/v1/admin/analytics/users/507f1f77bcf86cd799439011/purchases?period=1y" \
  -H "Content-Type: application/json" \
  -b "adminToken=YOUR_ADMIN_TOKEN"

# Lifetime
curl -X GET "http://localhost:8000/api/v1/admin/analytics/users/507f1f77bcf86cd799439011/purchases?period=lifetime" \
  -H "Content-Type: application/json" \
  -b "adminToken=YOUR_ADMIN_TOKEN"
```

### JavaScript (fetch)

```javascript
async function getUserPurchaseAnalytics(userId, period = '3m') {
  const response = await fetch(
    `http://localhost:8000/api/v1/admin/analytics/users/${userId}/purchases?period=${period}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    }
  );
  const data = await response.json();
  if (data.success) return data.data;
  throw new Error(data.message);
}
```

### Axios

```javascript
import axios from 'axios';

async function getUserPurchaseAnalytics(userId, period = '3m') {
  const { data } = await axios.get(
    `http://localhost:8000/api/v1/admin/analytics/users/${userId}/purchases`,
    { params: { period }, withCredentials: true }
  );
  return data.data;
}
```

---

## Response Body

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "User purchase analytics fetched successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com"
    },
    "categoryBreakdown": [
      {
        "category": "Clothing",
        "totalQuantity": 18,
        "totalRevenue": 1249.82,
        "orderCount": 12,
        "uniqueProducts": 6,
        "topProducts": [
          {
            "productId": "65a1bc23def456789012",
            "title": "Premium Cotton T-Shirt",
            "image": "https://cdn.example.com/tshirt.jpg"
          },
          {
            "productId": "65a1bc23def456789013",
            "title": "Denim Jeans",
            "image": "https://cdn.example.com/jeans.jpg"
          }
        ]
      },
      {
        "category": "Electronics",
        "totalQuantity": 5,
        "totalRevenue": 899.95,
        "orderCount": 3,
        "uniqueProducts": 2,
        "topProducts": [
          {
            "productId": "65a1bc23def456789014",
            "title": "Wireless Headphones",
            "image": "https://cdn.example.com/headphones.jpg"
          }
        ]
      }
    ],
    "summary": {
      "totalCategories": 2,
      "totalQuantity": 23,
      "totalRevenue": 2149.77,
      "totalOrders": 15,
      "mostPurchasedCategory": "Clothing"
    },
    "period": "3m",
    "periodLabel": "Last 3 Months",
    "startDate": "2025-11-13",
    "endDate": "2026-02-13"
  },
  "errors": null
}
```

### Response Fields

#### `data.user`
| Field       | Type   | Description        |
|-------------|--------|--------------------|
| `_id`       | string | User's ObjectId    |
| `firstname` | string | User's first name  |
| `lastname`  | string | User's last name   |
| `email`     | string | User's email       |

#### `data.categoryBreakdown[]`
| Field            | Type   | Description                                  |
|------------------|--------|----------------------------------------------|
| `category`       | string | Product category name                        |
| `totalQuantity`  | number | Total units purchased in this category       |
| `totalRevenue`   | number | Total revenue from this category (2 decimals)|
| `orderCount`     | number | Number of orders containing this category    |
| `uniqueProducts` | number | Count of distinct products in this category  |
| `topProducts`    | array  | Up to 5 distinct products in this category   |

#### `data.summary`
| Field                   | Type        | Description                         |
|-------------------------|-------------|-------------------------------------|
| `totalCategories`       | number      | Number of distinct categories       |
| `totalQuantity`         | number      | Total units purchased overall       |
| `totalRevenue`          | number      | Total revenue across all categories |
| `totalOrders`           | number      | Total order count                   |
| `mostPurchasedCategory` | string/null | Category with highest quantity      |

#### Metadata Fields
| Field         | Type        | Description                      |
|---------------|-------------|----------------------------------|
| `period`      | string      | Period used (`3m`/`6m`/`1y`/`lifetime`) |
| `periodLabel` | string      | Human-readable period label      |
| `startDate`   | string/null | Start date (null for lifetime)   |
| `endDate`     | string      | End date (YYYY-MM-DD)            |

---

## Error Responses

### 400 Bad Request — Invalid User ID

```json
{
  "success": false,
  "message": "Invalid user id",
  "data": null,
  "errors": { "message": null, "code": "INVALID_USER_ID" }
}
```

### 404 Not Found — User Not Found

```json
{
  "success": false,
  "message": "User not found",
  "data": null,
  "errors": { "message": null, "code": "USER_NOT_FOUND" }
}
```

### 401 Unauthorized — Not Authenticated

```json
{
  "success": false,
  "message": "Unauthorized: Admin authentication required",
  "data": null,
  "errors": { "message": "No admin token provided" }
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Failed to fetch user purchase analytics",
  "data": null,
  "errors": { "message": "Database connection error" }
}
```

---

## React Frontend Integration

### Complete Component Example

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserPurchaseAnalytics = ({ userId }) => {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('3m');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/admin/analytics/users/${userId}/purchases`,
          { params: { period }, withCredentials: true }
        );
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchData();
  }, [userId, period]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!data) return null;

  return (
    <div>
      <h2>Purchase Analytics: {data.user.firstname} {data.user.lastname}</h2>
      <p>{data.user.email}</p>

      {/* Period Filter */}
      <div>
        {['3m', '6m', '1y', 'lifetime'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{ fontWeight: period === p ? 'bold' : 'normal' }}
          >
            {p === '3m' ? 'Last 3 Months' : p === '6m' ? 'Last 6 Months' : p === '1y' ? 'Last 1 Year' : 'Lifetime'}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div>
        <p><strong>Most Purchased Category:</strong> {data.summary.mostPurchasedCategory || 'N/A'}</p>
        <p><strong>Total Items:</strong> {data.summary.totalQuantity}</p>
        <p><strong>Total Revenue:</strong> ${data.summary.totalRevenue.toFixed(2)}</p>
        <p><strong>Total Orders:</strong> {data.summary.totalOrders}</p>
      </div>

      {/* Category Breakdown Table */}
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Quantity</th>
            <th>Revenue</th>
            <th>Orders</th>
            <th>Unique Products</th>
          </tr>
        </thead>
        <tbody>
          {data.categoryBreakdown.map((cat) => (
            <tr key={cat.category}>
              <td>{cat.category}</td>
              <td>{cat.totalQuantity}</td>
              <td>${cat.totalRevenue.toFixed(2)}</td>
              <td>{cat.orderCount}</td>
              <td>{cat.uniqueProducts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserPurchaseAnalytics;
```

### Custom Hook

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useUserPurchaseAnalytics = (userId, initialPeriod = '3m') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState(initialPeriod);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    axios.get(
      `http://localhost:8000/api/v1/admin/analytics/users/${userId}/purchases`,
      { params: { period }, withCredentials: true }
    )
    .then(res => setData(res.data.data))
    .catch(err => setError(err.response?.data?.message || 'Error'))
    .finally(() => setLoading(false));
  }, [userId, period]);

  return { data, loading, error, period, setPeriod };
};
```

---

## Changelog

**v1.0.0** (2026-02-13)
- Initial release
- Per-user category breakdown with time-based filtering
- Support for 3m, 6m, 1y, and lifetime periods
- Summary stats including most purchased category
- Top 5 products per category
