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


// 🔥 GUARDAR DIAGNÓSTICO
function guardar(){

  try {

    let implementados = 0;
    let parciales = 0;
    let noImplementados = 0;

    // 🔹 RECORRER 30 PREGUNTAS
    for(let i = 1; i <= 30; i++){

      const val = parseInt(document.getElementById("p" + i).value);

      if(isNaN(val)){
        alert("Debes responder todas las preguntas");
        return;
      }

      if(val === 2){
        implementados++;
      }
      else if(val === 1){
        parciales++;
      }
      else{
        noImplementados++;
      }

    }

    // 🔥 ESTADO GENERAL
    let estado = "Crítico";

    if(implementados >= 24){
      estado = "Óptimo";
    }
    else if(implementados >= 16){
      estado = "Aceptable";
    }
    else if(implementados >= 10){
      estado = "En desarrollo";
    }

    // 🔥 RIESGO
    let riesgo = "Alto";

    if(noImplementados <= 5){
      riesgo = "Bajo";
    }
    else if(noImplementados <= 12){
      riesgo = "Medio";
    }

    // 🔥 INDICADORES LEAN
    const eficiencia = Math.round((implementados / 30) * 100);

    const desperdicio = Math.round((noImplementados / 30) * 100);

    const madurez = Math.round(((implementados + parciales) / 60) * 100);

    // 🔥 PROMEDIOS POR CATEGORÍA
    const estrategia = promedio(1, 6);

    const operacion = promedio(7, 12);

    const recursos = promedio(13, 18);

    const sst = promedio(19, 24);

    const mejora = promedio(25, 30);

    // 🔥 USUARIO
    const user = auth.currentUser;

    if(!user){
      alert("No hay sesión activa");
      return;
    }

    // 🔥 OBTENER EMPRESA
    db.collection("usuarios")
      .doc(user.uid)
      .get()

      .then(doc => {

        if(!doc.exists){
          alert("No se encontró información de la empresa");
          return;
        }

        const nombreEmpresa = doc.data().nombre || user.email;

        // 🔥 GUARDAR EN FIRESTORE
        return db.collection("diagnosticos").add({

          usuario: nombreEmpresa,
          email: user.email,

          estado,
          riesgo,

          implementados,
          parciales,
          noImplementados,

          eficiencia,
          desperdicio,
          madurez,

          estrategia,
          operacion,
          recursos,
          sst,
          mejora,

          fecha: new Date()

        });

      })

      .then(() => {

        alert("Diagnóstico enviado correctamente ✅");

      })

      .catch(err => {

        console.error(err);
        alert("Error al guardar diagnóstico");

      });

  }

  catch(error){

    console.error(error);
    alert("Error general");

  }

}


// 🔥 CALCULAR PROMEDIOS
function promedio(inicio, fin){

  let suma = 0;

  for(let i = inicio; i <= fin; i++){

    suma += parseInt(
      document.getElementById("p" + i).value
    );

  }

  return Math.round(
    (suma / ((fin - inicio + 1) * 2)) * 100
  );

}


// 🚪 CERRAR SESIÓN
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