import { getAllUsuarios, getUsuarioByDni, createUsuario, deleteUsuario, getAllMaterias, createMateria, getAllExamenes, createExamen, updateUsuario } from './db.js';
// admin.js - admin panel interactions
(async ()=>{
  const session = JSON.parse(sessionStorage.getItem('sessionUser') || 'null');
  if (!session || session.rol !== 'admin'){ window.location.href = 'index.html'; return; }

  document.getElementById('signOut').addEventListener('click', ()=>{ sessionStorage.removeItem('sessionUser'); window.location.href='index.html'; });

  // load lists
  async function refresh(){
    const usuarios = await getAllUsuarios();
    const materias = await getAllMaterias();
    const examenes = await getAllExamenes();
    // users
    const ul = document.getElementById('usersList');
    ul.innerHTML = usuarios.map(u => {
      return `<div class="small-card"><strong>${u.nombre || '(sin nombre)'}</strong> — ${u.rol} — DNI: ${u.dni} ${u.curso?(' — '+u.curso):''}
        <div class="action-row" style="margin-top:8px">
          <button class="btn ghost" onclick="viewUser('${u.dni}')">Ver</button>
          <button class="btn" onclick="deleteUser('${u.dni}')">Borrar</button>
        </div>
      </div>`;
    }).join('');
    // materias
    const ml = document.getElementById('materiasList');
    ml.innerHTML = materias.map(m => `<div class="small-card"><strong>${m.nombre}</strong> — Prof DNI: ${m.profesorDni || '---'} — ${m.horario || ''} <div class="muted small">Inscritos: ${(m.alumnosInscritos||[]).length}</div></div>`).join('');
    // examenes
    const el = document.getElementById('examenesList');
    el.innerHTML = examenes.map(e => `<div class="small-card"><strong>${e.materiaId}</strong> — Fecha: ${e.fecha} — Turno: ${e.turno} — Inscriptos: ${(e.alumnosInscriptos||[]).length}</div>`).join('');
    // populate select for creating exam (materias)
    const eSel = document.getElementById('e_materia');
    eSel.innerHTML = materias.map(m => `<option value="${m.id || m.nombre}">${m.id || m.nombre} — ${m.nombre}</option>`).join('');
  }

  window.viewUser = async (dni) => {
    const u = await getUsuarioByDni(dni);
    const modal = document.getElementById('userProfileModal');
    if (!modal) return alert(JSON.stringify(u, null, 2));
    modal.style.display = 'block';
    document.getElementById('profile_dni').value = u.dni || '';
    document.getElementById('profile_nombre').value = u.nombre || '';
    document.getElementById('profile_rol').value = u.rol || '';
    document.getElementById('profile_curso').value = u.curso || '';
    document.getElementById('profile_turno').value = u.turno || '';
    document.getElementById('profile_area').value = Array.isArray(u.area) ? u.area.join(', ') : (u.area || '');
    window._currentProfileDni = u.dni;
  };

  // Cerrar modal
  document.getElementById('closeProfileModal').onclick = ()=>{
    document.getElementById('userProfileModal').style.display = 'none';
  };
  // Guardar cambios
  document.getElementById('userProfileForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const dni = document.getElementById('profile_dni').value;
    const nombre = document.getElementById('profile_nombre').value;
    const curso = document.getElementById('profile_curso').value;
    const turno = document.getElementById('profile_turno').value;
    const area = document.getElementById('profile_area').value.split(',').map(x=>x.trim()).filter(x=>x);
    await updateUsuario(dni, {nombre, curso, turno, area});
    alert('Perfil actualizado');
    document.getElementById('userProfileModal').style.display = 'none';
    await refresh();
  });
  window.deleteUser = async (dni) => {
    if (!confirm('Borrar usuario ' + dni + '?')) return;
    await deleteUsuario(dni);
    await refresh();
  };

  document.getElementById('createUserForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const dni = document.getElementById('u_dni').value.trim();
    const nombre = document.getElementById('u_nombre').value.trim();
    const rol = document.getElementById('u_rol').value;
    const curso = document.getElementById('u_curso').value.trim();
    const turno = document.getElementById('u_turno').value;
    if (!dni || !nombre) return alert('Completar dni y nombre');
    const user = {dni, nombre, rol, curso, turno, materiasInscritas: [] , password: '8' + dni};
    await createUsuario(user);
    alert('Usuario creado. Contraseña por defecto: ' + user.password);
    e.target.reset();
    await refresh();
  });

  document.getElementById('createMateriaForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const nombre = document.getElementById('m_nombre').value.trim();
    const profesorDni = document.getElementById('m_profesor').value.trim();
    const horario = document.getElementById('m_horario').value.trim();
    const turno = document.getElementById('m_turno').value;
    if (!nombre) return alert('Nombre requerido');
    const id = 'M' + Date.now();
    await createMateria(id, {id, nombre, profesorDni, horario, turno, alumnosInscritos: []});
    e.target.reset();
    await refresh();
  });

  document.getElementById('createExamenForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const materiaId = document.getElementById('e_materia').value;
    const fecha = document.getElementById('e_fecha').value;
    const turno = document.getElementById('e_turno').value;
    if (!materiaId || !fecha) return alert('Completar materia y fecha');
    const id = 'EX' + Date.now();
    await createExamen(id, {id, materiaId, fecha, turno, alumnosInscriptos: []});
    e.target.reset();
    await refresh();
  });

  await refresh();
})();
