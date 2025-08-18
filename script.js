// script.js — Versão SEM Firebase e SEM banco de dados.
// Mantém a UI funcionando (navegação, busca, documentação local) apenas no navegador.

const $ = (id) => document.getElementById(id);
const showMsg = (t) => {
  const box = $("messageBox"); if (!box) return;
  box.textContent = t; box.style.display = "block"; box.style.opacity = 1;
  setTimeout(() => { box.style.opacity = 0; setTimeout(() => { box.style.display = "none"; }, 400); }, 2500);
};

// ---- Estado em memória (sem backend) ----
let docs = [];                 // páginas de documentação (cada item contém URL local do PDF)
let selectedDocFile = null;    // arquivo PDF selecionado

const wikiData = {
  pages: [
    { id: "home",          title: "Página Inicial",  content: "Bem-vindo à wiki",           keywords: ["início","home","principal"],         type: "page" },
    { id: "documentation", title: "Documentação",    content: "Documentação completa",      keywords: ["docs","documentação","manual","guia"], type: "page" },
    { id: "tutorials",     title: "Tutoriais",       content: "Tutoriais passo a passo",    keywords: ["tutorial","aprender","passo","guia"], type: "page" },
    { id: "faq",           title: "FAQ",             content: "Perguntas frequentes",       keywords: ["faq","perguntas","dúvidas","ajuda"],  type: "page" },
    { id: "resources",     title: "Recursos",        content: "Recursos úteis",             keywords: ["recursos","ferramentas","templates"], type: "page" },
    { id: "pop",           title: "POPs",            content: "Procedimentos Operacionais", keywords: ["pop","procedimentos","padrão","operacional"], type: "page" }
  ],
  faqs: [
    { question: "Como crio uma página?",  answer: "Na aba Documentação, informe título, selecione um PDF e clique em Criar Página." }
  ],
  tutorials: [],
  resources: [],
  pops: [
    // Recursos Humanos
    { codigo: "POP-RH-001", nome: "Procedimento de Admissão de Colaboradores", setor: "rh", dataAtualizacao: "10/07/2025" },
    { codigo: "POP-RH-002", nome: "Processo de Avaliação de Desempenho", setor: "rh", dataAtualizacao: "25/06/2025" },
    { codigo: "POP-RH-003", nome: "Gestão de Férias e Licenças", setor: "rh", dataAtualizacao: "15/05/2025" },
    // Tecnologia da Informação
    { codigo: "POP-TI-001", nome: "Backup e Recuperação de Dados", setor: "ti", dataAtualizacao: "02/08/2025" },
    { codigo: "POP-TI-002", nome: "Configuração de Novas Estações de Trabalho", setor: "ti", dataAtualizacao: "20/07/2025" },
    { codigo: "POP-TI-003", nome: "Gerenciamento de Incidentes de Segurança", setor: "ti", dataAtualizacao: "18/06/2025" },
    // Financeiro
    { codigo: "POP-FIN-001", nome: "Processo de Contas a Pagar", setor: "financeiro", dataAtualizacao: "05/08/2025" },
    { codigo: "POP-FIN-002", nome: "Conciliação Bancária", setor: "financeiro", dataAtualizacao: "28/07/2025" },
    { codigo: "POP-FIN-003", nome: "Elaboração de Relatórios Financeiros", setor: "financeiro", dataAtualizacao: "12/06/2025" }
  ]
};

// ---- Navegação ----
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  const el = document.querySelector(`#page-${pageId}`); if (el) el.style.display = "block";
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  const link = document.querySelector(`.nav-link[onclick="showPage('${pageId}')"]`); if (link) link.classList.add("active");

  if (pageId === "documentation") renderDocs();
  if (pageId === "faq") renderFAQs();
  if (pageId === "pop") initPOPPage();
}

function renderFAQs() {
  const list = $("faqList"); if (!list) return;
  list.innerHTML = "";
  wikiData.faqs.forEach(f => {
    const wrap = document.createElement("div");
    wrap.className = "faq-item";
    wrap.innerHTML = `<h4>${f.question}</h4><div class="faq-answer"><p>${f.answer}</p></div>`;
    const h = wrap.querySelector("h4");
    const a = wrap.querySelector(".faq-answer");
    h.addEventListener("click", ()=> a.style.display = (a.style.display==="none"?"block":"none"));
    list.appendChild(wrap);
  });
}

// ---- Busca ----
function performSearch() {
  const input = $("searchInput"); if (!input) return;
  const term = input.value.toLowerCase();
  const results = [
    ...wikiData.pages,
    ...docs,
    ...wikiData.faqs
  ].filter(item =>
    item.title?.toLowerCase().includes(term) ||
    item.question?.toLowerCase().includes(term) ||
    (item.description && item.description.toLowerCase().includes(term)) ||
    (item.content && item.content.toLowerCase().includes(term))
  );

  const list = $("searchResultsList"), title = $("searchResultsTitle");
  if (title) title.textContent = `Resultados para "${input.value}"`;
  if (list) {
    list.innerHTML = "";
    results.forEach(r => {
      const div = document.createElement("div");
      div.className = "search-result-full-item";
      div.innerHTML = `<h4>${r.title || r.question}</h4><p>${r.description || r.content || ""}</p>`;
      div.addEventListener("click", () => {
        if (r.type === "page") showPage(r.id);
        if (r.type === "document") openPDF(r.pdfUrl, r.title);
      });
      list.appendChild(div);
    });
  }
  showPage("search-results");
}

// ---- Documentação (local-only) ----
function triggerDocUpload() { $("docPDFInput")?.click(); }

document.addEventListener("change", (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLInputElement)) return;
  if (t.id !== "docPDFInput") return;
  selectedDocFile = t.files?.[0] || null;
  const span = $("docSelectedName");
  if (span) span.textContent = selectedDocFile ? selectedDocFile.name : "Nenhum arquivo selecionado";
});

function createDocFromForm() {
  const title = $("docTitleInput")?.value.trim();
  const description = $("docDescInput")?.value.trim();
  const file = selectedDocFile;
  if (!title || !file) { showMsg("Informe o título e selecione um PDF."); return; }

  const url = URL.createObjectURL(file); // sem persistência (memória)
  const item = {
    id: (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now())),
    title, description,
    pdfUrl: url,
    type: "document",
    createdAt: new Date().toISOString()
  };
  docs.unshift(item);

  if ($("docTitleInput")) $("docTitleInput").value = "";
  if ($("docDescInput"))  $("docDescInput").value  = "";
  if ($("docPDFInput"))   $("docPDFInput").value   = "";
  const span = $("docSelectedName"); if (span) span.textContent = "Nenhum arquivo selecionado";
  selectedDocFile = null;

  renderDocs();
  showMsg("Página criada localmente (sem banco de dados).");
}

function renderDocs() {
  const list = $("docsList"); if (!list) return;
  list.innerHTML = "";
  const loading = $("loadingDocs");
  if (docs.length === 0) { if (loading) loading.style.display = "block"; return; }
  if (loading) loading.style.display = "none";

  docs.forEach(d => {
    const item = document.createElement("div");
    item.className = "attachment-item";
    item.innerHTML = `
      <div class="attachment-info">
        <div class="attachment-icon">PDF</div>
        <div class="attachment-details">
          <h4>${d.title}</h4>
          <p>${d.description || "Sem descrição"}</p>
        </div>
      </div>
      <div class="attachment-actions">
        <a class="btn btn-secondary" href="${d.pdfUrl}" download>Download</a>
        <button class="btn btn-primary">Ler</button>
      </div>`;
    item.querySelector(".btn.btn-primary")?.addEventListener("click", () => openPDF(d.pdfUrl, d.title));
    list.appendChild(item);
  });
}

// ---- PDF Modal ----
function openPDF(url, title) {
  const t = $("pdfTitle"); if (t) t.textContent = title || "PDF";
  const v = $("pdfViewer"); if (v) v.src = url;
  const m = $("pdfModal");  if (m) m.style.display = "flex";
}
function closePDF() {
  const m = $("pdfModal");  if (m) m.style.display = "none";
  const v = $("pdfViewer"); if (v) v.src = "";
}

// ---- Inicialização ----
document.addEventListener("DOMContentLoaded", () => {
  // Busca com Enter
  $("searchInput")?.addEventListener("keydown", (e) => { if (e.key === "Enter") performSearch(); });
  
  // Busca POP com Enter
  $("popSearchInput")?.addEventListener("keydown", (e) => { if (e.key === "Enter") searchPOPs(); });

  // Click-outside para dropdown de busca (se houver)
  document.addEventListener("click", (ev) => {
    const container = document.querySelector(".search-container");
    const dropdown  = $("searchResults");
    if (container && dropdown && !container.contains(ev.target)) {
      dropdown.style.display = "none";
    }
  });

  // Página inicial
  showPage("home");
});

// ---- Expor funções para o HTML inline (onclick) ----
window.showPage = showPage;
window.performSearch = performSearch;
window.triggerDocUpload = triggerDocUpload;
window.createDocFromForm = createDocFromForm;
window.openPDF = openPDF;
window.closePDF = closePDF;

// ---- Funções POP ----
function initPOPPage() {
  // Inicializar página POP - mostrar todos os setores por padrão
  filterPOPs('todos');
}

function filterPOPs(setor) {
  const sections = document.querySelectorAll('.pop-section');
  const buttons = document.querySelectorAll('.filter-btn');
  const searchResults = $('popSearchResults');
  
  // Ocultar resultados de busca
  if (searchResults) searchResults.style.display = 'none';
  
  // Atualizar botões ativos
  buttons.forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.querySelector(`.filter-btn[onclick="filterPOPs('${setor}')"]`);
  if (activeBtn) activeBtn.classList.add('active');
  
  // Mostrar/ocultar seções
  sections.forEach(section => {
    if (setor === 'todos') {
      section.style.display = 'block';
    } else {
      section.style.display = section.dataset.setor === setor ? 'block' : 'none';
    }
  });
}

function searchPOPs() {
  const input = $('popSearchInput');
  if (!input) return;
  
  const term = input.value.toLowerCase().trim();
  if (!term) {
    showMsg('Digite um termo para buscar.');
    return;
  }
  
  const results = wikiData.pops.filter(pop => 
    pop.codigo.toLowerCase().includes(term) || 
    pop.nome.toLowerCase().includes(term)
  );
  
  const resultsContainer = $('popSearchResults');
  const resultsList = $('popSearchResultsList');
  
  if (!resultsContainer || !resultsList) return;
  
  // Ocultar seções de setores
  document.querySelectorAll('.pop-section').forEach(section => {
    section.style.display = 'none';
  });
  
  // Mostrar resultados
  resultsContainer.style.display = 'block';
  resultsList.innerHTML = '';
  
  if (results.length === 0) {
    resultsList.innerHTML = '<p>Nenhum POP encontrado para o termo pesquisado.</p>';
    return;
  }
  
  results.forEach(pop => {
    const item = document.createElement('div');
    item.className = 'search-result-item';
    item.innerHTML = `
      <h4>${pop.codigo}</h4>
      <p>${pop.nome}</p>
      <small>Última atualização: ${pop.dataAtualizacao}</small>
      <div class="search-result-actions">
        <button class="btn btn-secondary btn-small" onclick="viewPOP('${pop.codigo}')">Ver</button>
        <button class="btn btn-primary btn-small" onclick="downloadPOP('${pop.codigo}')">Baixar</button>
      </div>
    `;
    resultsList.appendChild(item);
  });
}

function downloadModelo() {
  // Simular download do modelo de POP
  showMsg('Download do modelo de POP iniciado. (Simulação - arquivo não disponível nesta versão demo)');
}

function viewPOP(codigo) {
  // Simular visualização do POP
  showMsg(`Abrindo visualização do ${codigo}. (Simulação - arquivo não disponível nesta versão demo)`);
}

function downloadPOP(codigo) {
  // Simular download do POP
  showMsg(`Download do ${codigo} iniciado. (Simulação - arquivo não disponível nesta versão demo)`);
}

// Expor funções POP para o HTML
window.initPOPPage = initPOPPage;
window.filterPOPs = filterPOPs;
window.searchPOPs = searchPOPs;
window.downloadModelo = downloadModelo;
window.viewPOP = viewPOP;
window.downloadPOP = downloadPOP;
```