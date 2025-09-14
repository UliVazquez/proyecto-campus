// alumno.js - student dashboard
(async ()=>{
  const session = JSON.parse(sessionStorage.getItem('sessionUser') || 'null');
  if (!session || session.rol !== 'alumno'){ window.location.href = 'index.html'; return; }
  document.getElementById('alumnoName').textContent = session.nombre;
  document.getElementById('signOut').addEventListener('click', ()=>{ sessionStorage.removeItem('sessionUser'); window.location.href='index.html'; });

  async function refresh(){
    const profile = document.getElementById('profile');
    profile.innerHTML = `<p><strong>${session.nombre}</strong></p><p>DNI: ${session.dni}</p><p>Curso: ${session.curso || '---'}</p><p>Turno: ${session.turno || '---'}</p>`;

    const materias = await getAllMaterias();
    const myMaterias = materias.filter(m => (m.alumnosInscritos||[]).includes(session.dni));
    const mis = document.getElementById('misMaterias');
    mis.innerHTML = myMaterias.length ? myMaterias.map(m => `<div class="small-card"><strong>${m.nombre}</strong> — ${m.horario||''} <div class="muted small">Profesor: ${m.profesorDni||'---'}</div></div>`).join('') : '<p class="muted">No estás inscripto a materias todavía.</p>';

    // examenes list (all)
    const examenes = await getAllExamenes();
    const myEx = examenes.map(e => {
      const inscritos = e.alumnosInscriptos || [];
      const isIn = inscritos.includes(session.dni);
      return `<div class="small-card"><strong>Materia: ${e.materiaId}</strong> — Fecha: ${e.fecha} — Turno: ${e.turno} <div class="action-row"><button class="btn" onclick="toggleEx(${JSON.stringify(e.id)})">${isIn? 'Anular inscripción' : 'Inscribirme'}</button></div></div>`;
    }).join('');
    document.getElementById('misExamenes').innerHTML = myEx || '<p class="muted">No hay exámenes programados.</p>';

    // notas
    const notasEl = document.getElementById('misNotas');
    const notasPromises = myMaterias.map(m => getNota(session.dni, m.id));
    const notas = await Promise.all(notasPromises);
    notasEl.innerHTML = myMaterias.map((m, idx) => {
      const n = notas[idx] || {};
      return `<div class="small-card"><strong>${m.nombre}</strong><div class="muted small">Promedio: ${n.promedio || '-'}</div><div>Parciales: ${n.parcial1||'-'}, ${n.parcial2||'-'} — Final: ${n.final||'-'}</div></div>`;
    }).join('') || '<p class="muted">Sin notas todavía.</p>';
  }

  window.toggleEx = async (exId)=>{
    // stringify id from template
    const id = exId;
    const exam = await (DB ? fs_getDoc('examenes', id) : ls_getDoc('examenes', id));
    if (!exam) return alert('Examen no encontrado');
    const inscritos = exam.alumnosInscriptos || [];
    if (inscritos.includes(session.dni)){
      // remove
      exam.alumnosInscriptos = inscritos.filter(d => d !== session.dni);
      await updateExamen(id, exam);
      alert('Inscripción anulada');
    } else {
      exam.alumnosInscriptos.push(session.dni);
      await updateExamen(id, exam);
      alert('Inscripto al examen');
    }
    await refresh();
  };

  await refresh();
})();
