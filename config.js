// config.js — instancia MSAL para páginas protegidas (não trata redirect aqui)
(function () {
  if (!window.MSAL_CONFIG) {
    console.error("MSAL_CONFIG não encontrado. Inclua msal-config.js antes de config.js");
    return;
  }
  // Evita múltiplas instâncias
  if (!window.msalApp) {
    window.msalApp = new msal.PublicClientApplication(window.MSAL_CONFIG);
  }

  // Helpers globais opcionais
  window.msAuth = {
    getAccount() {
      return window.msalApp.getActiveAccount() || window.msalApp.getAllAccounts()[0] || null;
    },
    async getToken(scopes = ["User.Read"]) {
      const account = this.getAccount();
      if (!account) throw new Error("Sem sessão ativa");
      try {
        const res = await window.msalApp.acquireTokenSilent({ scopes, account });
        return res.accessToken;
      } catch (e) {
        throw e;
      }
    },
    signOut() {
      const acc = this.getAccount();
      window.msalApp.logoutRedirect({ account: acc });
    }
  };
})(); 
