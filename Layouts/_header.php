<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wiki Talentos</title>
    
    <link rel="stylesheet" href="estilos/styles.css">
    <link rel="stylesheet" href="estilos/article.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap">
</head>
<body>
    <header class="top-header">
        <div class="site-brand">
            <img src="https://placehold.co/40x40/ffffff/7a0e0e?text=T" alt="Logo da empresa" class="site-logo">
            <h1 class="site-title"><a href="index.html" class="link_top">Talentos Wiki</a></h1>
        </div>

        <div class="header-elements">
            <div class="search-bar">
                <input type="text" placeholder="Pesquisar na Wiki">
        </div>

            
            <nav class="header-nav">
                <div class="dropdown">
                    <button class="dropdown-button" id="dropdown-btn">
                        Navegação
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </button>
                    <div class="dropdown-content" id="dropdown-links">
                        <a href="index.php">Página inicial</a>
                        <a href="article.php">Tutoriais</a>
                        <a href="#projetos">Outros Projetos</a>
                        <a href="#">Ajuda</a>
                    </div>
                </div>
            </nav>
        </div>
    </header>