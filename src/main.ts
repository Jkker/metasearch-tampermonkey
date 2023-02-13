import allEngines from './config.js';
import './styles.scss';

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

const hotkeys: {
  [key: string]: number;
} = engines.reduce((acc, engine, index) => {
  const key = engine.key[0].toLowerCase();
  acc[key] = acc[key] ? [...acc[key], index] : [index];
  return acc;
}, {});

function Button({ icon, color, name, display, lightness, href, index }: any) {
  const a = document.createElement('a');
  if (color) a.style.setProperty('--color', color);
  a.href = href;

  if (!display) {
    a.style.display = 'none';
  }
  a.setAttribute('target', '_blank');
  a.setAttribute('rel', 'noopener noreferrer');
  a.setAttribute('title', name);
  a.setAttribute('aria-label', name);
  a.setAttribute('data-index', index + '');
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
const getCurrentEngineIndex = (url: string, searchParams: URLSearchParams) => {
  for (let i = engines.length - 1; i >= 0; i--) {
    const e = engines[i];
    if (e.matchSite instanceof RegExp) {
      if (e.matchSite.test(url)) {
        return i;
      }
    }
    // Is function
    else if (typeof e.matchSite === 'function') {
      try {
        if (e.matchSite(url, searchParams)) {
          return i;
        }
      } catch (e) {
        console.error(e);
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
    try {
      return engine.q(url, searchParams);
    } catch (e) {
      console.error(e);
    }
  }
  if (Array.isArray(engine.q)) {
    for (let i = 0; i < engine.q.length; i++) {
      const q = searchParams.get(engine.q[i]);
      if (q) return q;
    }
  }
  return searchParams.get('q') || searchParams.get('query') || undefined;
};

const throttle = (callback, limit) => {
  let waiting = false; // Initially, we're not waiting
  return (...args) => {
    // We return a throttled function
    if (!waiting) {
      // If we're not waiting
      callback.apply(null, args); // Execute users function
      waiting = true; // Prevent future invocations
      setTimeout(() => {
        // After a period of time
        waiting = false; // And allow future invocations
      }, limit);
    }
  };
};

const url = window.location.href;
const params = new URLSearchParams(window.location.search);
const currEngineIndex = getCurrentEngineIndex(url, params);

if (currEngineIndex !== -1) {
  const filtered = engines.filter((_, i) => i !== currEngineIndex);
  const matchedEngine = engines[currEngineIndex];
  let q = getQuery(matchedEngine, url, params);
  if (q) {
    q = encodeURIComponent(q.trim());

    // SECTION: Render Logic

    const body = document.querySelector('body')!;
    const root = document.createElement('div');

    const linkContainer = document.createElement('div');
    linkContainer.id = 'metasearch-link-container';
    root.id = 'metasearch-root';

    let prevScrollPosition = window.pageYOffset;
    window.addEventListener(
      'scroll',
      throttle(() => {
        const currentScrollPos = window.pageYOffset;
        // Scrolling down
        if (prevScrollPosition < currentScrollPos) {
          root.style.bottom = '-48px';
        } else {
          // Scrolling up
          root.style.bottom = '0';
        }
        prevScrollPosition = currentScrollPos;
      }, 100),
      true
    );

    // Render Buttons
    const linkList: HTMLAnchorElement[] = [];

    for (let i = 0; i < filtered.length; i++) {
      const engine = filtered[i];
      const button = Button({
        icon: engine.icon,
        color: engine.color,
        name: engine.name,
        display: true,
        lightness: engine.lightness,
        href: engine.url.replaceAll('%s', q),
        index: i,
      });
      linkList.push(button);
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

    // Inject Styles Here
    console.warn('__INJECT__');

    root.appendChild(close);
    body.appendChild(root);

    const getNextTabIndex = (currIndex = -1, key) => {
      for (let i = currIndex + 1; i < filtered.length + currIndex; i++) {
        const index = i % filtered.length;
        if (filtered[index].key[0] === key.toLowerCase()) return index;
      }
      return currIndex;
    };

    const keydownListener = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        root.style.bottom = '0';
      }

      const active = document.activeElement as HTMLElement;
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (root.contains(active)) {
          // Blur root if active element is inside
          e.preventDefault();
          active.blur();
          return;
        }
      }

      // Alt + Letter
      const key = e.key.toLowerCase();
      const focusIndex = linkContainer.contains(active)
        ? parseInt(active.getAttribute('data-index') || '-1', 10)
        : -1;

      if (e.altKey && hotkeys[key] !== undefined) {
        e.preventDefault();
        const next = getNextTabIndex(focusIndex, key);
        linkList[next].focus();
        return;
      }

      // Alt + Number
      const num = parseInt(e.key, 10);
      if (e.altKey && !isNaN(num) && num < filtered.length) {
        e.preventDefault();
        const index = num - 1;
        linkList[index].focus();
        return;
      }

      // Alt + [: Prev
      if (e.altKey && (e.key === '[' || e.key === '-')) {
        const prevIndex =
          focusIndex - 1 < 0 ? filtered.length - 1 : focusIndex - 1;
        linkList[prevIndex].focus();
        return;
      }
      // Alt + ]: Next
      if (e.altKey && (e.key === ']' || e.key === '=')) {
        const nextIndex = (focusIndex + 1) % filtered.length;
        linkList[nextIndex].focus();
        return;
      }
    };
    const keyUpListener = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement;
      if (e.key === 'Alt' && linkContainer.contains(active)) {
        active.click();
        active.blur();
      }
    };

    document.addEventListener('keydown', keydownListener);
    document.addEventListener('keyup', keyUpListener);
  }
}
