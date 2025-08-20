// auth-guard.js - Sistema de Autenticação Corrigido
// Este arquivo deve ser incluído em todas as páginas protegidas

class AuthSystem {
    constructor() {
        this.init();
    }

    init() {
        // Verifica se estamos na página de login
        if (this.isLoginPage()) {
            return; // Não executa verificação na página de login
        }

        // Verifica autenticação ao carregar a página
        this.checkAuthentication();
    }

    isLoginPage() {
        return window.location.pathname.includes('login.html') || 
               window.location.pathname === '/login.html' ||
               window.location.pathname.endsWith('/login') ||
               window.location.pathname === '/';
    }

    checkAuthentication() {
        const isAuthenticated = this.isUserAuthenticated();
        
        if (!isAuthenticated) {
            this.redirectToLogin();
            return false;
        }
        
        return true;
    }

    isUserAuthenticated() {
        // Verifica se há token de autenticação válido
        const authToken = localStorage.getItem("authToken");
        const userAccount = localStorage.getItem("userAccount");
        const demoUser = localStorage.getItem("demoUser");
        
        // Aceita autenticação Microsoft ou demo
        if (authToken && userAccount) {
            try {
                const account = JSON.parse(userAccount);
                // Verifica se é do domínio correto
                if (account.username && account.username.endsWith("@talentosconsultoria.com.br")) {
                    return true;
                }
            } catch (e) {
                console.error("Erro ao verificar conta:", e);
                this.clearAuthData();
                return false;
            }
        }
        
        // Aceita usuário demo
        if (demoUser === "true") {
            return true;
        }
        
        return false;
    }

    redirectToLogin() {
        // Salva a página atual para redirecionar após login
        const currentPage = window.location.pathname + window.location.search;
        if (currentPage !== '/login.html' && !currentPage.includes('login.html')) {
            localStorage.setItem("redirectAfterLogin", currentPage);
        }
        
        // Exibe mensagem de redirecionamento
        this.showRedirectMessage();
        
        // Redireciona após um breve delay
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);
    }

    showRedirectMessage() {
        // Cria overlay de redirecionamento
        const overlay = document.createElement('div');
        overlay.id = 'auth-redirect-overlay';
        overlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                font-family: Inter, sans-serif;
            ">
                <div style="
                    background: white;
                    padding: 2rem;
                    border-radius: 1rem;
                    text-align: center;
                    max-width: 400px;
                    margin: 1rem;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                ">
                    <div style="
                        width: 3rem;
                        height: 3rem;
                        border: 4px solid #f3f4f6;
                        border-top: 4px solid #004aad;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 1rem;
                    "></div>
                    <h3 style="
                        color: #1f2937;
                        margin-bottom: 0.5rem;
                        font-size: 1.25rem;
                        font-weight: 600;
                    ">Acesso Restrito</h3>
                    <p style="
                        color: #6b7280;
                        margin-bottom: 1rem;
                        line-height: 1.5;
                    ">Você precisa fazer login para acessar esta página.</p>
                    <p style="
                        color: #4b5563;
                        font-size: 0.875rem;
                    ">Redirecionando para login...</p>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        document.body.appendChild(overlay);
    }

    clearAuthData() {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userAccount");
        localStorage.removeItem("demoUser");
        localStorage.removeItem("redirectAfterLogin");
    }

    logout() {
        this.clearAuthData();
        
        // Se existe instância MSAL, faz logout
        if (window.msalInstance) {
            try {
                window.msalInstance.logoutRedirect({
                    postLogoutRedirectUri: window.location.origin + "/login.html"
                });
                return; // O MSAL vai redirecionar
            } catch (error) {
                console.error("Erro no logout MSAL:", error);
            }
        }
        
        // Fallback para logout sem MSAL
        window.location.href = "login.html";
    }

    // Método para verificar autenticação periodicamente
    startAuthCheck() {
        setInterval(() => {
            if (!this.isUserAuthenticated()) {
                this.redirectToLogin();
            }
        }, 30000); // Verifica a cada 30 segundos
    }

    // Método para obter informações do usuário
    getUserInfo() {
        if (!this.isUserAuthenticated()) {
            return null;
        }

        const demoUser = localStorage.getItem("demoUser");
        if (demoUser === "true") {
            return {
                type: 'demo',
                name: 'Usuário Demo',
                email: 'demo@talentosconsultoria.com.br'
            };
        }

        const userAccount = localStorage.getItem("userAccount");
        if (userAccount) {
            try {
                const account = JSON.parse(userAccount);
                return {
                    type: 'microsoft',
                    name: account.name || account.username,
                    email: account.username
                };
            } catch (e) {
                console.error("Erro ao obter info do usuário:", e);
                return null;
            }
        }

        return null;
    }
}

// Função para adicionar botão de logout nas páginas

function addLogoutButton() {
    const auth = new AuthSystem();
    const userInfo = auth.getUserInfo();
    if (!userInfo) return;

    // Host mais robusto: tenta lugares comuns do seu layout
    const host = document.querySelector("header nav")
             || document.querySelector("header .container nav")
             || document.querySelector("header .container")
             || document.querySelector("header")
             || document.querySelector("nav")
             || document.body;

    // Evita duplicar
    const existing = document.getElementById("tc-userbox");
    if (existing && existing.parentElement) existing.remove();

    // Cria elemento
    const wrap = document.createElement("div");
    wrap.id = "tc-userbox";
    wrap.className = "user-section flex items-center gap-4 ml-4";

    const info = document.createElement("div");
    info.className = "text-sm text-gray-600 hidden md:block";
    info.innerHTML = `<span>Olá, <strong>${userInfo.name || "Usuário"}</strong></span>
                      <div class="text-xs text-gray-500">${userInfo.email || ""}</div>`;

    const btn = document.createElement("button");
    btn.id = "logout-btn";
    btn.type = "button";
    btn.className = "bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-2 rounded-lg transition-colors duration-200 text-sm";
    btn.innerHTML = `<svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h-1V5a3 3 0 00-3-3H6a3 3 0 00-3 3v14a3 3 0 003 3h3a3 3 0 003-3v-2h1m0 0l4 4m-4-4l4-4"/>
      </svg><span class="hidden sm:inline">Sair</span>`;

    btn.addEventListener("click", async () => {
        try {
            if (localStorage.getItem("demoUser") === "true") {
                localStorage.removeItem("demoUser");
                localStorage.removeItem("authToken");
                localStorage.removeItem("userAccount");
                location.replace("login.html");
                return;
            }
            // Preferir helper se existir
            if (window.msAuth && typeof window.msAuth.signOut === "function") {
                await window.msAuth.signOut();
                return;
            }
            // Fallback para método do AuthSystem
            auth.logout();
        } catch (e) {
            console.error("Erro ao sair:", e);
            location.replace("login.html");
        }
    });

    wrap.appendChild(info);
    wrap.appendChild(btn);
    host.appendChild(wrap);
}


// Inicializa o sistema de autenticação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const auth = new AuthSystem();
    
    // Adiciona botão de logout se estiver autenticado
    if (auth.isUserAuthenticated()) {
        // Aguarda um pouco para garantir que o DOM esteja completamente carregado
        setTimeout(() => {
            addLogoutButton();
            // Inicia verificação periódica
            auth.startAuthCheck();
        }, 100);
    }
});

// Expõe funções globais
window.AuthSystem = AuthSystem;
window.logout = () => {
    const auth = new AuthSystem();
    auth.logout();
};