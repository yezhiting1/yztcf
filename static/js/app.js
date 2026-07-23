// 右侧目录高亮当前可视分组。
(() => {
  const groups = document.querySelectorAll('.group');
  const links  = document.querySelectorAll('.toc a');
  if (!groups.length || !links.length) return;

  const linkById = new Map();
  links.forEach(a => {
    const id = decodeURIComponent(a.getAttribute('href').slice(1));
    linkById.set(id, a);
  });

  // 用一个 Map 维护各分组当前的 intersectionRatio，每次取最大的那个高亮
  const ratios = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => ratios.set(e.target.id, e.intersectionRatio));
    let best = null, max = 0;
    ratios.forEach((r, id) => { if (r > max) { max = r; best = id; } });
    links.forEach(a => a.classList.remove('active'));
    if (best && linkById.has(best)) linkById.get(best).classList.add('active');
  }, {
    rootMargin: '-10% 0px -60% 0px',
    threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
  });

  groups.forEach(g => io.observe(g));
})();
