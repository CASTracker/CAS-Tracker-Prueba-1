// js/modules/actividades.js
import { qs, create } from "../ui/dom.js";
import { notify } from "../ui/notifications.js";
import { pushActivities } from "./state.js";

export function formatCat(code) {
  if (code === "C") return "Creatividad";
  if (code === "A") return "Actividad";
  if (code === "S") return "Servicio";
  return code || "";
}

export function setupActividadesUI(state, uid) {
  const form = qs("#formActividad");
  if (form) form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = qs("#nombre").value.trim();
    const categoria = qs("#categoria").value;
    const horas = Number(qs("#horas").value) || 0;
    const fecha = qs("#fecha").value;
    const descripcion = qs("#descripcion").value.trim();

    // validations
    if (!nombre || !categoria || horas <= 0 || !fecha) {
      notify("Por favor completa todos los campos correctamente", "error");
      return;
    }

    const actividad = { id: Date.now(), nombre, categoria, horas, fecha, descripcion };
    state.actividades.push(actividad);
    localStorage.setItem("actividadesCAS", JSON.stringify(state.actividades));
    renderActividades(state, uid);
    // push to cloud (debounced in state or immediate)
    if (uid) pushActivities(uid, state.actividades).catch(()=>{});
    form.reset();
    notify("Actividad guardada", "success");
  });

  const btnLimpiarForm = qs("#btnLimpiarForm");
  if (btnLimpiarForm) btnLimpiarForm.addEventListener("click", () => form.reset());
}

export function renderActividades(state = { actividades: [] }, uid) {
  const tabla = qs("#tablaActividades tbody");
  if (!tabla) return;
  tabla.innerHTML = "";
  state.actividades.slice().reverse().forEach((act) => {
    const tr = create("tr");
    tr.innerHTML = `
      <td>${act.nombre}</td>
      <td>${formatCat(act.categoria)}</td>
      <td>${act.horas}</td>
      <td>${act.fecha}</td>
      <td>${act.descripcion || ""}</td>
      <td>
        <button class="btn small outline" data-action="edit" data-id="${act.id}">Editar</button>
        <button class="btn small" data-action="delete" data-id="${act.id}">🗑️</button>
      </td>
    `;
    tabla.appendChild(tr);
  });

  // attach delegated events
  tabla.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", (ev) => {
      const id = Number(btn.dataset.id);
      const action = btn.dataset.action;
      if (action === "delete") {
        if (!confirm("¿Seguro que quieres eliminar esta actividad?")) return;
        state.actividades = state.actividades.filter(a => a.id !== id);
        localStorage.setItem("actividadesCAS", JSON.stringify(state.actividades));
        if (uid) pushActivities(uid, state.actividades).catch(()=>{});
        renderActividades(state, uid);
        notify("Actividad eliminada", "info");
      } else if (action === "edit") {
        const act = state.actividades.find(a => a.id === id);
        if (!act) return;
        // populate form to edit (simple replace on submit)
        qs("#nombre").value = act.nombre;
        qs("#categoria").value = act.categoria;
        qs("#horas").value = act.horas;
        qs("#fecha").value = act.fecha;
        qs("#descripcion").value = act.descripcion;
        // remove the old one
        state.actividades = state.actividades.filter(a => a.id !== id);
        localStorage.setItem("actividadesCAS", JSON.stringify(state.actividades));
        renderActividades(state, uid);
        notify("Edita los campos y guarda para actualizar", "info");
      }
    });
  });

  // update totals
  updateTotales(state);
}

export function updateTotales(state) {
  const actividades = state.actividades || [];
  let totalC = 0, totalA = 0, totalS = 0;
  actividades.forEach(a => {
    if (a.categoria === "C") totalC += Number(a.horas) || 0;
    if (a.categoria === "A") totalA += Number(a.horas) || 0;
    if (a.categoria === "S") totalS += Number(a.horas) || 0;
  });
  const totalGeneral = totalC + totalA + totalS;
  const elC = document.getElementById("totalC");
  if (elC) elC.textContent = `${totalC} h`;
  const elA = document.getElementById("totalA");
  if (elA) elA.textContent = `${totalA} h`;
  const elS = document.getElementById("totalS");
  if (elS) elS.textContent = `${totalS} h`;
  const elG = document.getElementById("totalGeneral");
  if (elG) elG.textContent = `${totalGeneral} h`;

  // progress bar (assume target 150)
  const target = 150;
  const percent = Math.min(100, Math.round((totalGeneral / target) * 100));
  const bar = document.getElementById("progressBar");
  if (bar) bar.style.width = percent + "%";
  const text = document.getElementById("progressText");
  if (text) text.textContent = `${totalGeneral} / ${target} horas (${percent}%)`;
}
