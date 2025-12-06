// js/firebase/auth.js
import { auth, db } from "./init.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { notify } from "../ui/notifications.js";

export function initAuthListeners(onUserChange) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // ensure user doc exists
      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, { email: user.email, actividades: [], reflexiones: [], horario: [] }, { merge: true });
      }
      onUserChange(user);
    } else {
      onUserChange(null);
    }
  });
}

export async function register(email, password) {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    // create user doc
    await setDoc(doc(db, "usuarios", userCred.user.uid), {
      email,
      actividades: [],
      reflexiones: [],
      horario: []
    });
    notify("Cuenta creada ✅", "success");
    return userCred.user;
  } catch (err) {
    notify(err.message, "error");
    throw err;
  }
}

export async function login(email, password) {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    notify("Bienvenido", "success");
    return userCred.user;
  } catch (err) {
    notify(err.message, "error");
    throw err;
  }
}

export async function logout() {
  await signOut(auth);
}
