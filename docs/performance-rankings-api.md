# Performance Rankings API Documentation

API endpoints for admin to view seller and industry performance rankings with time-based filtering and timeseries data for frontend charts.

**Base URL**: `http://localhost:8000/api/v1/admin`  
**Authentication**: Cookie-based (`adminToken`), admin must be logged in.

---

## Common Query Parameters

### Period Filter
| Value | Description |
|-------|-------------|
| `3m` | Last 3 months (default) |
| `6m` | Last 6 months |
| `12m` | Last 12 months |
| `lifetime` | All-time |

### Metric Filter
| Value | Description |
|-------|-------------|
| `value` | Total transaction value (default) |
| `orders` | Total number of orders |

---

## 1. Get Seller Rankings

```
GET /analytics/rankings/sellers
```

**Method**: `GET`

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `period` | string | No | `3m` | Time window filter |
| `limit` | number | No | `10` | Max results (1–100) |
| `metric` | string | No | `value` | Sort metric: `value` or `orders` |

### Request Example (cURL)

```bash
curl -X GET "http://localhost:8000/api/v1/admin/analytics/rankings/sellers?period=3m&limit=10&metric=value" \
  -b "adminToken=YOUR_TOKEN"
```

### Response — `200 OK`

```json
{
  "success": true,
  "message": "Seller rankings fetched",
  "data": {
    "period": "3m",
    "metric": "value",
    "generatedAt": "2026-02-13T05:53:05.000Z",
    "data": [
      {
        "rank": 1,
        "sellerId": "65a1bc23def456789012",
        "sellerName": "ABC Traders",
        "totalValue": 1250000,
        "totalOrders": 320,
        "avgOrderValue": 3906.25,
        "uniqueBuyers": 140
      },
      {
        "rank": 2,
        "sellerId": "65a1bc23def456789013",
        "sellerName": "XYZ Fashion",
        "totalValue": 980000,
        "totalOrders": 250,
        "avgOrderValue": 3920.00,
        "uniqueBuyers": 95
      }
    ]
  },
  "errors": null
}
```

### Response Fields — `data.data[]`

| Field | Type | Description |
|-------|------|-------------|
| `rank` | number | Position in ranking |
| `sellerId` | string | Seller ObjectId |
| `sellerName` | string | Seller store or name |
| `totalValue` | number | Total sales revenue |
| `totalOrders` | number | Total order line items |
| `avgOrderValue` | number | Average value per order |
| `uniqueBuyers` | number | Distinct buyer count |

---

## 2. Get Industry Rankings

```
GET /analytics/rankings/industries
```

**Method**: `GET`

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `period` | string | No | `3m` | Time window filter |
| `limit` | number | No | `10` | Max results (1–100) |
| `metric` | string | No | `value` | Sort metric: `value` or `orders` |

### Request Example (cURL)

```bash
curl -X GET "http://localhost:8000/api/v1/admin/analytics/rankings/industries?period=6m&limit=5" \
  -b "adminToken=YOUR_TOKEN"
```

### Response — `200 OK`

```json
{
  "success": true,
  "message": "Industry rankings fetched",
  "data": {
    "period": "6m",
    "metric": "value",
    "generatedAt": "2026-02-13T05:53:05.000Z",
    "data": [
      {
        "rank": 1,
        "industryId": "65b2cd34ef567890ab12",
        "industry": "Automotive Textiles Ltd",
        "totalValue": 9800000,
        "totalOrders": 2100,
        "activeBuyers": 1,
        "avgOrderValue": 4666.67
      }
    ]
  },
  "errors": null
}
```

### Response Fields — `data.data[]`

| Field | Type | Description |
|-------|------|-------------|
| `rank` | number | Position in ranking |
| `industryId` | string | Industry ObjectId |
| `industry` | string | Company name |
| `totalValue` | number | Total purchase value |
| `totalOrders` | number | Total dashboard entries |
| `activeBuyers` | number | Always 1 (each industry = buyer) |
| `avgOrderValue` | number | Average per entry |

---

## 3. Seller Performance Timeseries

```
GET /analytics/sellers/:sellerId/timeseries
```

**Method**: `GET`

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sellerId` | string | Yes | Seller ObjectId |

### Query Parameters

| Parameter | Type | Required | Default | Valid Values | Description |
|-----------|------|----------|---------|--------------|-------------|
| `period` | string | No | `3m` | `3m`,`6m`,`12m`,`lifetime` | Time window |
| `interval` | string | No | `month` | `day`,`week`,`month` | Bucket size |
| `metric` | string | No | `value` | `value`,`orders` | Data metric |

### Request Example (cURL)

```bash
curl -X GET "http://localhost:8000/api/v1/admin/analytics/sellers/65a1bc23def456789012/timeseries?period=6m&interval=month&metric=value" \
  -b "adminToken=YOUR_TOKEN"
```

### Response — `200 OK`

```json
{
  "success": true,
  "message": "Seller timeseries fetched",
  "data": {
    "sellerId": "65a1bc23def456789012",
    "sellerName": "ABC Traders",
    "metric": "value",
    "interval": "month",
    "period": "6m",
    "points": [
      { "date": "2025-09", "value": 120000 },
      { "date": "2025-10", "value": 180000 },
      { "date": "2025-11", "value": 150000 },
      { "date": "2025-12", "value": 220000 },
      { "date": "2026-01", "value": 195000 },
      { "date": "2026-02", "value": 85000 }
    ]
  },
  "errors": null
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `sellerId` | string | Seller ObjectId |
| `sellerName` | string | Seller name |
| `metric` | string | Metric used |
| `interval` | string | Bucket interval |
| `period` | string | Time period |
| `points` | array | Array of `{ date, value }` |

---

## 4. Industry Performance Timeseries

```
GET /analytics/industries/:industryId/timeseries
```

**Method**: `GET`

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `industryId` | string | Yes | Industry ObjectId |

### Query Parameters

Same as seller timeseries: `period`, `interval`, `metric`.

### Request Example (cURL)

```bash
curl -X GET "http://localhost:8000/api/v1/admin/analytics/industries/65b2cd34ef567890ab12/timeseries?period=12m&interval=month&metric=value" \
  -b "adminToken=YOUR_TOKEN"
```

### Response — `200 OK`

```json
{
  "success": true,
  "message": "Industry timeseries fetched",
  "data": {
    "industryId": "65b2cd34ef567890ab12",
    "industry": "Automotive Textiles Ltd",
    "metric": "value",
    "interval": "month",
    "period": "12m",
    "points": [
      { "date": "2025-03", "value": 800000 },
      { "date": "2025-04", "value": 950000 },
      { "date": "2025-05", "value": 1100000 }
    ]
  },
  "errors": null
}
```

---

## Error Responses

### 400 — Invalid ID

```json
{
  "success": false,
  "message": "Invalid seller id",
  "data": null,
  "errors": { "message": null, "code": "INVALID_SELLER_ID" }
}
```

### 404 — Not Found

```json
{
  "success": false,
  "message": "Seller not found",
  "data": null,
  "errors": { "message": null, "code": "SELLER_NOT_FOUND" }
}
```

### 401 — Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized: Admin authentication required",
  "data": null,
  "errors": { "message": "No admin token provided" }
}
```

### 500 — Server Error

```json
{
  "success": false,
  "message": "Failed to fetch seller rankings",
  "data": null,
  "errors": { "message": "Database error details" }
}
```

---

## React Integration Examples

### Rankings Hook

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useRankings(type = 'sellers', period = '3m', limit = 10, metric = 'value') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:8000/api/v1/admin/analytics/rankings/${type}`, {
      params: { period, limit, metric },
      withCredentials: true,
    })
    .then(res => setData(res.data.data))
    .catch(err => setError(err.response?.data?.message || 'Error'))
    .finally(() => setLoading(false));
  }, [type, period, limit, metric]);

  return { data, loading, error };
}
```

### Timeseries Hook

```javascript
export function useTimeseries(type, id, period = '3m', interval = 'month', metric = 'value') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios.get(`http://localhost:8000/api/v1/admin/analytics/${type}/${id}/timeseries`, {
      params: { period, interval, metric },
      withCredentials: true,
    })
    .then(res => setData(res.data.data))
    .catch(err => setError(err.response?.data?.message || 'Error'))
    .finally(() => setLoading(false));
  }, [type, id, period, interval, metric]);

  return { data, loading, error };
}
```

### Usage

```jsx
// Seller leaderboard
const { data } = useRankings('sellers', '6m', 10, 'value');

// Industry leaderboard
const { data } = useRankings('industries', '3m', 5, 'orders');

// Seller chart data
const { data } = useTimeseries('sellers', sellerId, '12m', 'month', 'value');

// Industry chart data
const { data } = useTimeseries('industries', industryId, '6m', 'week', 'orders');
```

---

## Changelog

**v1.0.0** (2026-02-13)
- Seller rankings with totalValue, totalOrders, avgOrderValue, uniqueBuyers
- Industry rankings with totalValue, totalOrders, activeBuyers, avgOrderValue
- Seller timeseries with day/week/month intervals
- Industry timeseries with day/week/month intervals
- Period filtering: 3m, 6m, 12m, lifetime
