function getToken() {
    return localStorage.getItem('token');
}

function isLoggedIn() {
    return getToken() !== null;
}

function getUserInfo() {
    const usuarioTexto = localStorage.getItem('usuario');
    return usuarioTexto ? JSON.parse(usuarioTexto) : null;
}

function isAdmin() {
    const user = getUserInfo();
    return user && user.rol === 'ADMIN';
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login';
}

function redirectIfNotLoggedIn() {
    if (!isLoggedIn()) {
        window.location.href = '/login';
    }
}

// Control de rutas 
const esPantallaLogin = window.location.pathname === '/login';

if (isLoggedIn() && esPantallaLogin) {
    window.location.href = '/index'; // Si tiene sesión y va al login, vuelve al index
} else if (!isLoggedIn() && !esPantallaLogin) {
    window.location.href = '/login'; // Si no tiene sesión y va a otra pantalla, al login
}

// Muestra el nombre en pantalla
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname !== '/login') {
        const infoUsuario = getUserInfo();
        const contenedorNombre = document.getElementById('userNameDisplay');
        
        if (infoUsuario && contenedorNombre) {
            contenedorNombre.textContent = infoUsuario.nombre;
        }
    }
});
