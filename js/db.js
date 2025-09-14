// db.js
import { db, USE_FIREBASE } from './firebase-config.js';
import { collection, doc, getDoc, getDocs, setDoc, addDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// ------------------- Firestore wrappers -------------------
async function fs_getAll(collectionName){
  const snap = await getDocs(collection(db, collectionName));
  const arr = [];
  snap.forEach(docSnap => arr.push({id: docSnap.id, ...docSnap.data()}));
  return arr;
}

async function fs_getDoc(collectionName, id){
  const docSnap = await getDoc(doc(db, collectionName, id));
  if (!docSnap.exists()) return null;
  return {id: docSnap.id, ...docSnap.data()};
}

async function fs_setDoc(collectionName, id, data){
  await setDoc(doc(db, collectionName, id), data, {merge:true});
  return true;
}

async function fs_addDoc(collectionName, data){
  const ref = await addDoc(collection(db, collectionName), data);
  return ref.id;
}

async function fs_deleteDoc(collectionName, id){
  await deleteDoc(doc(db, collectionName, id));
}


// ------------------- Usuarios -------------------
export async function getAllUsuarios(){
  return await fs_getAll('usuarios');
}

export async function getUsuarioByDni(dni){
  const q = query(collection(db,"usuarios"),where("dni","==",dni));
  const snap = await getDocs(q);
  let found = null;
  snap.forEach(docSnap => { found = {id:docSnap.id, ...docSnap.data()}; });
  return found;
}

export async function createUsuario(user){
  if (!user.dni) throw new Error("dni requerido");
  await fs_setDoc('usuarios', user.dni, user);
  return user.dni;
}

export async function updateUsuario(dni, patch){
  await fs_setDoc('usuarios', dni, patch);
  return true;
}

export async function deleteUsuario(dni){
  await fs_deleteDoc('usuarios',dni);
  return true;
}

// ------------------- Materias -------------------
export async function getAllMaterias(){ return await fs_getAll('materias'); }
export async function getMateria(id){ return await fs_getDoc('materias',id); }
export async function createMateria(id,data){ if (!id) id='m_'+Date.now(); await fs_setDoc('materias',id,data); return id; }
export async function updateMateria(id,patch){ await fs_setDoc('materias',id,patch); return true; }
export async function deleteMateria(id){ await fs_deleteDoc('materias',id); }

// ------------------- Examenes -------------------
export async function getAllExamenes(){ return await fs_getAll('examenes'); }
export async function getExamen(id){ return await fs_getDoc('examenes',id); }
export async function createExamen(id,data){ if (!id) id='ex_'+Date.now(); await fs_setDoc('examenes',id,data); return id; }
export async function updateExamen(id,patch){ await fs_setDoc('examenes',id,patch); return true; }
export async function deleteExamen(id){ await fs_deleteDoc('examenes',id); }

// ------------------- Notas -------------------
export async function setNota(alumnoId,materiaId,notaObj){
  const key = alumnoId+'___'+materiaId;
  await fs_setDoc('notas',key,notaObj);
  return key;
}
export async function getNota(alumnoId,materiaId){
  const key = alumnoId+'___'+materiaId;
  return await fs_getDoc('notas',key);
}

// ------------------- Enrollment helpers -------------------
export async function enrollAlumnoToMateria(alumnoDni,materiaId){
  const materia = await getMateria(materiaId);
  const usuario = await getUsuarioByDni(alumnoDni);
  if (!materia || !usuario) throw new Error("Materia o usuario no encontrado");
  materia.alumnosInscritos = materia.alumnosInscritos || [];
  if (!materia.alumnosInscritos.includes(alumnoDni)) materia.alumnosInscritos.push(alumnoDni);
  await updateMateria(materiaId,materia);
  usuario.materiasInscritas = usuario.materiasInscritas || [];
  if (!usuario.materiasInscritas.includes(materiaId)) usuario.materiasInscritas.push(materiaId);
  await updateUsuario(alumnoDni,usuario);
  return true;
}

export async function unenrollAlumnoFromMateria(alumnoDni,materiaId){
  const materia = await getMateria(materiaId);
  const usuario = await getUsuarioByDni(alumnoDni);
  if (!materia || !usuario) throw new Error("Materia o usuario no encontrado");
  materia.alumnosInscritos = (materia.alumnosInscritos||[]).filter(x=>x!==alumnoDni);
  await updateMateria(materiaId,materia);
  usuario.materiasInscritas = (usuario.materiasInscritas||[]).filter(x=>x!==materiaId);
  await updateUsuario(alumnoDni,usuario);
  return true;
}

export async function enrollAlumnoToExamen(alumnoDni,examenId){
  const examen = await getExamen(examenId);
  examen.alumnosInscriptos = examen.alumnosInscriptos || [];
  if (!examen.alumnosInscriptos.includes(alumnoDni)) examen.alumnosInscriptos.push(alumnoDni);
  await updateExamen(examenId,examen);
}