// materia-detalle.js
// Muestra información, notas y compañeros de una materia

import { getMateria, getNota, getAllExamenes, getUsuarioByDni } from './db.js';

(async () => {
  const session = JSON.parse(sessionStorage.getItem('sessionUser') || 'null');
  if (!session || session.rol !== 'alumno') {
    window.location.href = 'index.html';
    return;
  }

  // Obtener id de materia desde query string
  const params = new URLSearchParams(window.location.search);
  const materiaId = params.get('id');
  if (!materiaId) {
    document.getElementById('infoMateria').innerHTML = '<p class="error">Materia no especificada.</p>';
    return;
  }

  // Info materia
  const materia = await getMateria(materiaId);
  if (!materia) {
    document.getElementById('infoMateria').innerHTML = '<p class="error">Materia no encontrada.</p>';
    return;
  }
  document.getElementById('infoMateria').innerHTML = `
    <strong>${materia.nombre}</strong><br>
    Profesor: ${materia.profesorDni || '---'}<br>
    Horario: ${materia.horario || '-'}<br>
    Área: ${materia.area || '-'}<br>
    <span class="muted small">ID: ${materia.id}</span>
  `;

  // Notas
  const nota = await getNota(session.dni, materiaId);
  document.getElementById('notasMateria').innerHTML = nota
    ? `<div class="small-card">Parcial 1: ${nota.parcial1 ?? '-'} | Parcial 2: ${nota.parcial2 ?? '-'} | Final: ${nota.final ?? '-'}<br>Promedio: ${nota.promedio ?? '-'}</div>`
    : '<p class="muted">Sin notas registradas.</p>';

  // Exámenes de la materia
  const examenes = (await getAllExamenes()).filter(e => e.materiaId === materiaId);
  document.getElementById('examenesMateria').innerHTML = examenes.length
    ? examenes.map(e => `<div class="small-card">Fecha: ${e.fecha} | Turno: ${e.turno}</div>`).join('')
    : '<p class="muted">Sin exámenes programados.</p>';

  // Compañeros inscriptos
  const companierosDiv = document.getElementById('companierosMateria');
  if (materia.alumnosInscritos && materia.alumnosInscritos.length) {
    const companieros = await Promise.all(
      materia.alumnosInscritos.filter(dni => dni !== session.dni).map(dni => getUsuarioByDni(dni))
    );
    companierosDiv.innerHTML = companieros.length
      ? companieros.map(u => `<span class="small-card">${u.nombre} (${u.dni})</span>`).join(' ')
      : '<p class="muted">No hay otros inscriptos.</p>';
  } else {
    companierosDiv.innerHTML = '<p class="muted">No hay inscriptos.</p>';
  }
})();
