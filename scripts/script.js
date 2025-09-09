
document.addEventListener('DOMContentLoaded', function() {
    const dropdownBtn = document.getElementById('dropdown-btn');
    const dropdownContent = document.getElementById('dropdown-links');

    // Função para alternar a visibilidade do dropdown
    function toggleDropdown() {
        dropdownContent.classList.toggle('show');
        dropdownBtn.classList.toggle('active');
    }

    // Evento de clique no botão
    dropdownBtn.addEventListener('click', function(event) {
        // Impede que o clique no botão feche o menu imediatamente (ver evento 'window.onclick')
        event.stopPropagation(); 
        toggleDropdown();
    });

    // Fecha o dropdown se o usuário clicar fora dele
    window.onclick = function(event) {
        if (!event.target.matches('.dropdown-button')) {
            if (dropdownContent.classList.contains('show')) {
                toggleDropdown();
            }
        }
    }
});

