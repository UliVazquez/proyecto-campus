// calificaciones.js
// Muestra notas y promedios del alumno

import { getUsuarioByDni, getAllMaterias, getNota } from './db.js';

(async () => {
  const session = JSON.parse(sessionStorage.getItem('sessionUser') || 'null');
  if (!session || session.rol !== 'alumno') {
    window.location.href = 'index.html';
    return;
  }

  const notasDiv = document.getElementById('notasPorMateria');
  const promediosDiv = document.getElementById('promediosAlumno');

  const usuario = await getUsuarioByDni(session.dni);
  const materias = await getAllMaterias();
  const inscritas = usuario.materiasInscritas || [];
  const materiasCursadas = materias.filter(m => inscritas.includes(m.id));

  // Obtener todas las notas
  const notas = await Promise.all(materiasCursadas.map(m => getNota(session.dni, m.id)));

  // Mostrar notas por materia
  notasDiv.innerHTML = materiasCursadas.length
    ? materiasCursadas.map((m, idx) => {
        const n = notas[idx] || {};
        return `<div class="small-card"><strong>${m.nombre}</strong><br>
          Parcial 1: ${n.parcial1 ?? '-'} | Parcial 2: ${n.parcial2 ?? '-'} | Final: ${n.final ?? '-'}<br>
          Promedio: ${n.promedio ?? '-'}</div>`;
      }).join('')
    : '<p class="muted">No estás inscripto a materias.</p>';

  // Calcular promedios generales
  const promediosValidos = notas.map(n => parseFloat(n?.promedio)).filter(p => !isNaN(p));
  const promedioGeneral = promediosValidos.length
    ? (promediosValidos.reduce((a, b) => a + b, 0) / promediosValidos.length).toFixed(2)
    : '-';
  promediosDiv.innerHTML = `<div class="small-card">Promedio general: <strong>${promedioGeneral}</strong></div>`;
})();
