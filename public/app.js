// public/app.js

const state = {
    products: [],
    currentProduct: null,
    cart: []
};

document.addEventListener('DOMContentLoaded', () => {
    setupNav();
    setupSearch();
    setupForms();
    loadProducts();
});

function setupNav() {
    // header links
    document.querySelectorAll('.ng-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            if (section) {
                showSection(section);
            }
        });
    });

    // any element with .back-link or .js-nav-link
    document.querySelectorAll('[data-section]').forEach(el => {
        if (!el.classList.contains('ng-nav')) {
            el.addEventListener('click', (e) => {
                if (el.tagName === 'A') e.preventDefault();
                const section = el.dataset.section;
                showSection(section);
            });
        }
    });
}

function showSection(id) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.toggle('page--active', page.id === id);
    });

    if (id === 'catalog') {
        window.scrollTo({ top: document.getElementById('catalog').offsetTop - 80, behavior: 'smooth' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

async function loadProducts() {
    try {
        const res = await fetch('/api/products');
        const data = await res.json();
        state.products = data;
        renderCatalog();
    } catch (err) {
        console.error('Error loading products', err);
    }
}

function renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    grid.innerHTML = '';

    state.products.forEach(product => {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-category">${product.category}</div>
            <h3>${product.name}</h3>
            <p class="product-short">${product.short}</p>
            <p class="product-price">$${product.price.toFixed(2)} <span class="unit">/ ${product.unit}</span></p>
            <button class="secondary-btn" data-product-id="${product.id}">
                View Details
            </button>
        `;
        grid.appendChild(card);
    });

    grid.querySelectorAll('[data-product-id]').forEach(btn => {
        btn.addEventListener('click', () => {
            openProductDetail(btn.dataset.productId);
        });
    });
}

async function openProductDetail(id) {
    try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) return;
        const product = await res.json();
        state.currentProduct = product;

        document.getElementById('detail-name').textContent = product.name;
        document.getElementById('detail-category').textContent = product.category;
        document.getElementById('detail-description').textContent = product.short;
        document.getElementById('detail-price').textContent =
            `$${product.price.toFixed(2)} / ${product.unit}`;

        const btn = document.getElementById('detail-add-to-cart');
        btn.onclick = () => addToCart(product);

        showSection('product-detail');
    } catch (err) {
        console.error('Error loading product detail', err);
    }
}

function addToCart(product) {
    state.cart.push(product);
    updateCartSummary();
    showSection('checkout');
}

function updateCartSummary() {
    const container = document.getElementById('cart-summary');
    if (!state.cart.length) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    let total = 0;
    const list = state.cart.map(p => {
        total += p.price;
        return `<li>${p.name} – $${p.price.toFixed(2)}</li>`;
    }).join('');

    container.innerHTML = `
        <h3>Cart</h3>
        <ul class="cart-list">${list}</ul>
        <p class="cart-total"><strong>Total:</strong> $${total.toFixed(2)}</p>
    `;
}

function setupSearch() {
    const form = document.getElementById('header-search-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const q = form.q.value.trim();
        if (!q) return;

        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            renderSearchResults(data);
            showSection('search-results');
        } catch (err) {
            console.error('Search error', err);
        }
    });
}

function renderSearchResults(data) {
    const summary = document.getElementById('search-summary');
    const grid = document.getElementById('search-grid');

    summary.textContent = data.count
        ? `Found ${data.count} result(s) for "${data.query}".`
        : `No results for "${data.query}". Try another term.`;

    grid.innerHTML = '';
    data.results.forEach(product => {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-category">${product.category}</div>
            <h3>${product.name}</h3>
            <p class="product-short">${product.short}</p>
            <p class="product-price">$${product.price.toFixed(2)} <span class="unit">/ ${product.unit}</span></p>
            <button class="secondary-btn" data-product-id="${product.id}">
                View Details
            </button>
        `;
        grid.appendChild(card);
    });

    grid.querySelectorAll('[data-product-id]').forEach(btn => {
        btn.addEventListener('click', () => openProductDetail(btn.dataset.productId));
    });
}

function setupForms() {
    // mock login/register/checkout (just prevent reload and log)
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const checkoutForm = document.getElementById('checkout-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Mock login successful (no real auth).');
            showSection('profile');
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Mock account created.');
            showSection('profile');
        });
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Mock order placed. Thank you for testing OrbitCart!');
            state.cart = [];
            updateCartSummary();
        });
    }
}

// ===============================
// Category Slider (OrbitCart)
// ===============================
(function () {
    const track = document.querySelector('.category-track');
    const slides = track ? Array.from(track.querySelectorAll('.category-slide')) : [];
    if (!track || !slides.length) {
        return; // no slider present
    }

    const dots = Array.from(document.querySelectorAll('.category-dot'));
    const prevBtn = document.querySelector('.category-arrow--prev');
    const nextBtn = document.querySelector('.category-arrow--next');

    let currentIndex = 0;

    function setActive(index) {
        const total = slides.length;
        currentIndex = (index + total) % total;

        // Move the whole track: 0%, -100%, -200%, etc.
        const offsetPercent = -currentIndex * 100;
        track.style.transform = `translateX(${offsetPercent}%)`;

        dots.forEach((dot, i) => {
            dot.classList.toggle('is-active', i === currentIndex);
        });
    }

    // Arrow handlers
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            setActive(currentIndex - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            setActive(currentIndex + 1);
        });
    }

    // Dot handlers
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            setActive(i);
        });
    });

    // Initial position
    setActive(0);
})();


// =====================================
// Simple page router for OrbitCart SPA
// =====================================

function showSection(sectionId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.toggle('page--active', page.id === sectionId);
    });

    const hero = document.querySelector('.ng-hero');
    const slider = document.querySelector('.category-slider');

    // What counts as "home" where hero + slider should be visible?
    const isHome = sectionId === 'catalog' || sectionId === 'search-results';

    if (hero) hero.classList.toggle('is-hidden', !isHome);
    if (slider) slider.classList.toggle('is-hidden', !isHome);

    // Always jump back to top when changing "pages"
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Attach to all nav links that have data-section
document.querySelectorAll('[data-section]').forEach(link => {
    link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const targetSection = link.dataset.section;
        if (targetSection) {
            showSection(targetSection);
        }
    });
});


// Example when building a card:
card.innerHTML = `
    <h3>${product.name}</h3>
    <p>${product.category}</p>
    <p class="price">$${product.price.toFixed(2)}</p>
    <button class="view-details-btn" data-id="${product.id}">View details</button>
`;
// Assuming you already have an array `products` holding your product data

function openProductDetail(product) {
    document.getElementById('detail-name').textContent = product.name;
    document.getElementById('detail-category').textContent = product.category;
    document.getElementById('detail-description').textContent = product.description;
    document.getElementById('detail-price').textContent = `$${product.price.toFixed(2)}`;

    // Switch to the product-detail "page"
    showSection('product-detail');
}

// Delegate clicks on the catalog grid
const catalogGrid = document.getElementById('catalog-grid');
if (catalogGrid) {
    catalogGrid.addEventListener('click', (evt) => {
        const btn = evt.target.closest('.view-details-btn');
        if (!btn) return;

        const id = btn.dataset.id;
        const product = products.find(p => String(p.id) === String(id));
        if (product) {
            openProductDetail(product);
        }
    });
}

// Back link in the product-detail section
const backBtn = document.querySelector('#product-detail .back-link');
if (backBtn) {
    backBtn.addEventListener('click', () => showSection('catalog'));
}
