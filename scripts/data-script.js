function renderList(list, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = list.map(item => `<li><a href="${item.url}">${item.title}</a></li>`).join('');
}

renderList(blogroll, 'blogroll-list');
renderList(bookmarks, 'bookmarks-list');
