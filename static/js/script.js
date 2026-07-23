const root = document.documentElement;
const themeBtn = document.getElementById('theme-toggle');

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('theme', next);
  });
}

// ---------- i18n ----------
const I18N = {
  zh: {
    'nav.blog': '博客',
    'nav.cloud': '网盘',
    'nav.messages': '留言',
    'nav.home': '首页',
    'hero.greeting': '你好, 我是 ',
    'hero.name': '叶志挺',
    'hero.desc': '专注于 AI 工具、网站、服务器与创意项目。',
    'links.blog': '博客',
    'links.lab': '实验室',
    'links.feed': '动态',
    'links.messages': '留言',
    'links.status': '服务状态',
    'status.unknown': '查看实时状态',
    'status.up': '全部正常',
    'status.partial': '部分异常',
    'status.down': '服务异常',
    'aria.mainNav': '主导航',
    'aria.toggleTheme': '切换主题',
    'aria.toggleLang': 'Switch to English',
    'langLabel': 'EN',
    'contact.heroTitle': '留言',
    'contact.heroDesc': '想说点什么都可以，有些留言会展示。',
    'form.nickname': '昵称',
    'form.body': '内容',
    'form.submit': '提交',
    'form.errFields': '昵称和内容都要填, 内容至少 5 个字。',
    'form.ok': '已收到, 审核通过后会出现在下方列表。',
    'form.errNotAccepted': '没有收到：可能提交太快或过于频繁，请稍后再试。',
    'form.errLoadPrefix': '加载失败: ',
    'form.errSubmitPrefix': '提交失败: ',
    'list.section': '展示的留言',
    'list.loading': '加载中…',
    'list.empty': '还没有公开的留言, 来当第一个 :)',
    'list.more': '加载更多',
    'msg.replyLabel': '站长回复',
    'msg.edited': '（已编辑）',
    '_title.home': 'Xuwei · 叶志挺的个人主页',
    '_desc.home': '叶志挺 (LIXUWEI) 的个人主页。前端 / 全栈兴趣，偏爱简约克制的设计。',
    '_title.contact': '留言 · 叶志挺',
    '_desc.contact': '给叶志挺 (LIXUWEI) 留言。无需登录，先审后发。',
  },
  en: {
    'nav.blog': 'Blog',
    'nav.cloud': 'Cloud',
    'nav.messages': 'Messages',
    'nav.home': 'Home',
    'hero.greeting': "Hi, I'm ",
    'hero.name': 'Xuwei Li (叶志挺)',
    'hero.desc': 'Building AI tools, personal websites, server deployments, and creative projects.',
    'links.blog': 'Blog',
    'links.lab': 'Lab',
    'links.feed': 'Feed',
    'links.messages': 'Messages',
    'links.status': 'Service Status',
    'status.unknown': 'Check live status',
    'status.up': 'All operational',
    'status.partial': 'Partial outage',
    'status.down': 'Service down',
    'aria.mainNav': 'Main navigation',
    'aria.toggleTheme': 'Toggle theme',
    'aria.toggleLang': '切换到中文',
    'langLabel': '中',
    'contact.heroTitle': 'Messages',
    'contact.heroDesc': "Drop a note — anything goes. Reviewed before it shows up below.",
    'form.nickname': 'Nickname',
    'form.body': 'Message',
    'form.submit': 'Submit',
    'form.errFields': 'Both fields are required. Message must be at least 5 characters.',
    'form.ok': 'Received. It will appear below after review.',
    'form.errNotAccepted': 'Not received. Please wait a moment and try again.',
    'form.errLoadPrefix': 'Failed to load: ',
    'form.errSubmitPrefix': 'Failed to submit: ',
    'list.section': 'Approved messages',
    'list.loading': 'Loading…',
    'list.empty': 'No public messages yet — be the first :)',
    'list.more': 'Load more',
    'msg.replyLabel': 'Owner reply',
    'msg.edited': '(edited)',
    '_title.home': "Xuwei · LIXUWEI's homepage",
    '_desc.home': "LIXUWEI's personal homepage. Front-end / full-stack interests, minimalist design.",
    '_title.contact': 'Messages · LIXUWEI',
    '_desc.contact': 'Leave a message for LIXUWEI. No login required, reviewed before posting.',
  },
};

(() => {
  const saved = localStorage.getItem('lang');
  const initial = (root.dataset.lang === 'en' || root.dataset.lang === 'zh')
    ? root.dataset.lang
    : (saved === 'en' || saved === 'zh')
      ? saved
      : 'zh'; // Default to Chinese for visitors without a stored choice (incl. crawlers).

  let currentLang = initial;
  const listeners = [];

  function apply(lang) {
    currentLang = lang;
    const dict = I18N[lang] || I18N.zh;
    root.dataset.lang = lang;
    root.lang = lang === 'zh' ? 'zh-CN' : 'en';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (key in dict) el.textContent = dict[key];
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
      const key = el.dataset.i18nAriaLabel;
      if (key in dict) el.setAttribute('aria-label', dict[key]);
    });
    // Intentionally do NOT translate <title> or <meta name="description">.
    // Googlebot renders JS with navigator.language=en-US and would otherwise index the English
    // versions, making searches for "叶志挺" miss the site. Keep the HTML-rendered Chinese meta.

    localStorage.setItem('lang', lang);
    for (const fn of listeners) { try { fn(lang, dict); } catch (_) {} }
  }

  window.__i18n = {
    get lang() { return currentLang; },
    t(key) { return (I18N[currentLang] && I18N[currentLang][key]) ?? key; },
    onChange(fn) { listeners.push(fn); },
    apply,
  };

  apply(currentLang);

  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      apply(currentLang === 'zh' ? 'en' : 'zh');
    });
  }
})();

// Spotlight effects (global + per-card). Skipped on touch-only devices.
(() => {
  if (matchMedia('(hover: none)').matches) return;

  // Global spotlight: follows cursor across the whole page.
  const body = document.body;
  let bx = 0, by = 0, queued = false;
  window.addEventListener('pointermove', (e) => {
    bx = e.clientX;
    by = e.clientY;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      body.style.setProperty('--mx', bx + 'px');
      body.style.setProperty('--my', by + 'px');
      queued = false;
    });
  });

  // Per-card spotlight: local coordinates inside each .page-link.
  const cards = document.querySelectorAll('.page-link');
  cards.forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();

// Live service status dot. Non-blocking, fails silently on timeout/error.
(() => {
  const dot = document.querySelector('#status-link .status-dot');
  const text = document.querySelector('#status-link .status-text');
  if (!dot) return;

  const run = async () => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    try {
      const res = await fetch(
        'https://status.apodfg.com/api/status-page/heartbeat/services',
        { signal: ctrl.signal, cache: 'no-store' }
      );
      if (!res.ok) return;
      const data = await res.json();
      const lists = Object.values(data.heartbeatList || {});
      let up = 0, total = 0;
      for (const arr of lists) {
        const last = arr && arr[arr.length - 1];
        if (!last) continue;
        total++;
        if (last.status === 1) up++;
      }
      if (!total) return;
      const status = up === total ? 'up' : up === 0 ? 'down' : 'partial';
      dot.dataset.status = status;
      if (text) {
        text.dataset.status = status;
        // Re-key the i18n binding so future language toggles render the right label.
        text.dataset.i18n = 'status.' + status;
        text.textContent = window.__i18n ? window.__i18n.t('status.' + status) : text.textContent;
      }
    } catch (_) {
      // Silent — keep the default grey dot.
    } finally {
      clearTimeout(timer);
    }
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(run, { timeout: 2000 });
  } else {
    setTimeout(run, 500);
  }
})();
