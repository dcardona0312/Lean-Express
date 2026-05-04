// 🔐 VALIDAR SESIÓN
window.addEventListener("load", () => {

  if (typeof auth === "undefined") {
    alert("Firebase no cargó");
    return;
  }

  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = "../index.html";
    }
  });

});


// 🔥 GUARDAR DIAGNÓSTICO (CON NOMBRE EMPRESA)
function guardar(){

  try {

    let implementados = 0;
    let parciales = 0;
    let noImplementados = 0;

    for(let i = 1; i <= 40; i++){

      const val = parseInt(document.getElementById("p" + i).value);

      if(isNaN(val)){
        alert("Debes responder todas las preguntas");
        return;
      }

      if(val === 2) implementados++;
      else if(val === 1) parciales++;
      else noImplementados++;
    }

    // 🔹 ESTADO
    let estado = "Deficiente";
    if(implementados > 25) estado = "Implementado";
    else if(implementados > 15) estado = "Parcial";

    // 🔹 RIESGO
    let riesgo = "Alto";
    if(noImplementados < 10) riesgo = "Bajo";
    else if(noImplementados < 20) riesgo = "Medio";

    // 🔹 PROMEDIOS
    const contexto = promedio(1, 10);
    const identificar = promedio(11, 25);
    const proteger = promedio(26, 40);

    const user = auth.currentUser;

    if(!user){
      alert("No hay sesión activa");
      return;
    }

    // 🔥 OBTENER NOMBRE DESDE FIRESTORE
    db.collection("usuarios")
      .doc(user.uid)
      .get()
      .then(doc => {

        if(!doc.exists){
          alert("No se encontró el usuario en Firestore");
          return;
        }

        const nombreEmpresa = doc.data().nombre || user.email;

        // 🔥 GUARDAR DIAGNÓSTICO
        return db.collection("diagnosticos").add({
          usuario: nombreEmpresa,   // 🔥 AHORA ES NOMBRE
          email: user.email,        // opcional (para trazabilidad)

          estado,
          riesgo,

          implementados,
          parciales,
          noImplementados,

          contexto,
          identificar,
          proteger,

          fecha: new Date()
        });

      })
      .then(() => {
        alert("Diagnóstico guardado correctamente ✅");
      })
      .catch(err => {
        console.error(err);
        alert("Error al guardar diagnóstico");
      });

  } catch (error) {
    console.error(error);
    alert("Error general");
  }

}


// 🔧 PROMEDIO
function promedio(inicio, fin){

  let suma = 0;

  for(let i = inicio; i <= fin; i++){
    suma += parseInt(document.getElementById("p" + i).value);
  }

  return Math.round((suma / ((fin - inicio + 1) * 2)) * 100);
}


// 🚪 LOGOUT
function logout(){

  auth.signOut()
    .then(() => {
      window.location.href = "../index.html";
    })
    .catch(err => {
      console.error(err);
      alert("Error al cerrar sesión");
    });

}