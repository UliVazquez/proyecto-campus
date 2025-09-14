import { getUsuarioByDni } from './db.js';
// auth.js - handles login form behavior

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const dni = document.getElementById('dni').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorEl = document.getElementById('error');
  errorEl.textContent = '';
  if (!dni || !password) { errorEl.textContent = 'Completá DNI y contraseña'; return; }
  errorEl.textContent = 'Cargando...';
  try {
    // Esperar a que db.js y firebase-config.js estén listos
    if (window.USE_FIREBASE && !window.db) {
      errorEl.textContent = 'Firebase no está inicializado. Revisá tu configuración.';
      return;
    }
    const user = await getUsuarioByDni(dni);
    if (!user) { errorEl.textContent = 'Usuario no encontrado'; return; }
    if (!user.password) {
      errorEl.textContent = 'Usuario sin contraseña asignada';
      return;
    }
    if (user.password !== password) { errorEl.textContent = 'Contraseña incorrecta'; return; }
    sessionStorage.setItem('sessionUser', JSON.stringify(user));
    if (user.rol === 'admin') window.location.href = 'admin.html';
    else if (user.rol === 'profesor') window.location.href = 'profesor.html';
    else window.location.href = 'alumno.html';
  } catch(err){
    console.error(err);
    errorEl.textContent = 'Error en el inicio de sesión';
  }
});

// seed button (for demo)
document.getElementById('seedBtn').addEventListener('click', async () => {
  if (!confirm('Crear datos de ejemplo (seed)? Esto añadirá usuarios y materias de demo en la base de datos)')) return;
  await seedDemoData();
});
