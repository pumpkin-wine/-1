if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([{ username: 'admin', password: '123', role: 'admin' }]));
}

let isLoginMode = true;
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-auth-btn');
const toggleLink = document.getElementById('toggle-link');
const toggleText = document.getElementById('toggle-text');

toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    formTitle.innerText = isLoginMode ? "Вход" : "Регистрация";
    submitBtn.innerText = isLoginMode ? "Войти" : "Создать аккаунт";
    toggleText.innerText = isLoginMode ? "Нет аккаунта?" : "Уже есть аккаунт?";
    toggleLink.innerText = isLoginMode ? "Зарегистрироваться" : "Войти";
});

document.getElementById('auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    let users = JSON.parse(localStorage.getItem('users'));

    if (isLoginMode) {
        const user = users.find(x => x.username === u && x.password === p);
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = user.role === 'admin' ? 'admin.html' : 'index.html';
        } else {
            alert("Неверный логин или пароль!");
        }
    } else {
        if (users.find(x => x.username === u)) return alert("Логин занят!");
        users.push({ username: u, password: p, role: 'user' });
        localStorage.setItem('users', JSON.stringify(users));
        alert("Регистрация успешна! Теперь войдите.");
        isLoginMode = true; 
        toggleLink.click();
    }
});