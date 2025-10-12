# Database Schema Definitions

Below are the main Mongoose schema definitions used in this project.

---

## User

```js
const UserSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: { type: String, unique: true },
  password: String,
  Address: {
    plotno: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    phone: String
  },
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number
    }
  ],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
  // ...other fields as needed
});
```

---

## Product

```js
const ProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  verified: { type: Boolean, default: false }
  // ...other fields as needed
});
```

---

## Seller

```js
const SellerSchema = new mongoose.Schema({
  name: String,
  storeName: String,
  email: String,
  gstn: String,
  profileImage: String,
  identityVerification: {
    aadharCard: String,
    status: { type: String, enum: ['Pending', 'Verified'], default: 'Pending' }
  },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    ifsc: String
  }
  // ...other fields as needed
});
```

---

## Manager

```js
const ManagerSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
});
```

---

## Order

```js
const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  paymentStatus: String,
  paymentMethod: String,
  shippingAddress: {
    fullname: String,
    plotno: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    phone: String
  },
  orderStatus: { type: String, default: 'Pending' }
  // ...other fields as needed
});
```

---

## SellProduct

```js
const SellProductSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: String,
  fabric: String,
  size: String,
  gender: String,
  usageDuration: String,
  image: {
    data: Buffer,
    contentType: String
  },
  description: String,
  clothesDate: Date,
  timeSlot: String,
  combination_id: String,
  estimated_value: Number,
  userStatus: String,
  adminStatus: String
});
```

---

## Review

```js
const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  rating: Number,
  description: String
});
```

---

## UserHistory

```js
const UserHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orders: [
    {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      products: [
        {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
          quantity: Number,
          price: Number
        }
      ],
      totalAmount: Number,
      status: String
    }
  ]
});
```

---

*Note: Some fields may be omitted for brevity. Refer to the actual model files for complete definitions.*
