import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, query, orderBy, getDocs, serverTimestamp, where, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const $ = (id) => document.getElementById(id);
const showMsg = (t) => {
    const box = $("messageBox"); if (!box) return;
    box.textContent = t; box.style.display = "block"; box.style.opacity = 1;
    setTimeout(() => { box.style.opacity = 0; setTimeout(() => { box.style.display = "none"; }, 400); }, 2500);
};

const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let db, auth, userId;

let docs = [];
let selectedDocFile = null;

let selectedPopFile = null;

let wikiData = {
    pages: [
        { id: "home", title: "Página Inicial", content: "Bem-vindo à wiki", keywords: ["início", "home", "principal"], type: "page" },
        { id: "documentation", title: "Documentação", content: "Documentação completa", keywords: ["docs", "documentação", "manual", "guia"], type: "page" },
        { id: "tutorials", title: "Tutoriais", content: "Tutoriais passo a passo", keywords: ["tutorial", "aprender", "passo", "guia"], type: "page" },
        { id: "faq", title: "FAQ", content: "Perguntas frequentes", keywords: ["faq", "perguntas", "dúvidas", "ajuda"], type: "page" },
        { id: "resources", title: "Recursos", content: "Recursos úteis", keywords: ["recursos", "ferramentas", "templates"], type: "page" },
        { id: "pop", title: "POPs", content: "Procedimentos Operacionais", keywords: ["pop", "procedimentos", "padrão", "operacional"], type: "page" }
    ],
    faqs: [
        { question: "Como crio uma página?", answer: "Na aba Documentação, informe título, selecione um PDF e clique em Criar Página." }
    ],
    tutorials: [],
    resources: [],
    pops: [
        { codigo: "POP-RH-001", nome: "Procedimento de Admissão de Colaboradores", setor: "rh", dataAtualizacao: "10/07/2025", fileUrl: null },
        { codigo: "POP-RH-002", nome: "Processo de Avaliação de Desempenho", setor: "rh", dataAtualizacao: "25/06/2025", fileUrl: null },
        { codigo: "POP-RH-003", nome: "Gestão de Férias e Licenças", setor: "rh", dataAtualizacao: "15/05/2025", fileUrl: null },
        { codigo: "POP-TI-001", nome: "Backup e Recuperação de Dados", setor: "ti", dataAtualizacao: "02/08/2025", fileUrl: null },
        { codigo: "POP-TI-002", nome: "Configuração de Novas Estações de Trabalho", setor: "ti", dataAtualizacao: "20/07/2025", fileUrl: null },
        { codigo: "POP-TI-003", nome: "Gerenciamento de Incidentes de Segurança", setor: "ti", dataAtualizacao: "18/06/2025", fileUrl: null },
        { codigo: "POP-FIN-001", nome: "Processo de Contas a Pagar", setor: "financeiro", dataAtualizacao: "05/08/2025", fileUrl: null },
        { codigo: "POP-FIN-002", nome: "Conciliação Bancária", setor: "financeiro", dataAtualizacao: "28/07/2025", fileUrl: null },
        { codigo: "POP-FIN-003", nome: "Elaboração de Relatórios Financeiros", setor: "financeiro", dataAtualizacao: "12/06/2025", fileUrl: null }
    ]
};

const popSectors = {
    'todos': 'Todos',
    'rh': 'Recursos Humanos',
    'ti': 'Tecnologia da Informação',
    'financeiro': 'Financeiro'
};

let editingPop = null;

// Initialize Firebase and set up auth state listener
async function initializeFirebase() {
    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }

        onAuthStateChanged(auth, (user) => {
            if (user) {
                userId = user.uid;
                console.log("Usuário autenticado:", userId);
            } else {
                console.log("Nenhum usuário autenticado.");
            }
        });
    } catch (error) {
        console.error("Erro ao inicializar Firebase:", error);
    }
}

// ---- Firestore functions for description versioning ----
async function saveDescription() {
    if (!userId) {
        showMsg("Autenticação pendente. Tente novamente em instantes.");
        return;
    }

    const description = $('mainDescription').value;
    if (!description.trim()) {
        showMsg("A descrição não pode estar vazia.");
        return;
    }

    try {
        // Save the new version
        const versionRef = doc(collection(db, `artifacts/${appId}/users/${userId}/descriptions`));
        await setDoc(versionRef, {
            content: description,
            timestamp: serverTimestamp()
        });
        showMsg("Descrição salva com sucesso!");
        loadDescription(); // Load the new version
    } catch (e) {
        console.error("Erro ao salvar a descrição: ", e);
        showMsg("Erro ao salvar a descrição.");
    }
}

async function loadDescription() {
    if (!userId) {
        setTimeout(loadDescription, 500);
        return;
    }
    try {
        const q = query(collection(db, `artifacts/${appId}/users/${userId}/descriptions`), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const latestDoc = querySnapshot.docs[0];
            $('mainDescription').value = latestDoc.data().content;
        } else {
            $('mainDescription').value = "Adicione uma descrição para o seu documento aqui.";
        }
    } catch (e) {
        console.error("Erro ao carregar a descrição: ", e);
        showMsg("Erro ao carregar a descrição.");
    }
}

async function showHistory() {
    if (!userId) {
        showMsg("Autenticação pendente. Tente novamente em instantes.");
        return;
    }
    try {
        const historyList = $('historyList');
        const historyView = $('historyView');
        if (!historyList || !historyView) return;

        const q = query(collection(db, `artifacts/${appId}/users/${userId}/descriptions`), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        historyList.innerHTML = '';
        historyView.style.display = 'block';

        if (querySnapshot.empty) {
            historyList.innerHTML = '<p>Nenhum histórico de versão encontrado.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const item = document.createElement('div');
            item.className = 'history-item';
            const date = data.timestamp ? data.timestamp.toDate().toLocaleString() : 'Data desconhecida';
            item.innerHTML = `
                <h4>Versão de ${date}</h4>
                <p>${data.content.substring(0, 150)}...</p>
                <button class="btn btn-secondary btn-small" onclick="restoreVersion('${doc.id}')">Restaurar</button>
            `;
            historyList.appendChild(item);
        });

    } catch (e) {
        console.error("Erro ao mostrar histórico: ", e);
        showMsg("Erro ao carregar o histórico.");
    }
}

async function restoreVersion(docId) {
     if (!userId) {
        showMsg("Autenticação pendente. Tente novamente em instantes.");
        return;
    }
    try {
        const docRef = doc(db, `artifacts/${appId}/users/${userId}/descriptions/${docId}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            $('mainDescription').value = docSnap.data().content;
            showMsg("Versão restaurada com sucesso! Clique em 'Salvar Descrição' para guardar permanentemente.");
            $('historyView').style.display = 'none';
        } else {
            showMsg("Versão não encontrada.");
        }
    } catch (e) {
        console.error("Erro ao restaurar versão: ", e);
        showMsg("Erro ao restaurar a versão.");
    }
}

// ---- Navegação ----
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    const el = document.querySelector(`#page-${pageId}`);
    if (el) el.style.display = "block";
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
    const link = document.querySelector(`.nav-link[onclick="showPage('${pageId}')"]`);
    if (link) link.classList.add("active");

    if (pageId === "documentation") {
        renderDocs();
        loadDescription();
    }
    if (pageId === "tutorials") renderTutorials();
    if (pageId === "resources") renderResources();
    if (pageId === "faq") renderFAQs();
    if (pageId === "pop") initPOPPage();
}

function renderFAQs() {
    const list = $("faqList");
    if (!list) return;
    list.innerHTML = "";
    wikiData.faqs.forEach(f => {
        const wrap = document.createElement("div");
        wrap.className = "faq-item";
        wrap.innerHTML = `<h4>${f.question}</h4><div class="faq-answer"><p>${f.answer}</p></div>`;
        const h = wrap.querySelector("h4");
        const a = wrap.querySelector(".faq-answer");
        h.addEventListener("click", () => a.style.display = (a.style.display === "none" ? "block" : "none"));
        list.appendChild(wrap);
    });
}

// ---- Busca ----
function performSearch() {
    const input = $("searchInput");
    if (!input) return;
    const term = input.value.toLowerCase();
    const results = [
        ...wikiData.pages,
        ...docs,
        ...wikiData.faqs,
        ...wikiData.tutorials,
        ...wikiData.resources
    ].filter(item =>
        item.title?.toLowerCase().includes(term) ||
        item.question?.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.content && item.content.toLowerCase().includes(term))
    );

    const list = $("searchResultsList"),
        title = $("searchResultsTitle");
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
                if (r.type === "tutorial") showPage('tutorials');
                if (r.type === "faq") showPage('faq');
                if (r.type === "resource") showPage('resources');
            });
            list.appendChild(div);
        });
    }
    showPage("search-results");
}

// ---- Documentação (local-only) ----
function triggerDocUpload() { $("pdfUploadInput")?.click(); }

document.addEventListener("change", (ev) => {
    const t = ev.target;
    if (!(t instanceof HTMLInputElement)) return;
    if (t.id !== "pdfUploadInput") return;
    selectedDocFile = t.files?.[0] || null;
    if (selectedDocFile) {
        showMsg("Arquivo de documento selecionado: " + selectedDocFile.name);
    }
});

function renderDocs() {
    const list = $("attachmentList");
    if (!list) return;
    list.innerHTML = "";
    if (docs.length === 0) {
        list.innerHTML = '<p id="loadingAttachments">Nenhum documento disponível. Clique em "Upload de Documento" para adicionar um.</p>';
        return;
    }
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
                <a class="btn btn-secondary" href="${d.pdfUrl}" download="${d.title}.pdf">Download</a>
                <button class="btn btn-primary">Ler</button>
            </div>`;
        item.querySelector(".btn.btn-primary")?.addEventListener("click", () => openPDF(d.pdfUrl, d.title));
        list.appendChild(item);
    });
}

// ---- PDF Modal ----
function openPDF(url, title) {
    const t = $("pdfTitle");
    if (t) t.textContent = title || "PDF";
    const v = $("pdfViewer");
    if (v) v.src = url;
    const m = $("pdfModal");
    if (m) m.style.display = "flex";
}

function closePDF() {
    const m = $("pdfModal");
    if (m) m.style.display = "none";
    const v = $("pdfViewer");
    if (v) v.src = "";
}

// ---- Funções para Tutoriais ----
function renderTutorials() {
    const list = $("tutorialList");
    if (!list) return;
    list.innerHTML = "";
    if (wikiData.tutorials.length === 0) {
        list.innerHTML = '<p>Nenhum tutorial disponível.</p>';
        return;
    }
    wikiData.tutorials.forEach(t => {
        const item = document.createElement("div");
        item.className = "tutorial-item";
        item.innerHTML = `
            <h4>${t.title}</h4>
            <div class="tutorial-content"><p>${t.description}</p></div>
        `;
        const h = item.querySelector("h4");
        const c = item.querySelector(".tutorial-content");
        h.addEventListener("click", () => c.style.display = (c.style.display === "none" ? "block" : "none"));
        list.appendChild(item);
    });
}

function addTutorial() {
    const title = $("tutorialTitleInput")?.value.trim();
    const description = $("tutorialDescriptionInput")?.value.trim();
    if (!title || !description) {
        showMsg("Por favor, preencha o título e a descrição do tutorial.");
        return;
    }
    const newTutorial = {
        id: (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now())),
        title,
        description,
        type: "tutorial"
    };
    wikiData.tutorials.unshift(newTutorial);
    $("tutorialTitleInput").value = "";
    $("tutorialDescriptionInput").value = "";
    renderTutorials();
    showMsg("Tutorial adicionado com sucesso!");
}

// ---- Funções para FAQ ----
function addFAQ() {
    const question = $("faqQuestionInput")?.value.trim();
    const answer = $("faqAnswerInput")?.value.trim();
    if (!question || !answer) {
        showMsg("Por favor, preencha a pergunta e a resposta do FAQ.");
        return;
    }
    const newFAQ = {
        id: (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now())),
        question,
        answer,
        type: "faq"
    };
    wikiData.faqs.unshift(newFAQ);
    $("faqQuestionInput").value = "";
    $("faqAnswerInput").value = "";
    renderFAQs();
    showMsg("FAQ adicionado com sucesso!");
}

// ---- Funções para Recursos ----
function renderResources() {
    const list = $("resourceList");
    if (!list) return;
    list.innerHTML = "";
    if (wikiData.resources.length === 0) {
        list.innerHTML = '<p>Nenhum recurso disponível.</p>';
        return;
    }
    wikiData.resources.forEach(r => {
        const item = document.createElement("div");
        item.className = "resource-item";
        item.innerHTML = `
            <div>
                <h4>${r.title}</h4>
                <p>${r.description}</p>
            </div>
            <a href="${r.link}" target="_blank" class="btn btn-primary">Acessar</a>
        `;
        list.appendChild(item);
    });
}

function addResource() {
    const title = $("resourceTitleInput")?.value.trim();
    const description = $("resourceDescriptionInput")?.value.trim();
    const link = $("resourceLinkInput")?.value.trim();
    if (!title || !description || !link) {
        showMsg("Por favor, preencha todos os campos do recurso.");
        return;
    }
    const newResource = {
        id: (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now())),
        title,
        description,
        link,
        type: "resource"
    };
    wikiData.resources.unshift(newResource);
    $("resourceTitleInput").value = "";
    $("resourceDescriptionInput").value = "";
    $("resourceLinkInput").value = "";
    renderResources();
    showMsg("Recurso adicionado com sucesso!");
}

// ---- Funções de Detalhes do Documento (simulação) ----
// Estas funções são apenas simulações, a funcionalidade completa de
// tópicos e comentários requereria um backend e um banco de dados
function addTopic() { showMsg("Adicionar tópico (simulação)."); }
function addComment() { showMsg("Adicionar comentário (simulação)."); }
function showDocDetails() { showMsg("Mostrando detalhes do documento (simulação)."); }
function openDescriptionModal() { showMsg("Abrindo modal de descrição (simulação)."); }
function closeDescriptionModal() { showMsg("Fechando modal de descrição (simulação)."); }

// A função saveDescription e showHistory foram movidas e reescritas para usar o Firebase.
function toggleEditMode() { showMsg("Modo de edição ativado/desativado (simulação)."); }


// ---- Funções POP ----
function initPOPPage() {
    // Esconde a página de gerenciamento ao inicializar a página principal de POPs
    $('managePopPage').style.display = 'none';
    // Mostra o conteúdo principal da página de POPs
    $('mainPopPageContent').style.display = 'block';
    renderPOPFilters();
    renderPOPs();
    filterPOPs('todos');
}

function renderPOPFilters() {
    const filterButtonsContainer = $('filterButtons');
    if (!filterButtonsContainer) return;
    filterButtonsContainer.innerHTML = '';

    const allButton = document.createElement('button');
    allButton.className = 'filter-btn active';
    allButton.textContent = 'Todos';
    allButton.onclick = () => filterPOPs('todos');
    filterButtonsContainer.appendChild(allButton);

    const uniqueSectors = [...new Set(wikiData.pops.map(pop => pop.setor))];
    uniqueSectors.forEach(setor => {
        if (popSectors[setor]) {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.textContent = popSectors[setor];
            btn.onclick = () => filterPOPs(setor);
            filterButtonsContainer.appendChild(btn);
        }
    });

    // Update the selector with new options
    const setorSelect = $('popSetorSelect');
    if (setorSelect) {
        setorSelect.innerHTML = '<option value="">-- Selecione um setor existente --</option>';
        Object.entries(popSectors).forEach(([key, value]) => {
            if (key !== 'todos') {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = value;
                setorSelect.appendChild(option);
            }
        });
    }
}

function renderPOPs() {
    const sectionsContainer = $('popSectionsContainer');
    if (!sectionsContainer) return;

    sectionsContainer.innerHTML = '';
    
    const uniqueSectors = [...new Set(wikiData.pops.map(pop => pop.setor))].sort();

    uniqueSectors.forEach(setor => {
        const section = document.createElement('div');
        section.className = 'pop-section';
        section.dataset.setor = setor;
        section.innerHTML = `
            <h2 class="setor-title">${popSectors[setor] || setor.toUpperCase()}</h2>
            <div class="pop-table-container">
                <table class="pop-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nome do POP</th>
                            <th>Última Atualização</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="pop-table-${setor}"></tbody>
                </table>
            </div>
        `;
        sectionsContainer.appendChild(section);
    });

    const sortedPops = wikiData.pops.sort((a,b) => a.codigo.localeCompare(b.codigo));

    sortedPops.forEach(pop => {
        const tableBody = $(`pop-table-${pop.setor}`);
        if (tableBody) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${pop.codigo}</strong></td>
                <td>${pop.nome}</td>
                <td>${pop.dataAtualizacao}</td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick="viewPOP('${pop.codigo}')">Ver</button>
                    <button class="btn btn-primary btn-small" onclick="downloadPOP('${pop.codigo}')">Baixar</button>
                </td>
            `;
            tableBody.appendChild(row);
        }
    });
}

function renderManagePOPs() {
    const managePopList = $('managePopList');
    if (!managePopList) return;
    managePopList.innerHTML = '';
    
    wikiData.pops.forEach(pop => {
        const item = document.createElement('div');
        item.className = 'manage-pop-item';
        item.innerHTML = `
            <div class="manage-pop-info">
                <h4>${pop.codigo} - ${pop.nome}</h4>
                <small>Setor: ${popSectors[pop.setor] || pop.setor.toUpperCase()}</small>
            </div>
            <div class="manage-pop-actions">
                <button class="btn btn-edit btn-small" onclick="editPOP('${pop.codigo}')">Editar</button>
                <button class="btn btn-secondary btn-small" onclick="removePOP('${pop.codigo}')">Remover</button>
            </div>
        `;
        managePopList.appendChild(item);
    });
}

function filterPOPs(setor) {
    const sections = document.querySelectorAll('.pop-section');
    const buttons = document.querySelectorAll('.filter-btn');
    const searchResults = $('popSearchResults');

    if (searchResults) searchResults.style.display = 'none';

    buttons.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.filter-btn[onclick="filterPOPs('${setor}')"]`);
    if (activeBtn) activeBtn.classList.add('active');

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

    document.querySelectorAll('.pop-section').forEach(section => {
        section.style.display = 'none';
    });

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

function toggleManagePOPs() {
    const managePage = $('managePopPage');
    const mainPopPageContent = $('mainPopPageContent');
    if (!managePage || !mainPopPageContent) return;

    if (managePage.style.display === 'none' || managePage.style.display === '') {
        mainPopPageContent.style.display = 'none';
        managePage.style.display = 'block';
        renderManagePOPs();
    } else {
        managePage.style.display = 'none';
        mainPopPageContent.style.display = 'block';
        initPOPPage();
    }
    // Limpa o formulário de edição/adição ao sair ou entrar
    $('popFormTitle').textContent = 'Adicionar Novo POP';
    $('popCodigoInput').value = '';
    $('popNomeInput').value = '';
    $('popDataInput').value = '';
    $('popSetorInput').value = '';
    $('popSetorSelect').value = '';
    $('popFileName').textContent = 'Nenhum arquivo selecionado';
    selectedPopFile = null;
    $('savePopBtn').textContent = 'Salvar POP';
    $('savePopBtn').onclick = addPOP;
    editingPop = null;
}

function triggerPopFileUpload() {
    $('popPdfInput').click();
}

function handlePopFileSelection(event) {
    const file = event.target.files[0];
    if (file) {
        selectedPopFile = file;
        $('popFileName').textContent = file.name;
        showMsg(`Arquivo "${file.name}" selecionado.`);
    } else {
        selectedPopFile = null;
        $('popFileName').textContent = 'Nenhum arquivo selecionado';
    }
}

function addPOP() {
    const codigo = $('popCodigoInput').value.trim();
    const nome = $('popNomeInput').value.trim();
    const dataAtualizacao = $('popDataInput').value.trim();
    const novoSetor = $('popSetorInput').value.trim().toLowerCase();
    const setorExistente = $('popSetorSelect').value;

    let setor = '';
    let setorNome = '';

    if (novoSetor) {
        setor = novoSetor.replace(/ /g, '-').toLowerCase();
        setorNome = novoSetor.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        popSectors[setor] = setorNome;
    } else if (setorExistente) {
        setor = setorExistente;
        setorNome = popSectors[setor];
    } else {
        showMsg("Por favor, preencha o campo 'Novo Setor' ou selecione um setor existente.");
        return;
    }

    if (!codigo || !nome || !dataAtualizacao) {
        showMsg("Por favor, preencha todos os campos obrigatórios para o POP.");
        return;
    }

    // Check if POP code already exists
    if (wikiData.pops.some(p => p.codigo === codigo)) {
        showMsg(`O POP com o código "${codigo}" já existe. Por favor, use um código único.`);
        return;
    }

    const newPOP = {
        codigo: codigo,
        nome: nome,
        setor: setor,
        dataAtualizacao: dataAtualizacao,
        fileUrl: selectedPopFile ? URL.createObjectURL(selectedPopFile) : null
    };

    wikiData.pops.push(newPOP);

    $('popCodigoInput').value = '';
    $('popNomeInput').value = '';
    $('popDataInput').value = '';
    $('popSetorInput').value = '';
    $('popSetorSelect').value = '';
    $('popFileName').textContent = 'Nenhum arquivo selecionado';
    selectedPopFile = null;

    renderManagePOPs();
    initPOPPage();
    showMsg(`POP "${codigo}" adicionado com sucesso ao setor "${setorNome}"!`);
}

function editPOP(codigo) {
    editingPop = wikiData.pops.find(pop => pop.codigo === codigo);
    if (!editingPop) return;

    $('popFormTitle').textContent = `Editar POP: ${codigo}`;
    $('popCodigoInput').value = editingPop.codigo;
    $('popNomeInput').value = editingPop.nome;
    $('popDataInput').value = editingPop.dataAtualizacao;
    $('popSetorSelect').value = editingPop.setor;
    $('popFileName').textContent = editingPop.fileUrl ? "Arquivo já anexado" : "Nenhum arquivo selecionado";
    $('savePopBtn').textContent = 'Salvar Edição';
    $('savePopBtn').onclick = () => saveEditedPOP(codigo);
}

function saveEditedPOP(originalCodigo) {
    const newCodigo = $('popCodigoInput').value.trim();
    const newNome = $('popNomeInput').value.trim();
    const newDataAtualizacao = $('popDataInput').value.trim();
    const newSetor = $('popSetorSelect').value;

    if (!newCodigo || !newNome || !newDataAtualizacao || !newSetor) {
        showMsg("Por favor, preencha todos os campos para editar o POP.");
        return;
    }

    const popIndex = wikiData.pops.findIndex(pop => pop.codigo === originalCodigo);
    if (popIndex !== -1) {
        wikiData.pops[popIndex] = {
            codigo: newCodigo,
            nome: newNome,
            setor: newSetor,
            dataAtualizacao: newDataAtualizacao,
            fileUrl: selectedPopFile ? URL.createObjectURL(selectedPopFile) : wikiData.pops[popIndex].fileUrl
        };
    }

    // Reset form
    $('popFormTitle').textContent = 'Adicionar Novo POP';
    $('popCodigoInput').value = '';
    $('popNomeInput').value = '';
    $('popDataInput').value = '';
    $('popSetorInput').value = '';
    $('popSetorSelect').value = '';
    $('popFileName').textContent = 'Nenhum arquivo selecionado';
    selectedPopFile = null;
    $('savePopBtn').textContent = 'Salvar POP';
    $('savePopBtn').onclick = addPOP;
    editingPop = null;

    renderManagePOPs();
    initPOPPage();
    showMsg(`POP "${newCodigo}" editado com sucesso!`);
}

function removePOP(codigo) {
    const popIndex = wikiData.pops.findIndex(pop => pop.codigo === codigo);
    if (popIndex !== -1) {
        wikiData.pops.splice(popIndex, 1);
        renderManagePOPs();
        initPOPPage();
        showMsg(`POP "${codigo}" removido com sucesso.`);
    }
}

function downloadModelo() {
    showMsg('Download do modelo de POP iniciado. (Simulação - arquivo não disponível nesta versão demo)');
}

function viewPOP(codigo) {
    const pop = wikiData.pops.find(p => p.codigo === codigo);
    if (pop && pop.fileUrl) {
        openPDF(pop.fileUrl, pop.nome);
    } else {
        showMsg(`O POP "${codigo}" não tem um arquivo anexado para visualização.`);
    }
}

function downloadPOP(codigo) {
    const pop = wikiData.pops.find(p => p.codigo === codigo);
    if (pop && pop.fileUrl) {
        const a = document.createElement('a');
        a.href = pop.fileUrl;
        a.download = pop.nome + '.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showMsg(`Download do POP "${codigo}" iniciado.`);
    } else {
        showMsg(`O POP "${codigo}" não tem um arquivo anexado para download.`);
    }
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

initializeFirebase();
showPage("home");
});

// Expor todas as funções para o contexto global
window.showPage = showPage;
window.performSearch = performSearch;
window.triggerDocUpload = triggerDocUpload;
window.openPDF = openPDF;
window.closePDF = closePDF;
window.saveDescription = saveDescription;
window.showHistory = showHistory;
window.restoreVersion = restoreVersion;
window.initPOPPage = initPOPPage;
window.filterPOPs = filterPOPs;
window.searchPOPs = searchPOPs;
window.addPOP = addPOP;
window.downloadSelectedColumns = downloadSelectedColumns;
window.viewPOP = viewPOP;
window.downloadPOP = downloadPOP;
window.renderTutorials = renderTutorials;
window.addTutorial = addTutorial;
window.addFAQ = addFAQ;
window.renderResources = renderResources;
window.addResource = addResource;
window.addTopic = addTopic;
window.addComment = addComment;
window.triggerTutorialFileUpload = () => { showMsg("Anexar PDF a tutorial (simulação)."); };
window.toggleEditMode = toggleEditMode;
window.closeDescriptionModal = closeDescriptionModal;
window.toggleManagePOPs = toggleManagePOPs;
window.editPOP = editPOP;
window.removePOP = removePOP;
window.saveEditedPOP = saveEditedPOP;
window.triggerPopFileUpload = triggerPopFileUpload;
window.handlePopFileSelection = handlePopFileSelection;
