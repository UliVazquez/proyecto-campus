// inscripciones.js
// Permite inscribirse a materias y exámenes

import { getAllMaterias, getAllExamenes, enrollAlumnoToMateria, enrollAlumnoToExamen, getUsuarioByDni } from './db.js';

(async () => {
  const session = JSON.parse(sessionStorage.getItem('sessionUser') || 'null');
  if (!session || session.rol !== 'alumno') {
    window.location.href = 'index.html';
    return;
  }

  const materiasDiv = document.getElementById('materiasDisponibles');
  const examenesDiv = document.getElementById('examenesDisponibles');

  // Materias disponibles para inscripción
  let materias = await getAllMaterias();
  const usuario = await getUsuarioByDni(session.dni);
  const inscritas = usuario.materiasInscritas || [];
  const materiasDisponibles = materias.filter(m => !inscritas.includes(m.id));

  materiasDiv.innerHTML = materiasDisponibles.length
    ? materiasDisponibles.map(m => `<div class="small-card"><strong>${m.nombre}</strong> — ${m.horario || ''} <span class="muted small">Profesor: ${m.profesorDni || '---'}</span>
        <div class="action-row"><button class="btn" onclick="window.inscribirMateria('${m.id}')">Inscribirse</button></div></div>`).join('')
    : '<p class="muted">No hay materias disponibles para inscripción.</p>';

  window.inscribirMateria = async (id) => {
    try {
      await enrollAlumnoToMateria(session.dni, id);
      alert('Inscripción a materia exitosa');
      window.location.reload();
    } catch (e) {
      alert('Error al inscribirse: ' + e.message);
    }
  };

  // Exámenes disponibles para inscripción
  let examenes = await getAllExamenes();
  // Solo mostrar exámenes de materias a las que está inscripto y a los que no está inscripto aún
  const examenesDisponibles = examenes.filter(e =>
    inscritas.includes(e.materiaId) && !(e.alumnosInscriptos||[]).includes(session.dni)
  );

  examenesDiv.innerHTML = examenesDisponibles.length
    ? examenesDisponibles.map(e => `<div class="small-card"><strong>Materia: ${e.materiaId}</strong> — Fecha: ${e.fecha} — Turno: ${e.turno}
        <div class="action-row"><button class="btn" onclick="window.inscribirExamen('${e.id}')">Inscribirse</button></div></div>`).join('')
    : '<p class="muted">No hay exámenes disponibles para inscripción.</p>';

  window.inscribirExamen = async (id) => {
    try {
      await enrollAlumnoToExamen(session.dni, id);
      alert('Inscripción a examen exitosa');
      window.location.reload();
    } catch (e) {
      alert('Error al inscribirse: ' + e.message);
    }
  };
})();
