document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('toggle-sidebar');
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('main-content');

  const sync = () => {
    const hidden = sidebar.classList.contains('hidden-sidebar');
    document.body.classList.toggle('sidebar-is-hidden', hidden);
    main.classList.toggle('expanded-content', hidden); // se você usa expanded_content
    btn.textContent = hidden ? '▶' : '◀';
    btn.setAttribute('aria-expanded', String(!hidden));
    btn.setAttribute('aria-label', hidden ? 'Expandir barra lateral' : 'Recolher barra lateral');
  };

  // calibra estado inicial
  sync();

  btn.addEventListener('click', () => {
    sidebar.classList.toggle('hidden-sidebar');
    main.classList.toggle('expanded-content'); // mantenha se já usa essa classe
    sync(); // re-calibra após o clique
  });
});
