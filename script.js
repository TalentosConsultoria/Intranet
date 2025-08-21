// Aguarda o carregamento completo do DOM antes de executar o script
document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');

    // Verifica se os elementos foram encontrados antes de adicionar o evento
    if (toggleButton && sidebar && mainContent) {
        toggleButton.addEventListener('click', () => {
            sidebar.classList.toggle('hidden-sidebar');
            mainContent.classList.toggle('expanded-content');
        });
    } else {
        console.error("Um ou mais elementos HTML não foram encontrados. Verifique os IDs.");
    }
});
