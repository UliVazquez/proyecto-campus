# Proyecto: Campus Virtual (entrega para Netlify)
Este paquete contiene un frontend listo para subir a Netlify y conectarse opcionalmente a Firebase (Firestore).
También incluye un modo **localStorage** para usarlo sin configurar Firebase (modo demo).

## Estructura
- index.html (login + seed demo)
- admin.html (panel administrador)
- profesor.html (panel profesor)
- alumno.html (panel alumno)
- css/styles.css
- js/
  - firebase-config.js (poné tus claves y setear USE_FIREBASE=true para usar Firestore)
  - db.js (capa de acceso a datos; usa Firestore o localStorage según firebase-config)
  - auth.js, admin.js, profesor.js, alumno.js

## Pasos para usarlo (modo rápido con localStorage - no requiere Firebase)
1. Descomprimí el ZIP en una carpeta.
2. Abrí `index.html` en tu navegador (o subilo a Netlify directamente).
3. En la pantalla de login, clickeá "Seed demo data" para crear datos ejemplo (incluye a Jasmin y un admin demo).
4. Credenciales demo:
   - Admin: DNI `99999999`, contraseña `899999999`
   - Alumno ejemplo (Jasmin): DNI `48687299`, contraseña `848687299`
   - Profesor ejemplo: DNI `44675045`, contraseña `844675045`
5. Iniciá sesión como admin para crear más usuarios, materias y exámenes. Los cambios se guardarán en el navegador (localStorage) o en Firestore si lo activás.

## Pasos para usar con Firebase (recomendado si querés datos centralizados)
1. Creá un proyecto en https://console.firebase.google.com/
2. En "Build" > "Firestore Database" creá una base de datos en modo de prueba (o con reglas adecuadas).
3. En la configuración del proyecto obtené el fragmento de configuración (apiKey, projectId, etc.).
4. Abrí `js/firebase-config.js` y:
   - pegá la configuración en la constante `firebaseConfig`
   - poné `const USE_FIREBASE = true;`
5. Subí el sitio a Netlify (o abrilo localmente). El sistema ahora usará Firestore para persistir datos.
6. Seed: desde `index.html` clickeá "Seed demo data" y eso poblará Firestore con datos de ejemplo.

## Notas importantes
- Este proyecto usa una **autenticación simple basada en documentos** (usuario + contraseña guardada en Firestore/localStorage). Para un sistema en producción **es obligatorio** usar Firebase Authentication u otro sistema seguro.
- El seed crea datos de ejemplo: 10 materias, 10 profesores, 5 alumnos (incluye a Jasmin) y un admin demo (dni 99999999).
- Para producción: configurá reglas de seguridad de Firestore y migrá a Firebase Auth para manejar usuarios correctamente.

## Deploy en Netlify
1. Crear una cuenta en https://www.netlify.com/ (gratis).
2. Subir la carpeta descomprimida como "Deploy" (arrastrá y soltá) o conectá con un repo Git.
3. En la configuración, si usás Firebase, no olvides habilitar CORS y reglas apropiadas en Firestore.

Si querés, te doy los pasos exactos para crear el proyecto en Firebase y pegar la configuración en `js/firebase-config.js`.