// js/modules/state.js
import { listenToUser, setUserDoc, updateActivities, updateReflexiones, updateHorario } from "../firebase/firestore.js";
import { notify } from "../ui/notifications.js";

const LS_KEYS = {
  ACTIVIDADES: "actividadesCAS",
  REFLEXIONES: "reflexionesCAS",
  HORARIO: "horarioCAS"
};

export function loadFromLocal() {
  return {
    actividades: JSON.parse(localStorage.getItem(LS_KEYS.ACTIVIDADES) || "[]"),
    reflexiones: JSON.parse(localStorage.getItem(LS_KEYS.REFLEXIONES) || "[]"),
    horario: JSON.parse(localStorage.getItem(LS_KEYS.HORARIO) || "[]")
  };
}

export function saveToLocal(state) {
  localStorage.setItem(LS_KEYS.ACTIVIDADES, JSON.stringify(state.actividades || []));
  localStorage.setItem(LS_KEYS.REFLEXIONES, JSON.stringify(state.reflexiones || []));
  localStorage.setItem(LS_KEYS.HORARIO, JSON.stringify(state.horario || []));
}

export async function pushAllToCloud(uid, state) {
  if (!uid) return notify("Usuario no identificado", "error");
  await setUserDoc(uid, {
    actividades: state.actividades || [],
    reflexiones: state.reflexiones || [],
    horario: state.horario || []
  });
  notify("Sincronización completada", "success");
}

export async function pushActivities(uid, actividades) {
  await updateActivities(uid, actividades);
  notify("Actividades sincronizadas", "success");
}
export async function pushReflexiones(uid, reflexiones) {
  await updateReflexiones(uid, reflexiones);
  notify("Reflexiones sincronizadas", "success");
}
export async function pushHorario(uid, horario) {
  await updateHorario(uid, horario);
  notify("Horario sincronizado", "success");
}

export function subscribeCloud(uid, onChange) {
  if (!uid) return () => {};
  const unsub = listenToUser(uid, (data) => {
    // deliver cloud data to caller
    onChange({
      actividades: data?.actividades || [],
      reflexiones: data?.reflexiones || [],
      horario: data?.horario || []
    });
  });
  return unsub;
}
