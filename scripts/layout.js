const NAV_LINKS = [
  { href: 'index.html', label: 'Home', home: true },
  { href: 'writings.html', label: 'Writings' },
  { href: 'projects.html', label: 'Projects' },
  { href: 'bookmarks.html', label: 'Bookmarks' },
];

const FOOTER_LINKS = [
  { href: 'index.html', label: 'Home', home: true },
  { href: '#', label: 'Back to top' },
  { href: 'mailto:adityareddy400@gmail.com', label: 'adityareddy400@gmail.com' },
  { href: 'https://github.com/aditya-1020', label: 'GitHub', external: true },
  { href: 'archive/adi_resume.pdf', label: 'Resume', external: true },
];

function renderLinks(links, currentPage) {
  return links
    .map(({ href, label, home, external }) => {
      const attrs = [
        home ? 'rel="home"' : '',
        href === currentPage ? 'aria-current="page"' : '',
        external ? 'target="_blank" rel="noopener noreferrer"' : '',
      ].filter(Boolean).join(' ');
      return `<a href="${href}"${attrs ? ' ' + attrs : ''}>${label}</a>`;
    })
    .join(' &nbsp; &bull; &nbsp; ');
}

function renderLayout() {
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  const nav = document.getElementById('site-nav');
  const footer = document.getElementById('site-footer-links');
  if (nav) nav.innerHTML = renderLinks(NAV_LINKS, currentPage);
  if (footer) footer.innerHTML = renderLinks(FOOTER_LINKS, currentPage);
}

renderLayout();
