# Developer Guide

This document explains the architecture, setup, and development workflow for the EJS + Node.js + MongoDB application in this repository.

- Entry point: `index.js`
- Server framework: Express (SSR with EJS layouts)
- Database: MongoDB via Mongoose
- Auth: Cookie-based JWT for users/sellers/industry; custom middleware
- Media: Cloudinary for image uploads (multer in-memory buffers → Cloudinary upload_stream)
- Static assets: `public/` served by Express
- Views: EJS templates under `views/`
- API/UI routes: Mounted under `/api/v1/*`

## Overview and Purpose

The app powers a commerce experience with multiple actors and flows:
- User storefront: browsing products, cart, checkout, reviews, profile management
- Seller portal: authentication, product listing and management
- Admin portal: dashboards, customer/seller/product management, order management
- Industry portal: donation/collection of used clothes with combination-based valuation and checkout-like flow

The UI is primarily server-rendered via EJS, with several JSON endpoints used by front-end scripts to fetch data dynamically.

## Tech Stack and Dependencies

- Runtime: Node.js (ES Modules)
- Framework: Express 4
- Templates: EJS + express-ejs-layouts
- DB: MongoDB (Mongoose 8)
- Auth: jsonwebtoken (JWT via cookies), express-session (basic session cookie)
- Uploads: multer (memory storage) + Cloudinary SDK
- Utilities: axios, bcryptjs, cookie-parser, cors, dotenv, uuid
- Testing: Jest (+ supertest)

See `package.json` for exact versions and scripts.

## Folder Structure

- `index.js` — Bootstraps Express, configures middleware, layouts, static, mounts routes, starts server and connects DB
- `config/`
  - `db.js` — Mongoose connection (uses `process.env.MONGODB_URL` with a hardcoded Atlas fallback)
  - `cloudinary.js` — Cloudinary config and a shared `upload` (multer memory storage)
- `controller/` — Business logic for route handlers
  - `user.js`, `industry.js` (seller/product controllers are mostly implemented in route files)
- `middleware/`
  - `isAuthenticated.js` — Auth for users/sellers; also exports `industryAuth`
  - `managerAuth.js` — Manager auth (expects Authorization header JWT)
- `models/` — Mongoose schemas: `user`, `seller`, `product`, `orders`, `Industry`, `Reviews`, `SellProduct`, `manager`, histories
- `routes/` — Express routers mounted in `index.js`
- `views/` — EJS templates organized by role/area; `layouts/main.ejs` default layout
- `public/` — Static assets (css/js)
- `data/` — Blog posts, sample data
- `tests/` — Jest tests and helpers
- `docs/` — Documentation (this file, testing docs)

## Setup and Installation

Prerequisites:
- Node.js LTS (v18+ recommended)
- MongoDB (local or Atlas URI)
- Cloudinary account (for seller images and product images)

Steps (Windows PowerShell):

```powershell
# 1) Install dependencies
npm install

# 2) Create .env with required variables (see next section)
# 3) Start the server (port 8000)
node index.js
# or via npm script defined as build
npm run build
```

By default the app listens on http://localhost:8000.

## Environment Variables and Configuration

Create a `.env` file in the project root:

```env
# Database
MONGODB_URL=mongodb://127.0.0.1:27017/swiftmart

# JWT (used by manager auth; other areas currently use a hardcoded string "JWT_SECRET")
JWT_SECRET=replace-with-strong-random

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Node environment (optional)
NODE_ENV=development
```

Notes:
- `config/db.js` uses `process.env.MONGODB_URL` when set; otherwise it falls back to a hardcoded Atlas URI. Set `MONGODB_URL` to avoid accidentally connecting to the fallback.
- `index.js`’s CORS origin is currently hard-coded to `http://localhost:8000`.
- `express-session` secret is hardcoded to `secret-swiftmart`. For production, you should externalize it to an env var and rotate periodically.

## Architecture: Routes, Controllers, Views

- Express app (`index.js`) mounts routers and sets the EJS layout:
  - `/api/v1/user` → `routes/user.js`
  - `/api/v1/product` → `routes/product.js`
  - `/api/v1/seller` → `routes/seller.js`
  - `/api/v1/admin` → `routes/admin.js`
  - `/api/v1/industry` → `routes/industry.js`
  - `/api/v1/manager` → `routes/manager.js`
- Controllers coordinate model operations and either:
  - Render EJS templates with data (`res.render(...)`), or
  - Return JSON for client-side rendering/logic
- Middleware:
  - `isAuthenticated` validates the `token` cookie (JWT payload `{ userId, role }`) for users/sellers
  - `industryAuth` validates the industry token (placed in the same cookie `token`)
  - `managerAuth` expects an Authorization header; many manager routes are currently public in code

Request lifecycle: Router → optional middleware → controller → view render or JSON → fallback route (`GET *`) returns `{ message: "Acess denied" }`.

## API Reference (Endpoints)

Base URL: `http://localhost:8000`

All routes below are prefixed as mounted in `index.js` (e.g. `GET /api/v1/user/login`). Many routes render EJS pages; JSON routes are marked.

### User routes (`/api/v1/user`)
- GET `/login` (HTML), POST `/login`
- GET `/signup` (HTML), POST `/signup`
- GET `/logout`
- GET `/account` (HTML, auth)
- GET `/account/update` (HTML, auth), POST `/account/update` (auth)
- GET `/account/details` (JSON, auth)
- GET `/account/address` (HTML, auth)
- GET `/account/address/details` (JSON, auth)
- GET `/account/update/address` (HTML, auth), POST `/account/update/address` (JSON, auth)
- GET `/sell` (HTML, auth), POST `/sell` (multipart, auth)
- GET `/store` (HTML)
- GET `/blog/:id` (HTML, auth), GET `/blog` (HTML, auth)
- GET `/shop` (HTML, auth), GET `/vendors` (HTML, auth), GET `/contact` (HTML, auth)
- GET `/cart` (HTML), POST `/cart` (HTML shell), POST `/cart/add/:id` (JSON, auth), POST `/cart/remove/:id` (JSON, auth), DELETE `/cart/remove/:id` (JSON, auth)
- GET `/products` (JSON, auth) — first 8 products
- GET `/products/filter` (JSON, auth) — query params: category, material, gender, size, minPrice, maxPrice
- GET `/checkout` (HTML, auth), GET `/checkout-details` (JSON, auth)
- POST `/payment` (JSON, auth)
- GET `/donated-products` (JSON, auth)
- GET `/order-history` (JSON, auth)
- GET `/dashboard` (HTML, auth); GET `/dashboard/sellproduct` (HTML, auth)
- GET `/` (HTML, auth)
- POST `/review/create/:id` (JSON, auth)

Example: filter products

```http
GET /api/v1/user/products/filter?category=Shirts&minPrice=100&maxPrice=500
```

Example: product details

```http
GET /api/v1/product/details/64f0c2...
```

Response shape:

```json
{
  "success": true,
  "product": { "_id": "...", "title": "...", "price": 99 },
  "relatedProducts": [ { "_id": "..." } ]
}
```

### Product routes (`/api/v1/product`)
- GET `/details/:id` (JSON: `{ success, product, relatedProducts }`)
- GET `/:id` (HTML Product page shell)

### Seller routes (`/api/v1/seller`)
- GET `/login` (HTML), POST `/login` (cookie `token` with role seller)
- GET `/signup` (HTML), POST `/signup` (multipart: `profileImage`, `aadhaarImage`)
- GET `/logout`
- GET `/create` (HTML), POST `/create` (multipart `img`, auth) → creates product and pushes to seller.products
- GET `/update/:id` (HTML), POST `/update/:id` (JSON, auth)
- DELETE `/product/:id` (JSON, auth)
- GET `/account` (HTML, auth), GET `/account/update` (HTML), POST `/account/update` (JSON)
- GET `/` (HTML listing of seller products)
- GET `/sold-products` (HTML) — aggregated orders for this seller

### Admin routes (`/api/v1/admin`)
- GET `/login` (HTML), POST `/dashboard` (email+password form)
- GET `/dashboard` (HTML admin dashboard)
- GET `/secondHand` (HTML)
- GET `/customers` (HTML) + GET `/api/customers` (JSON)
- GET `/dashboard/sellproduct` (HTML), POST `/dashboard/sellproduct` (form to update `userStatus`)
- GET `/products` (HTML), GET `/api/products` (JSON)
- GET `/products/details` (JSON, same as `/api/products`)
- DELETE `/product/:id` (JSON)
- GET `/seller` (HTML list), GET `/seller/details` (JSON)
- GET `/seller/approve/:id` (JSON), GET `/seller/disapprove/:id` (JSON)
- GET `/product/approve/:id` (JSON), GET `/product/disapprove/:id` (JSON)
- Manager management: GET `/manager` (HTML), POST `/create/manager` (JSON), GET `/managers` (JSON), DELETE `/managers/:id` (JSON)
- Orders: GET `/order` (HTML), POST `/orders` (JSON grouped), GET `/orders` (JSON grouped), GET `/orders/:userId` (JSON), PUT `/orders/:orderId/status` (JSON)
- Delivery management page: GET `/delivery` (HTML)

### Industry routes (`/api/v1/industry`)
- GET `/login` (HTML), POST `/login`
- GET `/signup` (HTML), POST `/signup`
- GET `/logout` (clears `token` cookie)
- GET `/about` (HTML)
- GET `/home` (HTML), GET `/fetchhome` (JSON of `SellProduct` combinations pending/verified)
- GET `/blog` (HTML)
- GET `/profile` (HTML), GET `/profile/edit` (HTML), POST `/profile/edit`
- GET `/cart` (HTML), POST `/cart` (adds combination item), POST `/cartDelete` (removes item)
- GET `/checkout` (HTML), POST `/checkout` (updates SellProduct statuses to Sold, pushes into `Industry.dashboard`, clears cart)
- GET `/dashboard` (HTML), GET `/fetchdashboard` (JSON orders + totalAmount)

### Manager routes (`/api/v1/manager`)
- GET `/login` (HTML), POST `/login` (JSON: sets `managerToken` cookie; many manager routes are currently public)
- Product verification: GET `/product/verify/:id`, GET `/product/reject/:id`, POST `/product/verify/:id`, POST `/product/reject/:id`
- Sellers: GET `/sellers` (HTML), GET `/sellers/pending`, GET `/sellers/verified`, GET `/sellers/stats`, GET `/seller/details`, GET `/seller/verify/:id`, GET `/seller/reject/:id`

Authentication notes:
- User/Seller/Industry JWT stored in `token` cookie using the literal secret string "JWT_SECRET" in several places. Align to an env var for production.
- Manager middleware expects a different token shape; consider standardizing.

## MongoDB Schemas

- `models/user.js` — User accounts, email+password, `cart` with `{ productId, quantity }`, `products` (if also sellers), `Address`, `reviews`
- `models/seller.js` — Seller profile (storeName, gstn, profileImage, identityVerification, address, bankDetails), `products` refs; pre-delete hook deletes their products
- `models/product.js` — Product owned by `sellerId` (ref currently points to `User`), fields: `title, price, description, category, image, verified, stock, quantity`, timestamps, `reviews`
- `models/orders.js` — Order: `userId`, `products` array with `{ productId, quantity, price }`, `orderStatus`, `paymentStatus`, `paymentMethod`, `shippingAddress`
- `models/Industry.js` — Industry org with `cart` and `dashboard` arrays of combination items, `Address`
- `models/Reviews.js` — Review: `user`, `product`, `rating`, `description`
- `models/SellProduct.js` — Donated/second-hand item: `user_id` (string), `fabric`, `size`, `gender`, `usageDuration`, `image` buffer, `clothesDate`, `timeSlot`, `userStatus`, `adminStatus`, `estimated_value`, `combination_id`
- `models/manager.js` — Manager with SHA-256 hashed passwords and `comparePassword`

## Error Handling and Logging

Current:
- Unmatched GET → `{ message: "Acess denied" }`
- No centralized error handler

Recommendation:
- Add 404 and error middleware; use `morgan`/`winston` for logs

## Contribution Guidelines

- Branch naming: `feature/*`, `fix/*`, `chore/*`
- Conventional commits preferred
- Add/update tests for new behavior under `tests/`
- Keep routes thin; put logic in controllers; keep models cohesive

## Deployment

Local:

```powershell
npm install
node index.js
```

Production:
- Set env vars (`MONGODB_URL`, `JWT_SECRET`, Cloudinary creds)
- Run behind a process manager (e.g., PM2) and a reverse proxy

PM2 example:

```powershell
npm install -g pm2
pm2 start index.js --name swiftmart --env production
pm2 save
```

Sample `.env`:

```env
NODE_ENV=production
MONGODB_URL=mongodb+srv://user:pass@cluster/db
JWT_SECRET=change-me
CLOUDINARY_CLOUD_NAME=prod-cloud
CLOUDINARY_API_KEY=prod-key
CLOUDINARY_API_SECRET=prod-secret
```

## Testing

```powershell
npx jest
# or on Windows if ESM interop issues
npm run test:win
```

## Troubleshooting

- Ensure `MONGODB_URL` points to the correct DB
- Cloudinary credentials must be present
- CORS origin in `index.js` is fixed to `http://localhost:8000`
- Unify JWT secret usage across middlewares and controllers before production
