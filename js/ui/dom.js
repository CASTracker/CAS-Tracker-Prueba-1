// js/ui/dom.js
export function qs(selector, scope = document) { return scope.querySelector(selector); }
export function qsa(selector, scope = document) { return Array.from(scope.querySelectorAll(selector)); }
export function create(tag, props = {}) {
  const el = document.createElement(tag);
  Object.entries(props).forEach(([k,v]) => {
    if (k === "text") el.textContent = v;
    else if (k === "html") el.innerHTML = v;
    else el.setAttribute(k, v);
  });
  return el;
}
