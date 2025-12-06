// js/ui/notifications.js
export function notify(message = "", type = "info", timeout = 3000) {
  let container = document.querySelector(".toasts");
  if (!container) {
    container = document.createElement("div");
    container.className = "toasts";
    document.body.appendChild(container);
  }
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.textContent = message;
  container.appendChild(t);
  setTimeout(() => {
    t.style.opacity = 0;
    setTimeout(() => t.remove(), 300);
  }, timeout);
}
