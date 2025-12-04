# AI Model Integration: Frontend Prompts & User Guide

Use the following text snippets in your React frontend to explain the AI verification process to Sellers and Users.

## 🛍️ For Sellers (Add New Product)

**Context:** Display this near the Image Upload section or as a tooltip when the user hovers over the upload button.

### Short Tooltip
> "Our AI automatically verifies your image and detects the product category for you."

### Modal / Helper Text
> **Smart Image Verification**
> 1. **Upload**: Select a clear image of your clothing item.
> 2. **Verify**: Our system instantly checks if the image is a valid clothing item.
> 3. **Auto-Categorize**: If verified, we automatically fill in the **Category** field (e.g., T-Shirt, Dress, Jeans) based on the image.
> 
> *Note: Non-clothing images will be rejected to maintain platform quality.*

### Error Message (If upload fails)
> "⚠️ **Image Rejected**: Our system could not identify this as a clothing item. Please upload a clear photo of the apparel."

---

## ♻️ For Users (Sell Second-Hand)

**Context:** Display this on the "Sell Your Old Clothes" form, specifically near the photo upload or item name field.

### Short Tooltip
> "Snap a photo! We'll scan it to confirm it's cloth and name the item for you."

### Step-by-Step Guide
> **How it works:**
> 1. **Upload Photo**: Upload a photo of the cloth you want to sell.
> 2. **AI Scan**: We use smart technology to confirm it's a clothing item.
> 3. **Auto-Fill**: We'll automatically identify the item (e.g., "Woolen Sweater") and fill in the **Item Name** for you!

### Success Message
> "✅ **Verified!** We identified this as a **[Category Name]**."

### Error Message
> "⚠️ **Verification Failed**: That doesn't look like a clothing item. Please ensure the photo clearly shows the cloth you wish to sell."

---

## 🧠 Technical Explanation (For "How it Works" Page)

> "We use a dual-stage Machine Learning pipeline to ensure data accuracy:
> 1. **The Gatekeeper**: A specialized model first scans every upload to verify it is a genuine clothing item, filtering out irrelevant images.
> 2. **The Specialist**: Once verified, a second high-precision model analyzes the style and texture to automatically classify the item into specific categories like T-Shirts, Trousers, or Dresses."
