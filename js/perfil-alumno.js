// perfil-alumno.js
// Muestra los datos personales y materias del alumno

import { getUsuarioByDni, getAllMaterias } from './db.js';

(async () => {
  const session = JSON.parse(sessionStorage.getItem('sessionUser') || 'null');
  if (!session || session.rol !== 'alumno') {
    window.location.href = 'index.html';
    return;
  }

  // Mostrar datos personales
  const datosDiv = document.getElementById('datosAlumno');
  datosDiv.innerHTML = `<p><strong>${session.nombre}</strong></p>
    <p>DNI: ${session.dni}</p>
    <p>Curso: ${session.curso || '---'}</p>
    <p>Turno: ${session.turno || '---'}</p>`;

  // Obtener materias y calcular cursadas/pendientes
  const materias = await getAllMaterias();
  const usuario = await getUsuarioByDni(session.dni);
  const inscritas = usuario.materiasInscritas || [];

  // Materias cursadas
  const cursadas = materias.filter(m => inscritas.includes(m.id));
  const cursadasDiv = document.getElementById('materiasCursadas');
  cursadasDiv.innerHTML = cursadas.length
    ? cursadas.map(m => `<div class="small-card"><strong>${m.nombre}</strong> — ${m.horario || ''} <span class="muted small">Profesor: ${m.profesorDni || '---'}</span></div>`).join('')
    : '<p class="muted">No estás inscripto a materias.</p>';

  // Materias pendientes
  const pendientes = materias.filter(m => !inscritas.includes(m.id));
  const pendientesDiv = document.getElementById('materiasPendientes');
  pendientesDiv.innerHTML = pendientes.length
    ? pendientes.map(m => `<div class="small-card"><strong>${m.nombre}</strong> — ${m.horario || ''} <span class="muted small">Profesor: ${m.profesorDni || '---'}</span></div>`).join('')
    : '<p class="muted">No tenés materias pendientes.</p>';
})();
