if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([{ username: 'admin', password: '123', role: 'admin' }]));
}
if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify([
        { id: 1, name: "Эспрессо", price: 150, desc: "Классический крепкий кофе", image: "https://placehold.co/400x300/eee/333?text=Espresso" },
        { id: 2, name: "Капучино", price: 220, desc: "С нежной молочной пенкой", image: "https://placehold.co/400x300/eee/333?text=Cappuccino" },
        { id: 3, name: "Латте", price: 250, desc: "Мягкий вкус с молоком", image: "https://placehold.co/400x300/eee/333?text=Latte" }
    ]));
}
if (!localStorage.getItem('orders')) localStorage.setItem('orders', JSON.stringify([]));

if (!localStorage.getItem('blog')) {
    localStorage.setItem('blog', JSON.stringify([
        { id: 1, title: "Секреты идеального эспрессо", img: "https://placehold.co/600x400/2c3e50/ffffff?text=Coffee+Beans", desc: "Рассказываем, как добиться идеальной пенки." },
        { id: 2, title: "Латте-арт для начинающих", img: "https://placehold.co/600x400/2c3e50/ffffff?text=Latte+Art", desc: "Простые узоры, которые можно нарисовать прямо в чашке." }
    ]));
}

let products = JSON.parse(localStorage.getItem('products'));
let cart = [];
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

function updateUserUI() {
    const greeting = document.getElementById('user-greeting');
    const authBtn = document.getElementById('auth-nav-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const adminLink = document.getElementById('admin-nav-link');

    if (currentUser) {
        greeting.innerHTML = `<i class="fa-regular fa-user"></i> ${currentUser.username}`;
        authBtn.style.display = 'none';
        logoutBtn.style.display = 'flex';
        adminLink.style.display = currentUser.role === 'admin' ? 'block' : 'none';
    } else {
        greeting.innerHTML = '';
        authBtn.style.display = 'flex';
        logoutBtn.style.display = 'none';
        adminLink.style.display = 'none';
    }
}

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    currentUser = null;
    updateUserUI();
    window.location.reload();
});

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('sec-' + id).classList.add('active');
    
    if (id === 'catalog') renderCatalog();
    if (id === 'cart') renderCart();
    if (id === 'blog') renderBlog();
}

document.getElementById('nav-logo').addEventListener('click', (e) => { e.preventDefault(); showSection('catalog'); });
document.getElementById('nav-catalog').addEventListener('click', (e) => { e.preventDefault(); showSection('catalog'); });
document.getElementById('nav-blog').addEventListener('click', (e) => { e.preventDefault(); showSection('blog'); });
document.getElementById('cart-btn').addEventListener('click', () => showSection('cart'));

function renderCatalog() {
    const container = document.getElementById('products-container');
    container.innerHTML = '';
    products = JSON.parse(localStorage.getItem('products')); 
    products.forEach(p => {
        container.innerHTML += `
            <div class="product-card">
                <img src="${p.image}" alt="${p.name}" class="product-img">
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p>${p.desc}</p>
                    <div class="price-row">
                        <span class="price">${p.price} ₽</span>
                        <button class="btn-main" onclick="addToCart(${p.id})"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);

    if (existing) {
        if (existing.quantity >= 50) {
            alert("Вы не можете добавить более 50 экземпляров одного товара!");
            return;
        }
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartCount();
}


function updateCartCount() {
    document.getElementById('cart-count').innerText = cart.reduce((sum, i) => sum + i.quantity, 0);
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('total-price');
    container.innerHTML = '';
    let total = 0;
    if (cart.length === 0) container.innerHTML = '<p style="text-align:center; color:#777;">Корзина пуста</p>';
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        container.innerHTML += `<div class="cart-item"><span>${item.name} (x${item.quantity})</span><span>${itemTotal} ₽</span></div>`;
    });
    totalEl.innerText = total;
}

function renderBlog() {
    const container = document.getElementById('blog-container');
    container.innerHTML = '';
    let posts = JSON.parse(localStorage.getItem('blog'));
    
    if (posts.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#777; grid-column: 1/-1;">Пока нет статей</p>';
        return;
    }

    posts.forEach(post => {
        container.innerHTML += `
            <article class="blog-card">
                <div class="blog-img" style="background-image: url('${post.img}');"></div>
                <div class="blog-content">
                    <h3>${post.title}</h3>
                    <p>${post.desc}</p>
                </div>
            </article>
        `;
    });
}

document.getElementById('checkout-btn').addEventListener('click', () => {
    if (cart.length === 0) return alert("Корзина пуста!");
    if (!currentUser) {
        alert("Войдите, чтобы оформить заказ!");
        window.location.href = 'auth.html';
        return;
    }
    const address = prompt("Введите адрес доставки:");
    if (!address) return;

    const orderId = Math.floor(100000 + Math.random() * 900000);
    const itemsStr = cart.map(i => `${i.name} (x${i.quantity})`).join(', ');
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);

    let orders = JSON.parse(localStorage.getItem('orders'));
    orders.push({ id: orderId, customer: currentUser.username, address, items: itemsStr, total, date: new Date().toLocaleString() });
    localStorage.setItem('orders', JSON.stringify(orders));

    document.getElementById('receipt-text').innerText = 
        `=== ЧЕК №${orderId} ===\nКлиент: ${currentUser.username}\nАдрес: ${address}\n\n` + 
        cart.map(i => `${i.name} x${i.quantity} = ${i.price * i.quantity} ₽`).join('\n') + 
        `\n\nИтого: ${total} ₽\nСпасибо за покупку!`;
    
    document.getElementById('receipt-modal').classList.add('active');
    document.querySelector('.close').onclick = () => document.getElementById('receipt-modal').classList.remove('active');
    
    cart = []; updateCartCount(); renderCart();
});

updateUserUI();
renderCatalog();
updateCartCount();