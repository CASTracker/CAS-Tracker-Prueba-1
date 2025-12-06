// js/firebase/firestore.js
import { db } from "./init.js";
import {
  doc, getDoc, setDoc, updateDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export async function getUserDoc(uid) {
  const ref = doc(db, "usuarios", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function setUserDoc(uid, data) {
  return setDoc(doc(db, "usuarios", uid), data, { merge: true });
}

export async function updateUserField(uid, field, value) {
  const ref = doc(db, "usuarios", uid);
  return updateDoc(ref, { [field]: value });
}

// more granular helpers operate on whole arrays to avoid race conditions
export async function addActivityToUser(uid, activity) {
  const user = await getUserDoc(uid);
  const arr = (user?.actividades || []).concat(activity);
  return setUserDoc(uid, { actividades: arr });
}
export async function updateActivities(uid, activities) {
  return setUserDoc(uid, { actividades });
}
export async function updateReflexiones(uid, reflexiones) {
  return setUserDoc(uid, { reflexiones });
}
export async function updateHorario(uid, horario) {
  return setUserDoc(uid, { horario });
}

export function listenToUser(uid, callback) {
  const ref = doc(db, "usuarios", uid);
  const unsubs = onSnapshot(ref, (snap) => {
    if (snap.exists()) callback(snap.data());
    else callback(null);
  }, (err) => console.error("Firestore listen error", err));
  return unsubs;
}
