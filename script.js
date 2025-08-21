// Talentos Wiki - script.js (sem Firebase/BD)

// Helper
const $ = (id) => document.getElementById(id);

// Mensagens
function showMessage(message) {
  const box = $("messageBox");
  if (!box) return;
  box.textContent = message;
  box.style.display = "block";
  box.style.opacity = 1;
  setTimeout(() => {
    box.style.opacity = 0;
    setTimeout(() => (box.style.display = "none"), 500);
  }, 2000);
}

// Navegação
function showPage(pageId) {
  document.querySelectorAll(".page").forEach((el) => (el.style.display = "none"));
  const target = document.getElementById(`page-${pageId}`);
  if (target) target.style.display = "block";

  document.querySelectorAll(".nav-link").forEach((a) => a.classList.remove("active"));
  const link = document.querySelector(`.nav-link[onclick="showPage('${pageId}')"]`);
  if (link) link.classList.add("active");
}

function performSearch() {
  const input = $("searchInput");
  if (!input) return;
  const term = input.value.trim().toLowerCase();
  if (!term) return;
  const page = document.getElementById("page-search-results");
  if (page) showPage("search-results");
}

// Dados locais
const wikiData = { documents: [], tutorials: [], faqs: [], resources: [] };

// ---------- Documentação ----------
function triggerDocUpload() { $("docPDFInput")?.click(); }
window.triggerDocUpload = triggerDocUpload;

async function openDescriptionModal() {
  const modal = $("descriptionModal");
  const input = $("editDescriptionInput");
  return new Promise((resolve) => {
    if (!modal || !input) return resolve("");
    modal.style.display = "flex";
    input.value = ""; input.focus();

    const onSave = () => { cleanup(); modal.style.display = "none"; resolve(input.value.trim()); };
    const onClose = () => { cleanup(); modal.style.display = "none"; resolve(""); };
    const onKey = (e) => { if (e.key === "Enter") { e.preventDefault(); onSave(); } if (e.key === "Escape") onClose(); };
    const cleanup = () => {
      modal.querySelector(".btn-primary")?.removeEventListener("click", onSave);
      modal.querySelector(".modal-close")?.removeEventListener("click", onClose);
      document.removeEventListener("keydown", onKey);
    };

    modal.querySelector(".btn-primary")?.addEventListener("click", onSave);
    modal.querySelector(".modal-close")?.addEventListener("click", onClose);
    document.addEventListener("keydown", onKey);
  });
}

(function bindDocInput() {
  const input = $("docPDFInput");
  if (!input) return;
  input.addEventListener("change", async (ev) => {
    const file = ev.target.files?.[0];
    if (!file || file.type !== "application/pdf") { showMessage("Selecione um PDF válido."); return; }
    const desc = await openDescriptionModal();
    const title = file.name.replace(/\.pdf$/i, "").replace(/[_-]/g, " ");
    const url = URL.createObjectURL(file);
    wikiData.documents.unshift({
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      title, description: desc || "", fileUrl: url
    });
    renderDocuments(); showMessage("Documento adicionado (local).");
    input.value = "";
  });
})();

function renderDocuments() {
  const list = $("docsList"); if (!list) return;
  list.innerHTML = "";
  if (wikiData.documents.length === 0) {
    const p = document.createElement("p"); p.id = "loadingDocs"; p.textContent = "Nenhum documento encontrado."; list.appendChild(p); return;
  }
  wikiData.documents.forEach((doc) => {
    const item = document.createElement("div");
    item.className = "attachment-item";
    item.innerHTML = `
      <div class="attachment-info">
        <div class="attachment-icon">PDF</div>
        <div class="attachment-details">
          <h4>${doc.title}</h4>
          <p>${doc.description || "Sem descrição"}</p>
        </div>
      </div>
      <div class="attachment-actions">
        <a class="btn btn-secondary" href="${doc.fileUrl}" download="${doc.title}.pdf">Download</a>
        <button class="btn btn-primary">Ler</button>
      </div>`;
    item.querySelector(".btn.btn-primary")?.addEventListener("click", () =>
      openPDF(doc.fileUrl, doc.title, doc.description)
    );
    list.appendChild(item);
  });
}

// ---------- Tutoriais ----------
let currentTutorialFile = null;

function triggerTutorialFileUpload() { $("tutorialPDFInput")?.click(); }
window.triggerTutorialFileUpload = triggerTutorialFileUpload;

(function bindTutorialInput() {
  const el = $("tutorialPDFInput"); if (!el) return;
  el.addEventListener("change", (ev) => {
    currentTutorialFile = ev.target.files?.[0] || null;
    const span = $("tutorialFileName");
    if (span) span.textContent = currentTutorialFile ? currentTutorialFile.name : "Nenhum arquivo selecionado";
  });
})();

function addTutorial() {
  const t = $("tutorialTitleInput")?.value.trim();
  const d = $("tutorialDescriptionInput")?.value.trim();
  if (!t) { showMessage("Informe o título do tutorial."); return; }
  if (!currentTutorialFile) { showMessage("Anexe um arquivo PDF."); return; }

  const url = URL.createObjectURL(currentTutorialFile);
  wikiData.tutorials.unshift({
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title: t, description: d || "", fileUrl: url
  });

  if ($("tutorialTitleInput")) $("tutorialTitleInput").value = "";
  if ($("tutorialDescriptionInput")) $("tutorialDescriptionInput").value = "";
  if ($("tutorialPDFInput")) $("tutorialPDFInput").value = "";
  const s = $("tutorialFileName"); if (s) s.textContent = "Nenhum arquivo selecionado";
  currentTutorialFile = null;

  renderTutorials(); showMessage("Tutorial adicionado.");
}
window.addTutorial = addTutorial;

function renderTutorials() {
  const list = $("tutorialList"); if (!list) return;
  list.innerHTML = "";
  if (wikiData.tutorials.length === 0) {
    const p = document.createElement("p"); p.className = "muted"; p.textContent = "Nenhum tutorial cadastrado."; list.appendChild(p); return;
  }
  wikiData.tutorials.forEach((tutorial) => {
    const item = document.createElement("div");
    item.className = "tutorial-item";
    const actions = tutorial.fileUrl ? `
      <a class="btn btn-secondary" href="${tutorial.fileUrl}" download="${tutorial.title}.pdf" style="margin-right:.5rem">Download</a>
      <button class="btn btn-primary">Ver</button>` : "";
    item.innerHTML = `
      <h4>${tutorial.title}</h4>
      <div class="tutorial-content">
        <p>${tutorial.description || "Sem descrição"}</p>
        ${actions}
      </div>`;
    if (tutorial.fileUrl) {
      item.querySelector(".btn.btn-primary")?.addEventListener("click", () =>
        openPDF(tutorial.fileUrl, tutorial.title, tutorial.description)
      );
    }
    list.appendChild(item);
  });
}

// ---------- FAQ / Recursos (locais) ----------
function addFAQ() {
  const q = $("faqQuestionInput")?.value.trim();
  const a = $("faqAnswerInput")?.value.trim();
  if (!q || !a) { showMessage("Informe pergunta e resposta."); return; }
  wikiData.faqs.unshift({ question: q, answer: a });
  renderFAQs(); $("faqQuestionInput").value = ""; $("faqAnswerInput").value = "";
}
window.addFAQ = addFAQ;

function renderFAQs() {
  const list = $("faqList"); if (!list) return;
  list.innerHTML = "";
  if (wikiData.faqs.length === 0) { list.innerHTML = `<p class="muted">Nenhuma pergunta cadastrada.</p>`; return; }
  wikiData.faqs.forEach((f) => {
    const div = document.createElement("div");
    div.className = "faq-item";
    div.innerHTML = `<h4>${f.question}</h4><div class="faq-answer"><p>${f.answer}</p></div>`;
    const head = div.querySelector("h4");
    const ans = div.querySelector(".faq-answer");
    head.addEventListener("click", () => { ans.style.display = ans.style.display === "none" ? "block" : "none"; });
    list.appendChild(div);
  });
}

function addResource() {
  const t = $("resourceTitleInput")?.value.trim();
  const d = $("resourceDescriptionInput")?.value.trim();
  const l = $("resourceLinkInput")?.value.trim();
  if (!t || !l) { showMessage("Informe título e link do recurso."); return; }
  wikiData.resources.unshift({ title: t, description: d || "", link: l });
  renderResources();
  $("resourceTitleInput").value = ""; $("resourceDescriptionInput").value = ""; $("resourceLinkInput").value = "";
}
window.addResource = addResource;

function renderResources() {
  const list = $("resourceList"); if (!list) return;
  list.innerHTML = "";
  if (wikiData.resources.length === 0) { list.innerHTML = `<p class="muted">Nenhum recurso cadastrado.</p>`; return; }
  wikiData.resources.forEach((r) => {
    const item = document.createElement("div");
    item.className = "resource-item";
    item.innerHTML = `<h4>${r.title}</h4><p>${r.description || ""}</p><a class="btn btn-secondary" href="${r.link}" target="_blank" rel="noopener">Abrir</a>`;
    list.appendChild(item);
  });
}

// ---------- Modal de PDF: título, descrição e toggle ----------
function openPDF(url, title, description = "") {
  const t = $("pdfTitle"); if (t) t.textContent = title || "Visualizar PDF";

  const d = $("pdfDescription");
  if (d) { d.textContent = description || ""; d.style.display = "none"; }

  const toggle = $("toggleDescBtn");
  if (toggle) {
    toggle.style.display = description ? "inline-block" : "none";
    toggle.textContent = "Ver explicação";
    toggle.setAttribute("aria-expanded", "false");
  }

  const v = $("pdfViewer"); if (v) v.src = url;

  const dl = $("pdfDownloadBtn");
  if (dl) { dl.href = url; dl.download = (title ? `${title}.pdf` : "documento.pdf"); }

  const m = $("pdfModal"); if (m) m.style.display = "flex";
}
function closePDF() {
  const m = $("pdfModal"); if (m) m.style.display = "none";
  const v = $("pdfViewer"); if (v) v.src = "";
}
function togglePdfDescription() {
  const d = $("pdfDescription");
  const btn = $("toggleDescBtn");
  if (!d || !btn) return;
  const showing = d.style.display === "block";
  d.style.display = showing ? "none" : "block";
  btn.textContent = showing ? "Ver explicação" : "Ocultar explicação";
  btn.setAttribute("aria-expanded", String(!showing));
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  showPage("home");
  renderDocuments();
  renderTutorials();
  renderFAQs();
  renderResources();
});

// Expor para onclick do HTML
window.showPage = showPage;
window.performSearch = performSearch;
window.openPDF = openPDF;
window.closePDF = closePDF;
window.togglePdfDescription = togglePdfDescription;
