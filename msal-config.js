// msal-config.js — APENAS configuração (não instancia)
// Ajuste os IDs conforme necessário, mas mantenha o redirect sempre no /login.html
(function () {
  const TENANT_ID = "cba0be9f-94ad-4a26-b291-fa90af7491ee";
  const CLIENT_ID = "aceb5b29-df99-4d90-8533-233407b08a2c";
  const ORIGIN    = window.location.origin;
  const REDIRECT  = ORIGIN + "/login.html";

  // Objeto de configuração padrão MSAL
  window.MSAL_CONFIG = {
    auth: {
      clientId: CLIENT_ID,
      authority: "https://login.microsoftonline.com/" + TENANT_ID,
      redirectUri: REDIRECT,
      postLogoutRedirectUri: REDIRECT,
      navigateToLoginRequestUrl: false
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: true // ajuda no Edge/IE e ambientes de intranet
    },
    system: {
      loggerOptions: { loggerCallback: function () {} }
    }
  };

  // Pedidos de token (login) usados no loginRedirect
  window.MSAL_LOGIN_REQUEST = {
    scopes: ["User.Read", "openid", "profile"],
    extraQueryParameters: {
      domain_hint: "talentosconsultoria.com.br",
      prompt: "select_account"
    }
  };

  // Preferências gerais do seu app
  window.MSAL_SETTINGS = {
    ENFORCE_DOMAIN: true,
    ALLOWED_DOMAIN: "talentosconsultoria.com.br",
    DEBUG_MODE: false
  };
})(); 
