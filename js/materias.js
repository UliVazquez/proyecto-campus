// materias.js
// Listado y buscador de materias inscriptas

import { getAllMaterias, getUsuarioByDni } from './db.js';

(async () => {
  const session = JSON.parse(sessionStorage.getItem('sessionUser') || 'null');
  if (!session || session.rol !== 'alumno') {
    window.location.href = 'index.html';
    return;
  }

  const buscador = document.getElementById('buscadorMaterias');
  const listado = document.getElementById('listadoMaterias');

  let materias = await getAllMaterias();
  const usuario = await getUsuarioByDni(session.dni);
  const inscritas = usuario.materiasInscritas || [];
  // Solo mostrar materias en las que el alumno está inscripto
  materias = materias.filter(m => inscritas.includes(m.id));

  // Obtener nombres de profesores para mostrar en vez de solo el DNI
  const profesoresDnis = [...new Set(materias.map(m => m.profesorDni).filter(Boolean))];
  const profesoresArr = await Promise.all(profesoresDnis.map(dni => getUsuarioByDni(dni)));
  const profesores = {};
  profesoresArr.forEach(p => { if (p && p.dni) profesores[p.dni] = p.nombre; });

  function renderMaterias(filtro = '') {
    const filtroLower = filtro.trim().toLowerCase();
    const filtradas = materias.filter(m => {
      const profNombre = profesores[m.profesorDni] || '';
      return (
        m.nombre?.toLowerCase().includes(filtroLower) ||
        (m.area && m.area.toLowerCase().includes(filtroLower)) ||
        (m.profesorDni && m.profesorDni.toLowerCase().includes(filtroLower)) ||
        profNombre.toLowerCase().includes(filtroLower)
      );
    });
    listado.innerHTML = filtradas.length
      ? filtradas.map(m =>
          `<div class="small-card">
            <a href="materia-detalle.html?id=${m.id}" class="link-materia">
              <strong>${m.nombre}</strong> — ${m.horario || ''} <span class="muted small">Profesor: ${profesores[m.profesorDni] || m.profesorDni || '---'}</span>
            </a>
          </div>`
        ).join('')
      : '<p class="muted">No se encontraron materias.</p>';
  }

  buscador.addEventListener('input', (e) => {
    renderMaterias(e.target.value);
  });

  renderMaterias();
})();
