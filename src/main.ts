import './styles.scss';
import allEngines from './config.js';

interface Engine {
  name: string;
  url: string;
  url_scheme: string;
  matchSite:
    | string
    | RegExp
    | ((url: string, query: URLSearchParams) => boolean);
  q?:
    | string
    | string[]
    | ((url: string, query: URLSearchParams) => string)
    | RegExp;
  key: string;

  icon: string;
  color: string;
  preload: boolean;
  embeddable: boolean;
  weight: number;
  disabled: boolean;
  lightness: number;
}

const engines: Engine[] = allEngines
  .filter((e) => !e.disabled)
  .sort((a, b) => b.weight - a.weight);

function Button({ icon, color, name, display, lightness, href }: any) {
  const a = document.createElement('a');

  if (color) a.style.color = color;
  a.href = href;

  if (!display) {
    a.style.display = 'none';
  }
  a.title = name;
  a.classList.add('icon-button');
  a.innerHTML = icon;
  const text = document.createElement('span');
  text.innerText = name;

  if (lightness < 0.5) {
    a.classList.add('dark-invert');
  }

  a.append(text);

  return a;
}

// SECTION: Search Logic
const matchSite = (url: string, searchParams: URLSearchParams) => {
  for (let i = engines.length - 1; i >= 0; i--) {
    const e = engines[i];
    if (e.matchSite instanceof RegExp) {
      if (e.matchSite.test(url)) {
        return i;
      }
    }
    // Is function
    else if (typeof e.matchSite === 'function') {
      if (e.matchSite(url, searchParams)) {
        return i;
      }
    }
    // Is string
    else if (typeof e.matchSite === 'string') {
      if (url.includes(e.matchSite)) {
        return i;
      }
    }
  }
  return -1;
};

const getQuery = (
  engine: Engine,
  url: string,
  searchParams: URLSearchParams
) => {
  if (typeof engine.q === 'string') {
    return searchParams.get(engine.q);
  }
  if (engine.q instanceof RegExp) {
    const match = engine.q.exec(window.location.href);
    if (match) return match[1];
  }
  if (typeof engine.q === 'function') {
    return engine.q(url, searchParams);
  }
  if (Array.isArray(engine.q)) {
    for (let i = 0; i < engine.q.length; i++) {
      const q = searchParams.get(engine.q[i]);
      if (q) return q;
    }
  }
  return searchParams.get('q') || searchParams.get('query') || null;
};

const searchParams = new URLSearchParams(window.location.search);
const url = window.location.href;
const engineIndex = matchSite(url, searchParams);

if (engineIndex !== -1) {
  console.log(`🚀 `, engines[engineIndex]);
  const q = encodeURIComponent(
    getQuery(engines[engineIndex], url, searchParams).trim()
  );

  // SECTION: Render Logic

  const body = document.querySelector('body');
  const root = document.createElement('div');

  const linkContainer = document.createElement('div');
  linkContainer.id = 'metasearch-link-container';
  root.id = 'metasearch-root';

  let prevScrollPosition = window.pageYOffset;
  window.onscroll = function () {
    const currentScrollPos = window.pageYOffset;
    root.style.bottom = prevScrollPosition > currentScrollPos ? '0' : '-48px';
    prevScrollPosition = currentScrollPos;
  };

  // Render Buttons
  for (let i = 0; i < engines.length; i++) {
    if (i === engineIndex) continue; // Skip current engine
    const engine = engines[i];
    const button = Button({
      icon: engine.icon,
      color: engine.color,
      name: engine.name,
      display: true,
      lightness: engine.lightness,
      href: engine.url.replaceAll('%s', q),
    });
    linkContainer.appendChild(button);
  }

  root.appendChild(linkContainer);

  const close = document.createElement('button');
  close.innerHTML = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="currentColor" stroke-width="2" d="M3,3 L21,21 M3,21 L21,3"></path></svg>`;
  close.classList.add('icon-button');
  close.id = 'metasearch-close';

  close.addEventListener('click', () => {
    root.style.bottom = '-40px';
  });
  console.warn('__INJECT__');

  root.appendChild(close);

  body.appendChild(root);
}
