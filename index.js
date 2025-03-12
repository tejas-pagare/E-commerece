const express = require('express');
const app = express();
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const products = require('./data/products.json')
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.get('/', async (req, res) => {
  try {

    res.render('homepage/index.ejs', { title: 'Home', products });

  } catch (error) {
    console.log(error);
  }
}
)
app.get('/login', (req, res) => res.render('user/login.ejs', { title: 'login' }));
app.get('/signup', (req, res) => res.render('user/signup.ejs', { title: 'signup' }));

app.get('/product/:id', (req, res) => {
  const { id } = req.params;
  const product = products.find(product => product.id === Number(id));
  let filteredProducts = products.filter(product => product.id !== id);
  filteredProducts = filteredProducts.slice(0, 5);

  console.log(product)
  res.render('product/index.ejs', { title: 'Product page', product, filteredProducts })
});

app.get('/blog', (req, res) => res.render('blog/index.ejs', { title: 'Blog Page' }));
app.get('/contact', (req, res) => res.render('contact/index.ejs', { title: 'Contact Page' }));

const PORT = 8000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
