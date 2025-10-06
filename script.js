// Basic shop functionality for static HTML site
const PRODUCTS = [
  { id: 1, title: "Compression T-Shirt - Black", price: 29.99, category: "T-Shirts", img: "https://images.unsplash.com/photo-1520975698518-6d8f3b8b5b6b?auto=format&fit=crop&w=900&q=60", sizes: ["S","M","L","XL"], desc: "High-performance compression t-shirt for support and breathability." },
  { id: 2, title: "Pump Cover Hoodie - Grey", price: 49.99, category: "Hoodies", img: "https://images.unsplash.com/photo-1602810311963-13f2d6b9f7f0?auto=format&fit=crop&w=900&q=60", sizes: ["M","L","XL"], desc: "Lightweight warmup hoodie with a clean fit." },
  { id: 3, title: "Training Shorts - Navy", price: 24.99, category: "Shorts", img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=60", sizes: ["S","M","L"], desc: "Quick-dry training shorts with hidden pocket." },
  { id: 4, title: "Compression Leggings - Black", price: 39.99, category: "Leggings", img: "https://images.unsplash.com/photo-1520975698518-6d8f3b8b5b6b?auto=format&fit=crop&w=900&q=60", sizes: ["S","M","L","XL"], desc: "Ergonomic seams and high support." },
  { id: 5, title: "Performance Tank - White", price: 19.99, category: "Tanks", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=60", sizes: ["S","M","L"], desc: "Breathable training tank for intense sessions." }
];

// State
let state = {
  products: PRODUCTS.slice(),
  category: "All",
  query: "",
  sort: "default",
  cart: JSON.parse(localStorage.getItem("cart_v1") || "[]")
};

// DOM refs
const productsGrid = document.getElementById("productsGrid");
const categoryButtons = document.getElementById("categoryButtons");
const resultsInfo = document.getElementById("resultsInfo");
const searchInput = document.getElementById("searchInput");
const cartBtn = document.getElementById("cartBtn");
const cartCount = document.getElementById("cartCount");
const cartDrawer = document.getElementById("cartDrawer");
const cartClose = document.getElementById("cartClose");
const cartItems = document.getElementById("cartItems");
const cartSubtotal = document.getElementById("cartSubtotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const productModal = document.getElementById("productModal");
const modalClose = document.getElementById("modalClose");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalCategory = document.getElementById("modalCategory");
const modalPrice = document.getElementById("modalPrice");
const modalSizes = document.getElementById("modalSizes");
const modalAdd = document.getElementById("modalAdd");
const sortSelect = document.getElementById("sortSelect");
const ctaShop = document.getElementById("ctaShop");

document.getElementById("year").textContent = new Date().getFullYear();

// Helpers
function saveCart() {
  localStorage.setItem("cart_v1", JSON.stringify(state.cart));
}
function updateCartCount() {
  const count = state.cart.reduce((s, it) => s + it.qty, 0);
  cartCount.textContent = count;
}
function formatPrice(n) { return `$${n.toFixed(2)}`; }

// Render categories
function renderCategories() {
  const cats = ["All", ...new Set(state.products.map(p => p.category))];
  categoryButtons.innerHTML = "";
  cats.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.className = cat === state.category ? "active" : "";
    btn.onclick = () => { state.category = cat; renderProducts(); renderCategories(); };
    categoryButtons.appendChild(btn);
  });
}

// Render products grid
function getFilteredProducts() {
  let list = state.products.filter(p => {
    const inCat = state.category === "All" || p.category === state.category;
    const inQuery = p.title.toLowerCase().includes(state.query.toLowerCase()) || p.desc?.toLowerCase().includes(state.query.toLowerCase());
    return inCat && inQuery;
  });

  if (state.sort === "price-asc") list.sort((a,b)=> a.price - b.price);
  if (state.sort === "price-desc") list.sort((a,b)=> b.price - a.price);

  return list;
}
function renderProducts() {
  const list = getFilteredProducts();
  productsGrid.innerHTML = "";
  resultsInfo.textContent = `${list.length} products`;

  list.forEach(p => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="img-wrap"><img src="${p.img}" alt="${escapeHtml(p.title)}" loading="lazy" /></div>
      <div class="title">${escapeHtml(p.title)}</div>
      <div class="desc">${escapeHtml(p.desc)}</div>
      <div class="row">
        <div class="price">${formatPrice(p.price)}</div>
        <div class="actions">
          <button class="btn btn-primary add-btn">Add</button>
          <button class="btn quick-btn">Quick view</button>
        </div>
      </div>
    `;
    // handlers
    card.querySelector(".add-btn").onclick = () => { addToCart(p.id, null); };
    card.querySelector(".quick-btn").onclick = () => { openProductModal(p.id); };
    productsGrid.appendChild(card);
  });
}

// Cart functions
function addToCart(productId, size = null) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  const existing = state.cart.find(it => it.id === productId && it.size === size);
  if (existing) existing.qty++;
  else state.cart.push({ id: productId, title: product.title, price: product.price, size, qty: 1 });
  saveCart();
  updateCartCount();
  renderCart();
  openCart();
}
function changeQty(index, delta) {
  state.cart[index].qty = Math.max(1, state.cart[index].qty + delta);
  saveCart();
  updateCartCount();
  renderCart();
}
function removeItem(index) {
  state.cart.splice(index, 1);
  saveCart();
  updateCartCount();
  renderCart();
}
function renderCart() {
  cartItems.innerHTML = "";
  if (state.cart.length === 0) {
    cartItems.innerHTML = '<div class="empty">Your cart is empty</div>';
  } else {
    state.cart.forEach((it, idx) => {
      const p = state.products.find(pr => pr.id === it.id) || {};
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <div style="flex:1">
          <div class="title">${escapeHtml(it.title)}</div>
          <div class="meta">${it.size ? 'Size: '+escapeHtml(it.size) : ''}</div>
          <div class="meta">${formatPrice(it.price)} x ${it.qty}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          <div>
            <button class="qty-btn">-</button>
            <span style="padding:0 8px">${it.qty}</span>
            <button class="qty-btn">+</button>
          </div>
          <button class="rm-btn">Remove</button>
        </div>
      `;
      div.querySelectorAll(".qty-btn")[0].onclick = () => changeQty(idx, -1);
      div.querySelectorAll(".qty-btn")[1].onclick = () => changeQty(idx, 1);
      div.querySelector(".rm-btn").onclick = () => removeItem(idx);
      cartItems.appendChild(div);
    });
  }
  const subtotal = state.cart.reduce((s,it)=> s + it.price * it.qty, 0);
  cartSubtotal.textContent = formatPrice(subtotal);
}

// Cart drawer open/close
function openCart() { cartDrawer.classList.remove("hidden"); cartDrawer.setAttribute("aria-hidden","false"); }
function closeCart() { cartDrawer.classList.add("hidden"); cartDrawer.setAttribute("aria-hidden","true"); }

// Product modal
let activeProduct = null;
function openProductModal(id) {
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  activeProduct = p;
  modalImage.src = p.img;
  modalTitle.textContent = p.title;
  modalDesc.textContent = p.desc || "";
  modalCategory.textContent = p.category;
  modalPrice.textContent = formatPrice(p.price);
  // sizes
  modalSizes.innerHTML = "";
  (p.sizes || []).forEach(sz=>{
    const btn = document.createElement("button");
    btn.textContent = sz;
    btn.onclick = () => {
      // mark selection
      modalSizes.querySelectorAll("button").forEach(b=>b.classList.remove("selected"));
      btn.classList.add("selected");
    };
    modalSizes.appendChild(btn);
  });
  productModal.classList.remove("hidden");
  productModal.setAttribute("aria-hidden","false");
}
function closeProductModal() {
  productModal.classList.add("hidden");
  productModal.setAttribute("aria-hidden","true");
  activeProduct = null;
}
modalAdd.onclick = () => {
  if(!activeProduct) return;
  // find selected size if exists
  const sel = modalSizes.querySelector(".selected");
  const size = sel ? sel.textContent : null;
  addToCart(activeProduct.id, size);
  closeProductModal();
};

// Events
cartBtn.onclick = () => openCart();
cartClose.onclick = () => closeCart();
modalClose.onclick = () => closeProductModal();
document.getElementById("cartClose").onclick = () => closeCart();

// Search
searchInput.addEventListener("input", (e)=>{ state.query = e.target.value; renderProducts(); });

// Sort
sortSelect.addEventListener("change", (e)=>{ state.sort = e.target.value; renderProducts(); });

// CTA Shop scroll
ctaShop.addEventListener("click", (e)=>{ e.preventDefault(); document.getElementById("products").scrollIntoView({behavior:"smooth", block:"start"}); });

checkoutBtn.onclick = () => {
  if (state.cart.length === 0) { alert("Your cart is empty."); return; }
  // mock checkout
  alert("Mock checkout — this demo does not process payments. Subtotal: " + cartSubtotal.textContent);
  // clear cart:
  state.cart = [];
  saveCart();
  updateCartCount();
  renderCart();
  closeCart();
};

// utilities
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])) }

// initialize
function init(){
  renderCategories();
  renderProducts();
  renderCart();
  updateCartCount();
}
init();