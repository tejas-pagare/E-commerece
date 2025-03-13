import express from 'express';
import path from 'path';
import { promises as fs } from 'fs';
import products from '../data/products.js';
import { error } from 'console';


const router = express.Router();
router.get("/login", (req, res) => {
  res.render('user/login.ejs', { title: 'login', error: "" })
})
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {

    const filePath = path.join('C:/Users/HP/Desktop/FFSD/FFSD main project/data/user.json');
    const fileData = await fs.readFile(filePath, 'utf-8');
    const users = JSON.parse(fileData || '[]');
    const user = users.find(user => user.email === email && user.password === password);
    if (!user) {
      return res.render("user/login", { title: 'login', error: "Invalid email or password" });
    }
    console.log('User logged in:', user);
    return res.render("homepage/index.ejs", { products, title: "Homepage" });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).send("Internal Server Error");
  }
});

router.get("/signup", (req, res) => {
  res.render('user/signup.ejs', { title: 'signup' })
})
router.post("/signup", async (req, res) => {
  const filePath = path.join('C:/Users/HP/Desktop/FFSD/FFSD main project/data/user.json');
  let newUser = req.body;
  newUser = { ...newUser, cart: [], profilePhoto: "", address: "" }
  try {
    let users = [];
    try {
      const existingData = await fs.readFile(filePath, 'utf-8');
      users = JSON.parse(existingData);
    } catch (error) {
      console.log('user.json not found or empty, initializing a new one.');
    }
    users.push(newUser);
    await fs.writeFile(filePath, JSON.stringify(users, null, 2));

    console.log('New user saved:', newUser);
    return res.redirect("/");
  } catch (error) {
    console.error('Error writing to user.json:', error);
    return res.status(500).send("Internal Server Error");
  }
});

router.post("/update", async (req, res) => {
  const { userId, firstName, lastName, email, profilePhoto, address } = req.body;
  try {
    const filePath = path.join('C:/Users/HP/Desktop/FFSD/FFSD main project/data/user.json');
    const fileData = await fs.readFile(filePath, 'utf-8');

    const users = JSON.parse(fileData || '[]');

    // Find the user by userId
    const userIndex = users.findIndex(user => user.id === userId);
    users[userIndex] = { ...users[userIndex], firstName, lastName, email, profilePhoto, address };
    await fs.writeFile(filePath, JSON.stringify(users, null, 2));
    return res.status(200).json({
      message: "User details updated successfully",
      user: users[userIndex]
    })

  } catch {
    console.error('Error writing to user.json:', error);
    return res.status(500).send("Internal Server Error");
  }
})

router.post("/cart/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { userId, method } = req.body;

    const filePath = path.join('C:/Users/HP/Desktop/FFSD/FFSD main project/data/user.json');
    const fileData = await fs.readFile(filePath, 'utf-8');

    const users = JSON.parse(fileData || '[]');

    // Find the user by userId
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the product is already in the cart
    const cartItem = users[userIndex].cart.find(item => item.productId === productId);

    if (method === 'add') {
      if (cartItem) {
        // Increase quantity if product already in cart
        cartItem.quantity += 1;
      } else {
        // Add new product with quantity 1 if not in cart
        users[userIndex].cart.push({ productId, quantity: 1 });
      }
    } else if (method === 'decrease') {
      if (cartItem) {
        if (cartItem.quantity > 1) {
          // Decrease quantity if greater than 1
          cartItem.quantity -= 1;
        } else {
          // Remove product if quantity is 1
          users[userIndex].cart = users[userIndex].cart.filter(item => item.productId !== productId);
        }
      } else {
        return res.status(400).json({ message: 'Product not found in cart' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid method' });
    }

    // Save updated users array to file
    await fs.writeFile(filePath, JSON.stringify(users, null, 2));

    return res.status(200).json({ message: 'Cart updated successfully', cart: users[userIndex].cart });

  } catch (error) {
    console.error('Error updating cart:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
})

router.get("/cart", async (req, res) => {

  const { userId } = req.body;

  const filePath = path.join('C:/Users/HP/Desktop/FFSD/FFSD main project/data/user.json');
  try {

    const fileData = await fs.readFile(filePath, 'utf-8');

    const users = JSON.parse(fileData || '[]');

    // Find the user by userId
    const userIndex = users.findIndex(user => user.id === userId);
    return res.status(200).json({
      cart: users[userIndex].cart,
      message: "cart retireved successfully"
    })
  } catch (error) {
    console.error('Error updating cart:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }

})

export default router;