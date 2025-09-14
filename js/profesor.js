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
    // Obtener notas de todos los alumnos
    const notas = await Promise.all(resolved.map(u => getNota(u.dni, id)));
    // Tabla tipo Excel
    let tabla = `<table class="table excel-table"><thead><tr><th>Alumno</th><th>DNI</th><th>Parcial 1</th><th>Parcial 2</th><th>Final</th><th>Promedio</th><th>Acción</th></tr></thead><tbody>`;
    tabla += resolved.map((u, idx) => {
      const n = notas[idx] || {};
      return `<tr>
        <td>${u.nombre}</td>
        <td>${u.dni}</td>
        <td><input type="number" min="0" max="10" id="p1_${u.dni}" value="${n.parcial1 ?? ''}" style="width:50px;"></td>
        <td><input type="number" min="0" max="10" id="p2_${u.dni}" value="${n.parcial2 ?? ''}" style="width:50px;"></td>
        <td><input type="number" min="0" max="10" id="fin_${u.dni}" value="${n.final ?? ''}" style="width:50px;"></td>
        <td id="prom_${u.dni}">${n.promedio ?? '-'}</td>
        <td><button class="btn" onclick="guardarNota('${u.dni}','${id}')">Guardar</button></td>
      </tr>`;
    }).join('');
    tabla += '</tbody></table>';
    document.getElementById('materiaDetalle').innerHTML = `<h3>${m.nombre}</h3>${tabla}`;
    // Actualizar promedio al editar inputs
    resolved.forEach(u => {
      ['p1','p2','fin'].forEach(field => {
        const input = document.getElementById(`${field}_${u.dni}`);
        input.addEventListener('input', () => {
          const p1 = Number(document.getElementById('p1_' + u.dni).value);
          const p2 = Number(document.getElementById('p2_' + u.dni).value);
          const fin = Number(document.getElementById('fin_' + u.dni).value);
          const nums = [p1, p2, fin].filter(n => typeof n === 'number' && !isNaN(n));
          const prom = nums.length ? (nums.reduce((a,b)=>a+b,0)/nums.length).toFixed(2) : '-';
          document.getElementById('prom_' + u.dni).textContent = prom;
        });
      });
    });
  };

  window.guardarNota = async (alumnoDni, materiaId) => {
    const p1 = document.getElementById('p1_' + alumnoDni).value;
    const p2 = document.getElementById('p2_' + alumnoDni).value;
    const fin = document.getElementById('fin_' + alumnoDni).value;
    const obj = {
      alumnoId: alumnoDni,
      materiaId,
      parcial1: p1 ? Number(p1) : null,
      parcial2: p2 ? Number(p2) : null,
      final: fin ? Number(fin) : null
    };
    // compute promedio simple (if numbers)
    const nums = [obj.parcial1, obj.parcial2, obj.final].filter(n => typeof n === 'number' && !isNaN(n));
    obj.promedio = nums.length ? (nums.reduce((a,b)=>a+b,0)/nums.length).toFixed(2) : null;
    await setNota(alumnoDni, materiaId, obj);
    alert('Nota guardada.');
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
