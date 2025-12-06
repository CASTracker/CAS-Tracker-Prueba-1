// js/app.js
import { initAuthListeners, register, login, logout } from "./firebase/auth.js";
import { loadFromLocal, saveToLocal, subscribeCloud, pushAllToCloud } from "./modules/state.js";
import * as actividadesModule from "./modules/actividades.js";
import * as reflexionesModule from "./modules/reflexiones.js";
import * as horarioModule from "./modules/horario.js";
import { setupActividadesUI, renderActividades, updateTotales } from "./modules/actividades.js";
import { setupReflexionesUI, renderReflexiones } from "./modules/reflexiones.js";
import { setupHorario, cargarHorario } from "./modules/horario.js";
import { notify } from "./ui/notifications.js";

let currentUID = null;
let state = loadFromLocal();

// when auth state changes
initAuthListeners(async (user) => {
  if (user) {
    currentUID = user.uid;
    // subscribe to cloud changes
    const unsub = subscribeCloud(currentUID, (cloudData) => {
      // merge cloud data with local (cloud wins but keep local items that cloud doesn't have)
      state.actividades = cloudData.actividades || state.actividades || [];
      state.reflexiones = cloudData.reflexiones || state.reflexiones || [];
      state.horario = cloudData.horario || state.horario || [];
      saveToLocal(state);
      renderForPage();
    });
    // expose unsubscribe maybe later
    window._unsubFirestore = unsub;
    // render now
    renderForPage();
  } else {
    currentUID = null;
    // if we are not on auth page, redirect to login
    const path = window.location.pathname;
    if (!path.endsWith("index.html") && !path.endsWith("/")) window.location.href = "index.html";
  }
});

// Page-specific initialization
function renderForPage() {
  // actividades page
  if (document.querySelector("#formActividad")) {
    setupActividadesUI(state, currentUID);
    renderActividades(state, currentUID);
    updateTotales(state);
  }

  // reflexiones page
  if (document.querySelector("#formReflexion")) {
    setupReflexionesUI(state, currentUID);
    renderReflexiones(state, currentUID);
    initWordCounter();
  }

  // menu page preview totals
  if (document.querySelector(".totales")) {
    // ensure totals display
    updateTotales(state);
    renderReflexiones(state, currentUID);
  }

  // horario page
  if (document.querySelector("#tablaHorario")) {
    setupHorario(state, currentUID);
    cargarHorario(state);
  }

  // auth page - login/register
  setupAuthForms();

  // common logout & sync buttons
  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await logout();
    window.location.href = "index.html";
  });

  document.getElementById("btnSync")?.addEventListener("click", async () => {
    await pushAllToCloud(currentUID, state);
  });
}

// Save local changes periodically (throttle)
setInterval(() => {
  saveToLocal(state);
}, 2000);

// word counter
function contarPalabras(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}
function initWordCounter() {
  const textarea = document.getElementById("textoReflexion");
  const counter = document.getElementById("wordCount");
  if (!textarea || !counter) return;
  const actualizar = () => {
    const n = contarPalabras(textarea.value);
    counter.textContent = `${n} palabra${n === 1 ? "" : "s"}`;
    counter.classList.toggle("warning", n >= 350 && n <= 400);
    counter.classList.toggle("exceeded", n > 400);
  };
  ["input", "keyup", "change", "paste"].forEach(evt => textarea.addEventListener(evt, actualizar));
  actualizar();
}

// auth forms wiring
function setupAuthForms() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;
      try {
        await login(email, password);
        window.location.href = "menu.html";
      } catch (err) { /* handled by auth module */ }
    });
  }
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("registerEmail").value;
      const password = document.getElementById("registerPassword").value;
      try {
        await register(email, password);
        window.location.href = "menu.html";
      } catch (err) {}
    });
  }
}

// initial render for static display when not authed
renderForPage();

// register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then(() => {
    console.log('Service Worker registrado');
  }).catch(err => console.warn('SW error', err));
}
