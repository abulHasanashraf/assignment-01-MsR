const BASE_URL = "https://fakestoreapi.com/products";
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ================= INIT =================
document.addEventListener("DOMContentLoaded", async () => {
  updateCartUI();

  // Home Trending
  if (document.getElementById("trending-container")) {
    loadTrendingProducts();
  }

  // Products Page
  if (document.getElementById("product-container")) {
    loadProductsPage();
  }
});

// ================= TRENDING (HOME) =================
async function loadTrendingProducts() {
  const res = await fetch(BASE_URL);
  const data = await res.json();

  const topRated = data
    .sort((a, b) => b.rating.rate - a.rating.rate)
    .slice(0, 6);

  const container = document.getElementById("trending-container");
  container.innerHTML = "";

  topRated.forEach(product =>
    container.appendChild(createProductCard(product))
  );
}

// ================= PRODUCTS PAGE =================
async function loadProductsPage() {
  const res = await fetch(BASE_URL);
  const products = await res.json();

  const container = document.getElementById("product-container");
  const catContainer = document.getElementById("category-container");

  const categories = [...new Set(products.map(p => p.category))];

  // All Button
  const allBtn = document.createElement("button");
  allBtn.className = "btn btn-sm btn-outline btn-primary";
  allBtn.innerText = "All";
  allBtn.onclick = () => {
    setActive(allBtn);
    renderProducts(products);
  };
  catContainer.appendChild(allBtn);

  // Category Buttons
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "btn btn-sm btn-outline capitalize";
    btn.innerText = cat;
    btn.onclick = () => {
      setActive(btn);
      const filtered = products.filter(p => p.category === cat);
      renderProducts(filtered);
    };
    catContainer.appendChild(btn);
  });

  renderProducts(products);

  function setActive(button) {
    document
      .querySelectorAll("#category-container button")
      .forEach(b => b.classList.remove("btn-primary"));
    button.classList.add("btn-primary");
  }

  function renderProducts(list) {
    container.innerHTML = "";
    list.forEach(p =>
      container.appendChild(createProductCard(p))
    );
  }
}

// ================= PRODUCT CARD =================
function createProductCard(product) {
  const div = document.createElement("div");
  div.className =
    "bg-white p-6 rounded-xl shadow hover:shadow-lg transition";

  div.innerHTML = `
    <img src="${product.image}" class="h-40 mx-auto object-contain mb-4"/>
    <p class="text-xs text-indigo-600 capitalize mb-1">${product.category}</p>
    <h3 class="font-semibold text-sm mb-2">${product.title.slice(0, 40)}...</h3>
    <p class="font-bold mb-3">$${product.price}</p>
    <div class="flex gap-2">
      <button onclick="showModal(${product.id})" class="btn btn-outline btn-sm w-1/2">Details</button>
      <button onclick="addToCart(${product.id})" class="btn btn-primary btn-sm w-1/2">Add</button>
    </div>
  `;

  return div;
}

// ================= MODAL =================
async function showModal(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  const product = await res.json();

  document.getElementById("modal-content").innerHTML = `
    <h3 class="font-bold text-xl mb-4">${product.title}</h3>
    <img src="${product.image}" class="h-60 mx-auto object-contain mb-4"/>
    <p class="mb-4">${product.description}</p>
    <p class="font-bold text-indigo-600 text-lg mb-3">$${product.price}</p>
    <button onclick="addToCart(${product.id})" class="btn btn-primary mt-2">Add to Cart</button>
  `;

  document.getElementById("productModal").showModal();
}

// ================= CART =================
async function addToCart(id) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    const res = await fetch(`${BASE_URL}/${id}`);
    const product = await res.json();
    product.quantity = 1;
    cart.push(product);
  }

  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
}

function clearCart() {
  cart = [];
  saveCart();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const count = document.getElementById("cart-count");
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");

  if (!count) return;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  count.innerText = totalItems;

  if (!container) return;

  container.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;

    container.innerHTML += `
      <div class="flex justify-between items-center text-sm">
        <div>
          <p>${item.title.slice(0, 25)}...</p>
          <p>${item.quantity} x $${item.price}</p>
        </div>
        <button onclick="removeFromCart(${item.id})" class="btn btn-xs btn-error">✕</button>
      </div>
    `;
  });

  if (totalEl) {
    totalEl.innerText = "Total: $" + total.toFixed(2);
  }
}
