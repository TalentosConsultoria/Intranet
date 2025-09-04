// TOC automático e âncoras de títulos para .wiki-article
document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('.wiki-article');
  if (!root) return;

  const tocList = document.getElementById('toc-list');
  const headings = root.querySelectorAll('h2, h3');

  const slugify = (text) =>
    text.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .trim().replace(/\s+/g, '-');

  headings.forEach((h, idx) => {
    // cria id único se não houver
    if (!h.id) {
      const base = slugify(h.textContent) || `secao-${idx+1}`;
      let id = base, n = 2;
      while (document.getElementById(id)) id = `${base}-${n++}`;
      h.id = id;
    }

    // adiciona link âncora no próprio heading (estilo wiki)
    if (!h.querySelector('.anchor-link')) {
      const a = document.createElement('a');
      a.href = `#${h.id}`;
      a.className = 'anchor-link';
      a.setAttribute('aria-label', `Ir para ${h.textContent}`);
      a.textContent = ' ¶';
      a.style.textDecoration = 'none';
      a.style.color = '#9aa0a6';
      h.appendChild(a);
    }

    // inclui no TOC
    if (tocList) {
      const li = document.createElement('li');
      li.className = h.tagName.toLowerCase() === 'h2' ? 'toc-h2' : 'toc-h3';
      const link = document.createElement('a');
      link.href = `#${h.id}`;
      link.textContent = h.textContent.replace(/\s+¶$/, '');
      li.appendChild(link);
      tocList.appendChild(li);
    }
  });
});
