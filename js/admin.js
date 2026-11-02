const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser || currentUser.role !== 'admin') {
    alert("У вас нет прав доступа!");
    window.location.href = 'index.html';
}
document.getElementById('user-greeting').innerText = `Админ: ${currentUser.username}`;
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'auth.html';
});

if (!localStorage.getItem('products')) localStorage.setItem('products', JSON.stringify([]));
if (!localStorage.getItem('orders')) localStorage.setItem('orders', JSON.stringify([]));
if (!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify([]));
if (!localStorage.getItem('blog')) localStorage.setItem('blog', JSON.stringify([]));

let products = JSON.parse(localStorage.getItem('products'));
let orders = JSON.parse(localStorage.getItem('orders'));
let users = JSON.parse(localStorage.getItem('users'));
let blogPosts = JSON.parse(localStorage.getItem('blog'));
let salesChartInstance = null;

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

function renderAdmin() {
    document.getElementById('stat-revenue').innerText = orders.reduce((s, o) => s + o.total, 0) + ' ₽';
    document.getElementById('stat-orders').innerText = orders.length;
    document.getElementById('stat-users').innerText = users.length;

    const pBody = document.getElementById('admin-products-body');
    pBody.innerHTML = products.length ? '' : '<tr><td colspan="5">Нет товаров</td></tr>';
    products.forEach(p => {

        pBody.innerHTML += `
            <tr>
                <td>#${p.id}</td>
                <td><img src="${p.image}" alt="${p.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" onerror="this.src='https://placehold.co/50x50?text=X'"></td>
                <td>${p.name}</td>
                <td>${p.price} ₽</td>
                <td>
                    <button class="btn-main" style="padding: 5px 10px; font-size: 0.8rem;" onclick="editProduct(${p.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-danger" onclick="deleteProduct(${p.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });

    const oBody = document.getElementById('admin-orders-body');
    oBody.innerHTML = orders.length ? '' : '<tr><td colspan="7">Нет заказов</td></tr>';
    [...orders].reverse().forEach(o => {
        oBody.innerHTML += `
            <tr>
                <td>#${o.id}</td><td>${o.date || 'Неизвестно'}</td><td>${o.customer}</td><td>${o.address}</td>
                <td>${o.items}</td><td><strong>${o.total} ₽</strong></td>
                <td><button class="btn-danger" onclick="deleteOrder(${o.id})"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `;
    });

    const bBody = document.getElementById('admin-blog-body');
    bBody.innerHTML = blogPosts.length ? '' : '<tr><td colspan="4">Нет статей</td></tr>';
    blogPosts.forEach(b => {
        bBody.innerHTML += `
            <tr>
                <td>#${b.id}</td><td>${b.title}</td><td>${b.desc.substring(0, 30)}...</td>
                <td><button class="btn-danger" onclick="deleteBlogPost(${b.id})"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `;
    });

    if (salesChartInstance) salesChartInstance.destroy();
    const salesByProduct = {};
    orders.forEach(order => {
        order.items.split(', ').forEach(itemStr => {
            const match = itemStr.match(/(.+) \(x(\d+)\)/);
            if (match) {
                const name = match[1];
                const qty = parseInt(match[2]);
                salesByProduct[name] = (salesByProduct[name] || 0) + qty;
            }
        });
    });

    const ctx = document.getElementById('salesChart').getContext('2d');
    salesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(salesByProduct).length ? Object.keys(salesByProduct) : ['Нет данных'],
            datasets: [{
                label: 'Продано (шт)',
                data: Object.values(salesByProduct).length ? Object.values(salesByProduct) : [0],
                backgroundColor: '#8c7355',
                borderRadius: 4
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

const productForm = document.getElementById('product-form');
const formTitle = document.getElementById('form-title');
const editIdInput = document.getElementById('edit-product-id');
const btnSave = document.getElementById('btn-save');
const btnCancel = document.getElementById('btn-cancel');

productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = editIdInput.value;
    
    const productData = {
        name: document.getElementById('new-name').value,
        price: +document.getElementById('new-price').value,
        desc: document.getElementById('new-desc').value,
        image: document.getElementById('new-image').value || 'https://placehold.co/400x300?text=No+Image'
    };

    if (id) {
        const index = products.findIndex(p => p.id == id);
        if (index !== -1) {
            products[index] = { ...products[index], ...productData };
        }
        alert("Товар обновлен!");
    } else {
        products.push({ id: Date.now(), ...productData });
        alert("Товар добавлен!");
    }

    localStorage.setItem('products', JSON.stringify(products));
    resetForm();
    renderAdmin();
});

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    editIdInput.value = product.id;
    document.getElementById('new-name').value = product.name;
    document.getElementById('new-price').value = product.price;
    document.getElementById('new-desc').value = product.desc;
    document.getElementById('new-image').value = product.image;

    formTitle.innerText = "Редактировать товар";
    btnSave.innerHTML = '<i class="fa-solid fa-check"></i> Сохранить';
    btnCancel.style.display = 'inline-block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    productForm.reset();
    editIdInput.value = '';
    formTitle.innerText = "Добавить товар";
    btnSave.innerHTML = '<i class="fa-solid fa-plus"></i> Добавить';
    btnCancel.style.display = 'none';
}

btnCancel.addEventListener('click', resetForm);

document.getElementById('add-blog-form').addEventListener('submit', (e) => {
    e.preventDefault();
    blogPosts.push({
        id: Date.now(), title: document.getElementById('new-blog-title').value,
        img: document.getElementById('new-blog-img').value || 'https://placehold.co/600x400?text=No+Image',
        desc: document.getElementById('new-blog-desc').value
    });
    localStorage.setItem('blog', JSON.stringify(blogPosts));
    document.getElementById('add-blog-form').reset();
    renderAdmin();
});

window.deleteProduct = function(id) {
    if(confirm("Удалить товар?")) {
        products = products.filter(x => x.id !== id);
        localStorage.setItem('products', JSON.stringify(products));
        renderAdmin();
    }
};
window.deleteOrder = function(id) {
    if(confirm("Удалить этот заказ?")) {
        orders = orders.filter(x => x.id !== id);
        localStorage.setItem('orders', JSON.stringify(orders));
        renderAdmin();
    }
};
window.deleteBlogPost = function(id) {
    if(confirm("Удалить статью?")) {
        blogPosts = blogPosts.filter(x => x.id !== id);
        localStorage.setItem('blog', JSON.stringify(blogPosts));
        renderAdmin();
    }
};

renderAdmin();