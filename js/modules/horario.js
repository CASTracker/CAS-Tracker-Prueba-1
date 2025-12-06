// js/modules/horario.js
import { qs } from "../ui/dom.js";
import { notify } from "../ui/notifications.js";
import { pushHorario } from "./state.js";

export function setupHorario(state, uid) {
  const guardarBtn = qs("#guardarHorario");
  const limpiarBtn = qs("#limpiarHorario");
  if (guardarBtn) guardarBtn.addEventListener("click", () => {
    const filas = document.querySelectorAll("#tablaHorario tbody tr");
    const horario = [];
    filas.forEach(row => {
      const dia = row.children[0].textContent;
      const actividad = row.children[1].textContent.trim();
      horario.push({ dia, actividad });
    });
    state.horario = horario;
    localStorage.setItem("horarioCAS", JSON.stringify(horario));
    if (uid) pushHorario(uid, horario).catch(()=>{});
    notify("Horario guardado ✅", "success");
  });

  if (limpiarBtn) limpiarBtn.addEventListener("click", () => {
    localStorage.removeItem("horarioCAS");
    document.querySelectorAll("#tablaHorario tbody tr td:nth-child(2)").forEach(td => td.textContent = "");
    state.horario = [];
    if (uid) pushHorario(uid, []).catch(()=>{});
    notify("Horario limpiado 🧹", "info");
  });
}

export function cargarHorario(state) {
  const horario = state.horario || JSON.parse(localStorage.getItem("horarioCAS") || "[]");
  const filas = document.querySelectorAll("#tablaHorario tbody tr");
  if (!filas.length) return;
  horario.forEach((h, i) => {
    if (filas[i]) filas[i].children[1].textContent = h.actividad;
  });
}
