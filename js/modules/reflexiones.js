// js/modules/reflexiones.js
import { qs, create } from "../ui/dom.js";
import { notify } from "../ui/notifications.js";
import { pushReflexiones } from "./state.js";

export function setupReflexionesUI(state, uid) {
  const form = qs("#formReflexion");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const titulo = qs("#tituloReflexion").value.trim();
      const texto = qs("#textoReflexion").value.trim();
      if (!titulo || !texto) {
        notify("Completa título y texto", "error");
        return;
      }
      const fecha = new Date().toLocaleDateString("es-ES");
      state.reflexiones.push({ id: Date.now(), titulo, texto, fecha });
      localStorage.setItem("reflexionesCAS", JSON.stringify(state.reflexiones));
      renderReflexiones(state, uid);
      if (uid) pushReflexiones(uid, state.reflexiones).catch(()=>{});
      form.reset();
      notify("Reflexión guardada", "success");
    });
  }

  const exportAllBtn = qs("#exportAllWord");
  if (exportAllBtn) exportAllBtn.addEventListener("click", () => {
    exportAllReflexiones();
  });

  // word counter handled in app.js (listener)
}

export function renderReflexiones(state = { reflexiones: [] }, uid) {
  const cont = qs("#listaReflexiones");
  if (!cont) return;
  cont.innerHTML = "";
  state.reflexiones.slice().reverse().forEach(ref => {
    const div = create("div");
    div.className = "reflexion";
    div.innerHTML = `
      <h3>${ref.titulo}</h3>
      <small>${ref.fecha}</small>
      <p>${ref.texto}</p>
      <div class="row">
        <button class="btn small outline" data-action="edit" data-id="${ref.id}">✏️ Editar</button>
        <button class="btn small" data-action="delete" data-id="${ref.id}">🗑️ Eliminar</button>
        <button class="btn small outline" data-action="export" data-id="${ref.id}">📄 Exportar a Word</button>
      </div>
    `;
    cont.appendChild(div);
  });

  // attach listeners
  cont.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const action = btn.dataset.action;
      if (action === "delete") {
        if (!confirm("¿Seguro que quieres eliminar esta reflexión?")) return;
        state.reflexiones = state.reflexiones.filter(r => r.id !== id);
        localStorage.setItem("reflexionesCAS", JSON.stringify(state.reflexiones));
        if (uid) pushReflexiones(uid, state.reflexiones).catch(()=>{});
        renderReflexiones(state, uid);
        notify("Reflexión eliminada", "info");
      } else if (action === "edit") {
        const r = state.reflexiones.find(x => x.id === id);
        if (!r) return;
        qs("#tituloReflexion").value = r.titulo;
        qs("#textoReflexion").value = r.texto;
        // remove old
        state.reflexiones = state.reflexiones.filter(x => x.id !== id);
        localStorage.setItem("reflexionesCAS", JSON.stringify(state.reflexiones));
        renderReflexiones(state, uid);
        notify("Edita y guarda para actualizar", "info");
      } else if (action === "export") {
        const r = state.reflexiones.find(x => x.id === id);
        if (r) exportSingleReflexion(r);
      }
    });
  });

  // preview on menu page (if exists)
  const preview = qs("#previewReflexiones");
  if (preview) {
    preview.innerHTML = "";
    state.reflexiones.slice(-2).reverse().forEach(ref => {
      const v = create("div");
      v.className = "reflexion";
      v.innerHTML = `<strong>${ref.titulo}</strong><br><small>${ref.fecha}</small><p>${ref.texto.substring(0,100)}...</p>`;
      preview.appendChild(v);
    });
  }
}

function exportSingleReflexion(ref) {
  const { titulo, texto, fecha } = ref;
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = window.docx;
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: titulo, heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),
        new Paragraph({ text: `Fecha: ${fecha}`, spacing: { after: 200 } }),
        new Paragraph({ children: [ new TextRun({ text: texto, size: 24 }) ], spacing: { line: 360 } })
      ]
    }]
  });
  Packer.toBlob(doc).then(blob => saveAs(blob, `${titulo}.docx`));
}

export async function exportAllReflexiones() {
  const reflexiones = JSON.parse(localStorage.getItem("reflexionesCAS") || "[]");
  if (reflexiones.length === 0) { notify("No hay reflexiones para exportar", "error"); return; }
  const { Document, Packer, Paragraph, TextRun } = window.docx;
  const doc = new Document();
  reflexiones.forEach(r => {
    doc.addSection({ children: [
      new Paragraph({ children: [ new TextRun({ text: r.titulo, bold: true, size: 28 }) ], spacing: { after: 200 } }),
      new Paragraph({ children: [ new TextRun({ text: r.texto, size: 24 }) ], spacing: { after: 300 } })
    ]});
  });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, "Reflexiones.docx");
  notify("Exportado a Reflexiones.docx", "success");
}
