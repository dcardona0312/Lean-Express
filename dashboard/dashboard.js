let graficaDetalle = null;


// 🔐 VALIDAR SESIÓN
auth.onAuthStateChanged(user => {

  if (!user) {
    window.location.href = "../index.html";
    return;
  }

  cargarResumen();
  cargarHistorial();
});


// 👤 CREAR EMPRESA
function crearUsuario(){

  const nombre = document.getElementById("newNombre").value.trim();
  const email = document.getElementById("newEmail").value.trim();
  const password = document.getElementById("newPassword").value.trim();

  if(nombre === "" || email === "" || password === ""){
    alert("Completa todos los campos");
    return;
  }

  auth.createUserWithEmailAndPassword(email,password)
    .then(res => {

      return db.collection("usuarios").doc(res.user.uid).set({
        nombre:nombre,
        email:email,
        rol:"empresa",
        fecha:new Date()
      });

    })
    .then(()=>{
      alert("Empresa creada correctamente");
      cargarResumen();
    })
    .catch(error => alert(error.message));
}


// 📊 RESUMEN
function cargarResumen(){

  db.collection("usuarios")
    .where("rol","==","empresa")
    .get()
    .then(s => document.getElementById("totalEmpresas").textContent = s.size);

  db.collection("diagnosticos")
    .get()
    .then(s => document.getElementById("totalDiag").textContent = s.size);
}


// 📊 HISTORIAL
function cargarHistorial(){

  const tabla = document.getElementById("historial");
  tabla.innerHTML = "";

  db.collection("diagnosticos")
    .orderBy("fecha","desc")
    .get()
    .then(snapshot => {

      snapshot.forEach(doc => {

        const d = doc.data();

        let fecha = "Sin fecha";
        if(d.fecha && d.fecha.toDate){
          fecha = d.fecha.toDate().toLocaleDateString();
        }

        tabla.innerHTML += `
          <tr>
            <td>${d.usuario || "N/A"}</td>
            <td>${d.estado || "N/A"}</td>
            <td>${d.riesgo || "N/A"}</td>
            <td>${fecha}</td>
            <td>
              <button onclick="verDetalle('${doc.id}')">
                Ver más
              </button>
            </td>
          </tr>
        `;

      });

    })
    .catch(err => {
      console.error("Error cargando historial:", err);
    });
}


// 🔍 VER DETALLE
function verDetalle(id){

  db.collection("diagnosticos").doc(id).get()
    .then(doc => {

      const d = doc.data();

      const ctx = document.getElementById("detalleGrafica");

      if(graficaDetalle){
        graficaDetalle.destroy();
      }

      graficaDetalle = new Chart(ctx, {
        type:"radar",
        data:{
          labels:["Contexto","Identificar","Proteger"],
          datasets:[{
            label:d.usuario,
            data:[
              d.contexto || 0,
              d.identificar || 0,
              d.proteger || 0
            ],
            fill:true
          }]
        },
        options:{
          responsive:true,
          maintainAspectRatio:false,
          scales:{
            r:{ min:0, max:100 }
          }
        }
      });

      // 🔥 BADGE
      const badge = document.getElementById("estadoDetalle");
      badge.className = "badge-detalle";

      if(d.riesgo === "Alto") badge.classList.add("critico");
      else if(d.riesgo === "Medio") badge.classList.add("medio");
      else badge.classList.add("maduro");

      badge.textContent = d.riesgo;


      // 🔥 RECOMENDACIONES AVANZADAS ISO
      let recomendaciones = "";

      if((d.contexto || 0) < 60){
        recomendaciones += `
          <li><strong>Gestión de activos:</strong> Inventariar dispositivos, software y usuarios.</li>
          <li>Controlar acceso a dispositivos y software autorizado.</li>
        `;
      }

      if((d.identificar || 0) < 60){
        recomendaciones += `
          <li><strong>ISO 27032 - Identificación:</strong> Realizar análisis de riesgos formal.</li>
          <li>Clasificar información y activos críticos.</li>
          <li>Identificar amenazas como phishing, malware y ataques internos.</li>
        `;
      }

      if((d.proteger || 0) < 60){
        recomendaciones += `
          <li><strong>ISO 27032 - Protección:</strong> Implementar autenticación fuerte (2FA).</li>
          <li>Configurar firewall, antivirus y backups.</li>
          <li>Aplicar control de accesos por roles.</li>
        `;
      }

      if(d.riesgo === "Alto"){
        recomendaciones += `
          <li><strong>Riesgo alto:</strong> Requiere intervención inmediata.</li>
          <li>Implementar plan de respuesta a incidentes.</li>
        `;
      }

      recomendaciones += `
        <li><strong>Capacitación:</strong> Formar empleados en ciberseguridad.</li>
        <li>Prevenir ataques de ingeniería social.</li>
      `;


      // 🔥 DETALLE
      document.getElementById("detalleInfo").innerHTML = `
        <h4>${d.usuario}</h4>

        <p>Evaluación basada en ISO 27032 enfocada en riesgos y controles.</p>

        <div class="kpi-grid">

          <div class="kpi-box">
            <span>Contexto</span>
            <strong>${d.contexto || 0}%</strong>
          </div>

          <div class="kpi-box">
            <span>Identificar</span>
            <strong>${d.identificar || 0}%</strong>
          </div>

          <div class="kpi-box">
            <span>Proteger</span>
            <strong>${d.proteger || 0}%</strong>
          </div>

          <div class="kpi-box">
            <span>Estado</span>
            <strong>${d.estado}</strong>
          </div>

        </div>

        <div class="section-title">Recomendaciones</div>
        <ul>${recomendaciones}</ul>
      `;

    })
    .catch(err => {
      console.error(err);
    });
}


// 🚪 LOGOUT
function logout(){
  auth.signOut().then(()=>{
    window.location.href = "../index.html";
  });
}