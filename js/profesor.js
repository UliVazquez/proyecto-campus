import { getAllMaterias, getMateria, getUsuarioByDni, getNota, setNota, createExamen } from './db.js';
// profesor.js - actions for professor dashboard
(async ()=>{
  const session = JSON.parse(sessionStorage.getItem('sessionUser') || 'null');
  if (!session || session.rol !== 'profesor'){ window.location.href = 'index.html'; return; }
  document.getElementById('profeName').textContent = session.nombre;
  document.getElementById('signOut').addEventListener('click', ()=>{ sessionStorage.removeItem('sessionUser'); window.location.href='index.html'; });

  async function refresh(){
    // get materias assigned to this professor (materias where profesorDni == session.dni)
    const all = await getAllMaterias();
    const mine = all.filter(m => m.profesorDni === session.dni);
    const container = document.getElementById('profMaterias');
    if (mine.length === 0) container.innerHTML = '<p class="muted">No tenés materias asignadas.</p>';
    else container.innerHTML = mine.map(m => `<div class="small-card"><strong>${m.nombre}</strong> — ID: ${m.id} — ${m.horario || ''} <div class="action-row"><button class="btn" onclick="abrirMateria('${m.id}')">Ver</button></div></div>`).join('');
    // populate exam materia select
    const sel = document.getElementById('exam_materia');
    sel.innerHTML = mine.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
  }

  window.abrirMateria = async (id) => {
    const m = await getMateria(id);
    const alumnos = (m.alumnosInscritos || []).map(dni => getUsuarioByDni(dni));
    const resolved = await Promise.all(alumnos);
    const tabla = `<table class="table"><thead><tr><th>Alumno</th><th>DNI</th><th>Notas (parc1, parc2, final)</th><th>Acción</th></tr></thead><tbody>
      ${resolved.map(u => `<tr><td>${u.nombre}</td><td>${u.dni}</td><td id="notas_${u.dni}">${(u.materiasInscritas||[]).includes(id)?'':'(no inscrito)'}</td>
        <td><button class="btn" onclick="editarNota('${u.dni}','${id}')">Editar nota</button></td></tr>`).join('')}
    </tbody></table>`;
    document.getElementById('materiaDetalle').innerHTML = `<h3>${m.nombre}</h3>${tabla}`;
  };

  window.editarNota = async (alumnoDni, materiaId) => {
    const nota = await getNota(alumnoDni, materiaId) || {parcial1:null, parcial2:null, final:null};
    const p1 = prompt('Parcial 1', nota.parcial1 || '');
    const p2 = prompt('Parcial 2', nota.parcial2 || '');
    const fin = prompt('Final', nota.final || '');
    const obj = {alumnoId:alumnoDni, materiaId, parcial1: p1 ? Number(p1) : null, parcial2: p2 ? Number(p2) : null, final: fin ? Number(fin) : null};
    // compute promedio simple (if numbers)
    const nums = [obj.parcial1, obj.parcial2, obj.final].filter(n => typeof n === 'number');
    obj.promedio = nums.length ? (nums.reduce((a,b)=>a+b,0)/nums.length).toFixed(2) : null;
    await setNota(alumnoDni, materiaId, obj);
    alert('Nota guardada (simulado).');
    // refresh view
    const el = document.getElementById('notas_' + alumnoDni);
    if (el) el.textContent = `${obj.parcial1||'-'}, ${obj.parcial2||'-'}, ${obj.final||'-'}`;
  };

  document.getElementById('crearExamenProfe').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const materiaId = document.getElementById('exam_materia').value;
    const fecha = document.getElementById('exam_fecha').value;
    const turno = document.getElementById('exam_turno').value;
    if (!materiaId || !fecha) return alert('Completar materia y fecha');
    const id = 'EX' + Date.now();
    await createExamen(id, {id, materiaId, profesorDni: session.dni, fecha, turno, alumnosInscriptos: []});
    alert('Examen creado.');
  });

  await refresh();
})();
