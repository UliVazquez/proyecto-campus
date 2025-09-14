// materias.js
// Listado, buscador e inscripción a materias

import { getAllMaterias, enrollAlumnoToMateria, getUsuarioByDni } from './db.js';

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

  function renderMaterias(filtro = '') {
    const filtroLower = filtro.trim().toLowerCase();
    const filtradas = materias.filter(m => {
      return (
        m.nombre?.toLowerCase().includes(filtroLower) ||
        (m.area && m.area.toLowerCase().includes(filtroLower)) ||
        (m.profesorDni && m.profesorDni.toLowerCase().includes(filtroLower))
      );
    });
    listado.innerHTML = filtradas.length
      ? filtradas.map(m => {
          const yaInscripto = inscritas.includes(m.id);
          return `<div class="small-card">
            <strong>${m.nombre}</strong> — ${m.horario || ''} <span class="muted small">Profesor: ${m.profesorDni || '---'}</span>
            <div class="action-row">
              <button class="btn" ${yaInscripto ? 'disabled' : ''} onclick="window.inscribirseMateria('${m.id}')">${yaInscripto ? 'Inscripto' : 'Inscribirse'}</button>
            </div>
          </div>`;
        }).join('')
      : '<p class="muted">No se encontraron materias.</p>';
  }

  window.inscribirseMateria = async (id) => {
    try {
      await enrollAlumnoToMateria(session.dni, id);
      alert('Inscripción exitosa');
      // Recargar usuario y materias
      const usuarioActualizado = await getUsuarioByDni(session.dni);
      materias = await getAllMaterias();
      renderMaterias(buscador.value);
    } catch (e) {
      alert('Error al inscribirse: ' + e.message);
    }
  };

  buscador.addEventListener('input', (e) => {
    renderMaterias(e.target.value);
  });

  renderMaterias();
})();
