document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('toggle-sidebar');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');

  // Mantém UI em sincronia com o estado atual
  const syncUI = () => {
    const isHidden = sidebar.classList.contains('hidden-sidebar');
    document.body.classList.toggle('sidebar-is-hidden', isHidden);  // <<< classe no BODY
    toggleButton.textContent = isHidden ? '▶' : '◀';                // setas dir/esq (opcional)
    toggleButton.setAttribute('aria-expanded', String(!isHidden));   // acessibilidade
  };

  if (toggleButton && sidebar && mainContent) {
    syncUI(); // estado correto ao carregar

    toggleButton.addEventListener('click', () => {
      sidebar.classList.toggle('hidden-sidebar');
      mainContent.classList.toggle('expanded-content');
      syncUI(); // re-sincroniza após o clique
    });
  } else {
    console.error('IDs não encontrados: #toggle-sidebar, #sidebar, #main-content');
  }
});
