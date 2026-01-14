import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import Seller from '../models/seller.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Product from '../models/product.js';
import cloudinary, { upload } from '../config/cloudinary.js';
import Order from '../models/orders.js';
import mongoose from 'mongoose';
import User from '../models/user.js';
import { classifyImage } from '../utils/classifier.js';

const router = express.Router();

// Auth endpoints (React-friendly JSON)
router.get('/login', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Seller login endpoint. POST { email, password } to authenticate.'
  });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const sellerCheck = await Seller.findOne({ email });
    if (!sellerCheck) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, sellerCheck.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'JWT_SECRET';
    const token = jwt.sign({ userId: sellerCheck._id, role: 'seller' }, jwtSecret, { expiresIn: '5h' });

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'None' : 'Lax',
      maxAge: 5 * 60 * 60 * 1000
    });

    const { password: _pw, ...safeSeller } = sellerCheck.toObject();
    return res.status(200).json({ success: true, message: 'Login successful', seller: safeSeller });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'An unexpected error occurred' });
  }
});

router.get('/signup', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Seller signup endpoint. POST required fields to register.'
  });
});

router.post('/signup', upload.fields([{ name: 'profileImage' }, { name: 'aadhaarImage' }]), async (req, res) => {
  try {
    const { name, password, email, gstn, phoneNumber, accountNumber, ifscCode, bankName, storeName, street, city, state, pincode, country } = req.body;

    if (!name || !password || !email || !gstn || !phoneNumber || !storeName) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if (!req.files || !req.files['profileImage'] || !req.files['aadhaarImage']) {
      return res.status(400).json({ success: false, error: 'Profile image and Aadhaar image are required' });
    }

    const existing = await Seller.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const uploadToCloudinary = (fileBuffer, folder) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder, resource_type: 'auto' },
          (error, uploadedFile) => {
            if (error) return reject(error);
            resolve(uploadedFile);
          }
        );
        uploadStream.end(fileBuffer);
      });
    };

    const [result1, result2] = await Promise.all([
      uploadToCloudinary(req.files['profileImage'][0].buffer, 'uploads'),
      uploadToCloudinary(req.files['aadhaarImage'][0].buffer, 'uploads')
    ]);

    const hashPassword = await bcrypt.hash(password, 10);

    const seller = new Seller({
      name,
      storeName,
      email,
      password: hashPassword,
      gstn,
      phoneNumber,
      bankDetails: {
        accountNumber,
        ifscCode,
        bankName
      },
      profileImage: result1?.secure_url || '',
      identityVerification: { aadharCard: result2?.secure_url || '', status: 'Pending' },
      address: { street, city, state, pincode, country }
    });
    await seller.save();

    const { password: _pw, ...safeSeller } = seller.toObject();
    return res.status(201).json({ success: true, message: 'Signup successful', seller: safeSeller });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Failed to sign up' });
  }
});

router.get('/logout', isAuthenticated, (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ success: true, message: 'Logged out' });
});

// Keep the rest of seller routes as-is (EJS or JSON as currently implemented)
router.get('/create', isAuthenticated, (req, res) => {
  console.log(req.role);
  return res.render('seller/Product/index.ejs', { title: 'Create Product', role: 'seller' });
});

router.post('/create', upload.single('img'), isAuthenticated, async (req, res) => {
  try {
    const { title, price, description, category, quantity, stock } = req.body;
    const userId = req.userId;
    if (!title || !price || !description || !category || !quantity) {
      return res.json({
        message: 'All fields are required',
        success: false
      });
    }

    // --- ML Model Verification ---
    if (req.file && req.file.buffer) {
      try {
        console.log("Verifying image with ML models...");
        const classification = await classifyImage(req.file.buffer);

        if (!classification.is_cloth) {
          return res.status(400).json({
            success: false,
            message: "Image verification failed: The uploaded image does not appear to be a cloth."
          });
        }

        console.log(`Image verified. Predicted Category: ${classification.category}`);
        // Override the category with the specialist model's prediction
        // This ensures the DB stores the verified category
        req.body.category = classification.category;

      } catch (mlError) {
        console.error("ML Verification Error:", mlError);
        // Fail safely or block? Requirement implies strict verification.
        return res.status(500).json({
          success: false,
          message: "Image verification service unavailable."
        });
      }
    }
    // -----------------------------

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'uploads', resource_type: 'auto' },
        (error, uploadedFile) => {
          if (error) return reject(error);
          resolve(uploadedFile);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const newProduct = await Product.create({
      sellerId: userId,
      title,
      price,
      description,
      category,
      image: result.secure_url || 'https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_.jpg',
      quantity,
      stock
    });

    const seller = await Seller.findById(userId);
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    console.log(seller);
    seller.products.push(newProduct);
    await seller.save();
    return res.json({
      message: 'Create Product',
      success: true
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: 'Server error',
      success: false
    });
  }
});

router.post('/update/:id', isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const { title, price, description, image, quantity, stock } = req.body;
    console.log(quantity);
    const product = await Product.findById(id);
    if (title) product.title = title;
    if (price) product.price = price;
    if (description) product.description = description;
    if (image) product.image = image;
    if (quantity) product.quantity = quantity;
    if (stock !== (null || undefined)) product.stock = stock;
    await product.save();
    return res.json({
      message: 'product updated successfully',
      success: true
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: 'Server error',
      success: false
    });
  }
});

router.get('/update/:id', isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    res.render('seller/updateProduct/index.ejs', { title: 'Update Product', role: 'seller', product });
    return;
  } catch (error) {
    res.redirect('/api/v1/seller');
    return;
  }
});

router.delete('/product/:id', isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const seller = await Seller.findById(req.userId);
    const checkProducts = seller.products.find((e) => e.toString() === id);

    if (!checkProducts) {
      return res.json({
        message: 'Error in removing product'
      });
    }

    await Promise.all([
      Seller.findOneAndUpdate({ _id: req.userId }, { $pull: { products: id } }, { new: true }),
      Product.findByIdAndDelete(id)
    ]);
    console.log('sucess');
    return res.json({
      message: 'Products removed successfully',
      success: true
    });
  } catch (error) {
    res.json({
      message: 'Internal server error',
      success: false
    });
  }
});

router.get('/account', isAuthenticated, async (req, res) => {
  const seller = await Seller.findById(req.userId);
  res.render('Seller/profile/show.ejs', { title: 'Account', role: req.role, seller });
});

router.get('/account/update', isAuthenticated, async (req, res) => {
  const seller = await Seller.findById(req.userId);
  res.render('Seller/profile/index.ejs', { title: 'Account', role: req.role, seller });
});

router.post('/account/update', isAuthenticated, async (req, res) => {
  const { name, gstn, email } = req.body;
  console.log(name, gstn, email);
  try {
    if (!email || !name || !gstn) {
      return res.status(400).json({ success: false, message: 'name, email and gstn are required' });
    }
    await Seller.findByIdAndUpdate(req.userId, { name, gstn, email });
    res.json({ success: true, message: 'Account updated successfully' });
    return;
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update account' });
  }
});

// Render the listed products page (without product data)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    return res.render('seller/listedProduct/index.ejs', { title: 'Listed Product', role: 'seller', productListed: [] });
  } catch (error) {
    res.json({
      message: 'Internal error'
    });
  }
});

// API route to fetch listed products as JSON
router.get('/products', isAuthenticated, async (req, res) => {
  try {
    const userId = req.userId;
    const productListed = await Seller.findById(userId).populate('products');
    res.json({
      success: true,
      products: productListed?.products || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal error'
    });
  }
});

// API: get a single product details for editing (JSON)
router.get('/product/:id', isAuthenticated, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    // Ensure seller owns the product
    if (String(product.sellerId) !== String(req.userId)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    return res.json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
});

// API: get current seller account details (JSON)
router.get('/account/me', isAuthenticated, async (req, res) => {
  try {
    const seller = await Seller.findById(req.userId);
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });
    const { password: _pw, ...safeSeller } = seller.toObject();
    return res.json({ success: true, seller: safeSeller });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
});

// API: update current seller account (JSON)
router.patch('/account', isAuthenticated, async (req, res) => {
  try {
    const allowed = ['name', 'gstn', 'email', 'phoneNumber', 'storeName', 'address'];
    const update = {};
    for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, message: 'No updatable fields provided' });
    }
    const seller = await Seller.findByIdAndUpdate(req.userId, update, { new: true });
    const { password: _pw, ...safeSeller } = seller.toObject();
    return res.json({ success: true, seller: safeSeller });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update account' });
  }
});

// Route to get sold products for a seller
router.get('/sold-products', isAuthenticated, async (req, res) => {
  try {
    const sellerId = req.userId;

    // Find orders with products from this seller using aggregation pipeline
    const orders = await Order.aggregate([
      // Unwind the products array to work with individual products
      { $unwind: '$products' },

      // Lookup to get product details
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },

      // Match products that belong to the current seller and valid order statuses
      {
        $match: {
          'productDetails.sellerId': new mongoose.Types.ObjectId(sellerId),
          orderStatus: { $in: ['Delivered', 'Shipped', 'Processing'] }
        }
      },

      // Format the output data
      {
        $project: {
          id: '$_id',
          name: '$productDetails.title',
          price: '$products.price',
          quantity: '$products.quantity',
          buyerName: '$shippingAddress.fullname',
          orderDate: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          status: '$orderStatus',
          totalAmount: { $round: [{ $multiply: ['$products.price', '$products.quantity'] }, 2] }
        }
      },

      // Sort by order date, most recent first
      { $sort: { orderDate: -1 } }
    ]);

    // Render the page with the fetched data
    res.render('seller/SoldProduct/index', {
      soldProducts: orders || [],
      title: 'Sold Products',
      role: 'seller',
      error: ''
    });
  } catch (error) {
    console.error('Error fetching sold products:', error);
    // Render the page with empty data in case of error
    res.render('seller/SoldProduct/index', {
      soldProducts: [],
      title: 'Sold Products',
      role: 'seller',
      error: 'Failed to fetch sold products'
    });
  }
});

// API: sold products as JSON
router.get('/sold-products/data', isAuthenticated, async (req, res) => {
  try {
    const sellerId = req.userId;
    const orders = await Order.aggregate([
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $match: {
          'productDetails.sellerId': new mongoose.Types.ObjectId(sellerId),
          orderStatus: { $in: ['Delivered', 'Shipped', 'Processing'] }
        }
      },
      {
        $project: {
          id: '$_id',
          name: '$productDetails.title',
          price: '$products.price',
          quantity: '$products.quantity',
          buyerName: '$shippingAddress.fullname',
          orderDate: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          status: '$orderStatus',
          totalAmount: { $round: [{ $multiply: ['$products.price', '$products.quantity'] }, 2] }
        }
      },
      { $sort: { orderDate: -1 } }
    ]);
    return res.json({ success: true, soldProducts: orders || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch sold products' });
  }
});

// Add: Get order requests for the authenticated seller (JSON)
router.get('/orders/requests', isAuthenticated, async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.userId);

    const pipeline = [
      { $match: { orderStatus: { $in: ['Pending', 'Processing'] } } },
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      { $match: { 'productDetails.sellerId': sellerId } },
      {
        $group: {
          _id: '$_id',
          orderId: { $first: '$_id' },
          orderStatus: { $first: '$orderStatus' },
          shippingAddress: { $first: '$shippingAddress' },
          createdAt: { $first: '$createdAt' },
          buyerId: { $first: '$userId' },
          items: {
            $push: {
              productId: '$productDetails._id',
              title: '$productDetails.title',
              price: '$products.price',
              quantity: '$products.quantity',
              image: '$productDetails.image', // include image URL
              total: { $multiply: ['$products.price', '$products.quantity'] }
            }
          },
          totalAmount: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
        }
      },
      { $sort: { createdAt: -1 } }
    ];

    const results = await Order.aggregate(pipeline);

    // Optional: populate buyer name/email for convenience
    const populated = await Promise.all(results.map(async (r) => {
      let buyer = null;
      try {
        buyer = await User.findById(r.buyerId).select('firstname lastname email').lean();
      } catch (e) {
        buyer = null;
      }
      return {
        orderId: r.orderId,
        status: r.orderStatus,
        orderDate: r.createdAt,
        shippingAddress: r.shippingAddress,
        buyer,
        items: (r.items || []).map(item => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image || null,
          total: item.total
        })),
        totalAmount: r.totalAmount
      };
    }));

    return res.status(200).json({ success: true, orders: populated });
  } catch (error) {
    console.error('Error fetching seller order requests:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch order requests', error: error.message });
  }
});

// Update order status for orders that include this seller's products
// Method: PUT
// URL (full): /api/v1/seller/orders/:orderId/seller/status
router.put('/orders/:orderId/seller/status', isAuthenticated, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;
    const sellerId = req.userId;

    // Validate orderId
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order id' });
    }

    // Validate requested status
    const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
    if (!orderStatus || !allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing orderStatus' });
    }

    // Load order including product docs to check ownership
    const order = await Order.findById(orderId).populate({ path: 'products.productId', select: 'sellerId title image price' });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Check if seller owns at least one item in this order
    const sellerItems = order.products.filter(p => p.productId && String(p.productId.sellerId) === String(sellerId));
    if (!sellerItems.length) {
      return res.status(403).json({ success: false, message: 'You do not have permission to update this order' });
    }

    // Update order status (note: this updates entire order status)
    order.orderStatus = orderStatus;
    await order.save();

    // Build response summary: items annotated with sellerOwned flag
    const responseOrder = {
      _id: order._id,
      orderStatus: order.orderStatus,
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress,
      userId: order.userId,
      products: order.products.map(p => ({
        productId: p.productId?._id || null,
        title: p.productId?.title || null,
        price: p.price,
        quantity: p.quantity,
        image: p.productId?.image || null,
        sellerOwned: !!(p.productId && String(p.productId.sellerId) === String(sellerId))
      }))
    };

    return res.status(200).json({
      success: true,
      message: 'Order status updated',
      order: responseOrder
    });
  } catch (error) {
    console.error('Seller update order status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update order status', error: error.message });
  }
});

export default router;