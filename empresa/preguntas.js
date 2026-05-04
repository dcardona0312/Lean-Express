// 🔥 VALIDAR SESIÓN
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "../index.html";
  }
});


function guardar(){

  try {

    let total = 0;

    for(let i = 1; i <= 40; i++){

      const elemento = document.getElementById("p"+i);

      if(!elemento){
        alert("Error: falta la pregunta p" + i);
        return;
      }

      const valor = elemento.value;

      if(valor === ""){
        alert("Debes responder todas las preguntas");
        return;
      }

      total += parseInt(valor);
    }

    // 🔥 VALIDAR USUARIO
    if(!auth.currentUser){
      alert("No hay usuario autenticado");
      return;
    }

    const porcentaje = Math.round((total/(40*2))*100);

    let nivel = "Crítico";
    if(porcentaje > 70) nivel = "Maduro";
    else if(porcentaje > 40) nivel = "Medio";

    // 🔥 GUARDAR EN FIREBASE
    db.collection("diagnosticos").add({
      usuario: auth.currentUser.email,
      porcentaje: porcentaje,
      nivel: nivel,
      fecha: new Date()
    })
    .then(()=>{
      alert("Diagnóstico guardado correctamente ✅");
    })
    .catch(err=>{
      console.error("Error Firebase:", err);
      alert("Error al guardar en Firebase");
    });

  } catch (error) {
    console.error("Error general:", error);
    alert("Error en el formulario");
  }

}


// 🔥 LOGOUT (FORZADO)
function logout(){

  auth.signOut()
  .then(()=>{
    window.location.href = "../index.html";
  })
  .catch(err=>{
    console.error(err);
    alert("Error al cerrar sesión");
  });

}