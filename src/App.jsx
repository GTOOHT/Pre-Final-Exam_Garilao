import { useEffect, useMemo, useState } from 'react';
import productsData from './data/products.js';

const STORAGE_PRODUCTS = 'esmiring-shop-products-v1';
const STORAGE_CART = 'esmiring-shop-cart-v1';
const money = (value) => `₱${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};
const blankProduct = {
  name: '', category: 'Apparel', price: '', quantity: '', image: '',
  description: '', specifications: '', rating: '5',
};

function App() {
  const [products, setProducts] = useState(() => readStorage(STORAGE_PRODUCTS, productsData));
  const [cart, setCart] = useState(() => readStorage(STORAGE_CART, []));
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState(blankProduct);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem(STORAGE_CART, JSON.stringify(cart)), [cart]);

  const categories = useMemo(() => ['All', ...new Set(products.map((p) => p.category))], [products]);
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) =>
      (selectedCategory === 'All' || p.category === selectedCategory) &&
      `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(search.toLowerCase())
    );
    if (sortBy === 'price-low') result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, selectedCategory, search, sortBy]);

  const inventoryValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.cartQuantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewProduct((previous) => ({ ...previous, [name]: value }));
  };

  const handleAddProduct = (event) => {
    event.preventDefault();
    const price = Number(newProduct.price);
    const quantity = Number(newProduct.quantity);
    const rating = Number(newProduct.rating);
    if (!newProduct.name.trim() || !newProduct.category || !newProduct.image.trim() ||
      !newProduct.description.trim() || !newProduct.specifications.trim() ||
      newProduct.price === '' || newProduct.quantity === '' ||
      !Number.isFinite(price) || price <= 0 || !Number.isInteger(quantity) || quantity < 0 ||
      !Number.isFinite(rating) || rating < 1 || rating > 5) {
      setNotice('Please complete every field and enter valid price, quantity, and rating values.');
      return;
    }
    const product = {
      ...newProduct,
      id: globalThis.crypto?.randomUUID?.() || String(Date.now()),
      name: newProduct.name.trim(), price, quantity, rating,
      description: newProduct.description.trim(), specifications: newProduct.specifications.trim(),
      image: newProduct.image.trim(),
    };
    setProducts((previous) => [...previous, product]);
    setNewProduct(blankProduct);
    setShowAddForm(false);
    setSelectedCategory('All');
    setNotice('Product added successfully.');
  };

  const addToCart = (product) => {
    if (product.quantity < 1) {
      setNotice('This product is currently out of stock.');
      return;
    }
    const current = cart.find((item) => item.id === product.id)?.cartQuantity || 0;
    if (current >= product.quantity) {
      setNotice('You have added all available stock of this product.');
      return;
    }
    setCart((previous) => {
      const existing = previous.find((item) => item.id === product.id);
      return existing
        ? previous.map((item) => item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item)
        : [...previous, { ...product, cartQuantity: 1 }];
    });
    setNotice(`${product.name} added to cart.`);
  };

  const changeCartQuantity = (productId, amount) => {
    const product = products.find((p) => p.id === productId);
    setCart((previous) => previous.map((item) => {
      if (item.id !== productId) return item;
      const next = item.cartQuantity + amount;
      return { ...item, cartQuantity: Math.max(1, Math.min(product?.quantity ?? item.cartQuantity, next)) };
    }));
  };
  const removeFromCart = (productId) => setCart((previous) => previous.filter((item) => item.id !== productId));

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="app" id="home">
      <header className="navbar">
        <a className="logo" href="#home" onClick={() => setSelectedProduct(null)}>EsmiringShop<span>.</span></a>
        <nav aria-label="Main navigation">
          <a href="#home" onClick={() => setSelectedProduct(null)}>Home</a>
          <a href="#products" onClick={() => setSelectedProduct(null)}>Products</a>
          <a href="#about">About</a>
        </nav>
        <button className="cart-button" onClick={() => { setSelectedProduct(null); scrollTo('cart'); }}>Bag <span className="cart-count">{cartCount}</span></button>
      </header>

      {notice && <div className="notice" role="status"><span>{notice}</span><button aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}

      {selectedProduct ? (
        <main className="detail-page">
          <button className="back-button" onClick={() => setSelectedProduct(null)}>← Back to products</button>
          <div className="detail-layout">
            <div className="detail-image-wrap"><img src={selectedProduct.image} alt={selectedProduct.name} onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x700/f1f5f9/64748b?text=Product'; }} /></div>
            <div className="detail-copy">
              <p className="eyebrow">{selectedProduct.category}</p>
              <h1>{selectedProduct.name}</h1>
              <p className="detail-rating">★ {Number(selectedProduct.rating).toFixed(1)} <span> / 5.0</span></p>
              <p className="detail-price">{money(selectedProduct.price)}</p>
              <p className="detail-description">{selectedProduct.description}</p>
              <div className="spec-box"><h3>Product specifications</h3><p>{selectedProduct.specifications}</p><p><strong>Available quantity:</strong> {selectedProduct.quantity}</p><p><strong>Inventory subtotal:</strong> {money(selectedProduct.price * selectedProduct.quantity)}</p></div>
              {selectedProduct.quantity < 5 && <p className="low-stock-inline">{selectedProduct.quantity === 0 ? 'Out of stock' : 'Low stock — only a few left'}</p>}
              <button className="primary-button wide-button" disabled={selectedProduct.quantity === 0} onClick={() => addToCart(selectedProduct)}>Add to Cart</button>
            </div>
          </div>
        </main>
      ) : (
        <main>
          <section className="hero">
            <div className="hero-content">
              <p className="eyebrow hero-eyebrow">A LITTLE SOMETHING FOR YOU</p>
              <h1>Find the things<br />you’ll <em>love.</em></h1>
              <p>Thoughtful everyday essentials, selected just for your style.</p>
              <a className="shop-button" href="#products">Explore collection <span>↗</span></a>
              <div className="hero-note"><span className="hero-note-dot" /> A curated collection for everyday living</div>
            </div>
            <div className="hero-visual" aria-label="Shop collection">
              <div className="hero-image-main"><img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000" alt="Red and white sneakers" /></div>
              <div className="hero-image-small"><img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500" alt="Everyday backpack" /></div>
              <div className="hero-sticker">MADE FOR<br /><strong>EVERYDAY</strong><span>✳</span></div>
            </div>
          </section>

          <section className="products-section" id="products">
            <div className="section-heading">
              <div><p className="eyebrow">THE ESMIRING EDIT</p><h2>Find your next favorite.</h2><p className="section-subtitle">Simple pieces. Good quality. Everyday joy.</p></div>
              <button className="outline-button" onClick={() => { setShowAddForm((v) => !v); setSelectedCategory('All'); }}>{showAddForm ? 'Close form −' : '+ Add a product'}</button>
            </div>
            <div className="inventory-summary">
              <div><span className="summary-label">PRODUCTS IN COLLECTION</span><strong>{products.length.toString().padStart(2, '0')}</strong></div>
              <div><span className="summary-label">TOTAL INVENTORY VALUE</span><strong>{money(inventoryValue)}</strong></div>
              <div><span className="summary-label">ITEMS IN YOUR BAG</span><strong>{cartCount.toString().padStart(2, '0')}</strong></div>
            </div>

            {showAddForm && <form className="add-product-form" onSubmit={handleAddProduct}>
              <div className="form-heading"><div><p className="eyebrow">PRODUCT MANAGEMENT</p><h3>Add a new product</h3></div><span>All fields are required</span></div>
              <label>Product name<input name="name" value={newProduct.name} onChange={handleInputChange} placeholder="e.g. Canvas Tote Bag" required maxLength={100} /></label>
              <label>Category<select name="category" value={newProduct.category} onChange={handleInputChange} required><option>Apparel</option><option>Accessories</option><option>Footwear</option><option>Home</option><option>Beauty</option><option>Electronics</option></select></label>
              <label>Price (₱)<input name="price" type="number" min="0.01" step="0.01" value={newProduct.price} onChange={handleInputChange} placeholder="0.00" required /></label>
              <label>Quantity<input name="quantity" type="number" min="0" step="1" value={newProduct.quantity} onChange={handleInputChange} placeholder="0" required /></label>
              <label className="form-full">Feature image URL<input name="image" type="url" value={newProduct.image} onChange={handleInputChange} placeholder="https://example.com/product.jpg" required /></label>
              <label className="form-full">Description<textarea name="description" value={newProduct.description} onChange={handleInputChange} placeholder="Describe the product..." required rows="3" /></label>
              <label className="form-full">Product specifications<textarea name="specifications" value={newProduct.specifications} onChange={handleInputChange} placeholder="Materials, size, features..." required rows="2" /></label>
              <label>Rating (1–5)<input name="rating" type="number" min="1" max="5" step="0.1" value={newProduct.rating} onChange={handleInputChange} required /></label>
              <div className="form-actions"><button type="button" className="text-button" onClick={() => { setShowAddForm(false); setNewProduct(blankProduct); }}>Cancel</button><button type="submit" className="primary-button">Save product <span>→</span></button></div>
            </form>}

            <div className="catalog-toolbar">
              <div className="category-filters" aria-label="Filter by category">{categories.map((category) => <button key={category} className={selectedCategory === category ? 'filter-button active' : 'filter-button'} onClick={() => setSelectedCategory(category)}>{category}</button>)}</div>
              <div className="catalog-tools"><label className="search-box"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" aria-label="Search products" /></label><select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A–Z</option></select></div>
            </div>

            <div className="product-grid">
              {filteredProducts.map((product, index) => <article className="product-card" key={product.id}>
                <button className="product-image-container" onClick={() => setSelectedProduct(product)} aria-label={`View details for ${product.name}`}>
                  <img src={product.image} alt={product.name} className="product-image" onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x500/f1f5f9/64748b?text=Product'; }} />
                  <span className="image-index">{String(index + 1).padStart(2, '0')}</span>
                  {product.quantity < 5 && <span className="stock-warning">{product.quantity === 0 ? 'Out of stock' : 'Low stock'}</span>}
                </button>
                <div className="product-info"><div className="product-meta"><span className="product-category">{product.category}</span><span className="product-rating">★ {Number(product.rating).toFixed(1)}</span></div>
                  <button className="product-title-button" onClick={() => setSelectedProduct(product)}><h3>{product.name}</h3></button>
                  <p className="product-description">{product.description}</p>
                  <div className="product-bottom"><div><p className="product-price">{money(product.price)}</p><p className="stock-label">{product.quantity} in stock</p></div><button className="add-cart-icon" disabled={product.quantity === 0} onClick={() => addToCart(product)} aria-label={`Add ${product.name} to cart`}>+</button></div>
                  <div className="product-details"><span>Stock subtotal</span><strong>{money(product.price * product.quantity)}</strong></div>
                  <button className="details-link" onClick={() => setSelectedProduct(product)}>View product details <span>↗</span></button>
                </div>
              </article>)}
            </div>
            {filteredProducts.length === 0 && <div className="empty-state"><span>⌕</span><h3>No products found</h3><p>Try another search or category.</p><button className="text-button" onClick={() => { setSearch(''); setSelectedCategory('All'); }}>Clear filters</button></div>}
            <p className="results-note">Showing {filteredProducts.length} of {products.length} products</p>
          </section>

          <section className="cart-section" id="cart">
            <div className="section-heading cart-heading"><div><p className="eyebrow">READY WHEN YOU ARE</p><h2>Your shopping bag.</h2><p className="section-subtitle">Review your items before you go.</p></div><span className="bag-count">{cartCount} {cartCount === 1 ? 'item' : 'items'}</span></div>
            {cart.length === 0 ? <div className="empty-cart"><div className="empty-bag">♡</div><h3>Your bag is taking a little break.</h3><p>Find something you love and add it here.</p><a href="#products" className="primary-button">Browse products <span>→</span></a></div> : <div className="cart-layout">
              <div className="cart-items">{cart.map((item) => <article className="cart-item" key={item.id}><img src={item.image} alt={item.name} onError={(e) => { e.currentTarget.src = 'https://placehold.co/160x160/f1f5f9/64748b?text=Product'; }} /><div className="cart-item-info"><span className="product-category">{item.category}</span><h3>{item.name}</h3><p>{money(item.price)} each</p><button className="remove-cart-button" onClick={() => removeFromCart(item.id)}>Remove</button></div><div className="cart-item-end"><div className="cart-quantity"><button onClick={() => changeCartQuantity(item.id, -1)} disabled={item.cartQuantity <= 1} aria-label={`Decrease ${item.name} quantity`}>−</button><span>{item.cartQuantity}</span><button onClick={() => changeCartQuantity(item.id, 1)} disabled={item.cartQuantity >= (products.find((p) => p.id === item.id)?.quantity ?? item.cartQuantity)} aria-label={`Increase ${item.name} quantity`}>+</button></div><strong>{money(item.price * item.cartQuantity)}</strong></div></article>)}</div>
              <aside className="cart-summary"><p className="eyebrow">ORDER SUMMARY</p><div><span>Items ({cartCount})</span><strong>{money(cartTotal)}</strong></div><div><span>Delivery</span><strong>Calculated later</strong></div><div className="cart-grand-total"><span>Subtotal</span><strong>{money(cartTotal)}</strong></div><p className="checkout-note">This is a school project demo. No payment will be processed.</p><button className="primary-button wide-button" onClick={() => setNotice('Thank you for your order!')}>Continue to checkout <span>→</span></button></aside>
            </div>}
          </section>
        </main>
      )}

      <footer className="footer" id="about"><div className="footer-main"><a className="logo footer-logo" href="#home">EsmiringShop<span>.</span></a><p>Everyday finds, chosen with care.</p><a href="#products">Explore the collection ↗</a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} EsmiringShop. Student project.</span><span>Made for everyday living ✳</span></div></footer>
    </div>
  );
}

export default App;
