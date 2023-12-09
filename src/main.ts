import { config } from './config';
import './styles.scss';

export interface Engine {
  name: string;
  url: string;
  /**
   * The URL scheme for opening the url in native apps on mobile.
   *
   * Omitting this will use the `url` property instead.
   */
  deeplink?: string;
  /**
   * Determines if the current url matches the engine.
   *
   * @typing
   * - `string`: matches if the url contains the string.
   * - `RegExp`: checks if the url matches the regular expression.
   * - `function`: returns true if the url matches the function.
   * - `undefined`: skips the engine when matching.
   *
   * @default undefined
   */
  matcher?:
    | string
    | RegExp
    | ((url: string, query: URLSearchParams) => boolean);

  /**
   * Represents the query parameter used for searching.
   *
   * @typing
   * - `string`: The query parameter will be used as the search query.
   * - `string[]`: The first query parameter found will be used as the search query.
   * - `RegExp`: The first query parameter matching the regular expression will be used as the search query.
   * - `function`: The function will be called with the URL and query parameters. The return value will be used as the search query.
   *
   * @default 'q'
   */
  q?:
    | string
    | string[]
    | ((url: string, query: URLSearchParams) => string)
    | RegExp;

  /** Unique ASCII string for identifying the engine and for keyboard shortcuts. */
  key: string;
  /** Icon for the engine. */
  icon: string;
  /** Foreground color for the engine. */
  color: string;
  /** Background color for the engine. */
  background?: string;
  /** Lightness of the engine. Used to determine if the engine should use dark or light text.
   *
   * @default 0.5 or computed from the color
   */
  lightness?: number;
  /** Higher priority engines will be displayed first in the list.
   *
   * @default index * 0.1
   */
  priority: number;
  /** Hides the engine from the list.
   *
   * @default false
   */
  disabled?: boolean;
  /** True if the website is embeddable in an iframe
   * i.e. X-Frame-Options is not set to DENY or SAMEORIGIN.
   *
   * @default true
   */
  embeddable?: boolean;
}

// SECTION: Utilities
/**
 * Returns a throttled version of the specified function.
 * @param callback The function to throttle.
 * @param [limit=100] The minimum time between invocations of the throttled function in milliseconds. Default is 100.
 */
const throttle = (callback, limit = 100) => {
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

/**
 * Returns the lightness of the specified color.
 * @param hex The hex color code.
 * @returns The lightness of the color between 0 (black) and 1 (white).
 */
const lightnessOfHexColor = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return 0.5;
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const l = (max + min) / 2;
  return l;
};

const isMobileDevice = /Mobi/i.test(window.navigator.userAgent);

// END_SECTION

const engines = (config.engines as Engine[])
  .filter((e) => !e.disabled)
  // Sort by priority (higher priority first)
  .sort((a, b) => b.priority - a.priority);

// Generate hotkeys for engines
const hotkeys: {
  [key: string]: number;
} = engines.reduce((obj, engine, index) => {
  const key = engine.key[0].toLowerCase();
  obj[key] = obj[key] ? [...obj[key], index] : [index];
  return obj;
}, {});

/**
 * Creates a button element with customizable properties.
 *
 * @component
 *
 * @param icon - The icon to be displayed inside the button.
 * @param color - The color of the button.
 * @param background - The background color of the button.
 * @param name - The name or label of the button.
 * @param display - Determines whether the button should be displayed or hidden.
 * @param lightness - The lightness value of the button.
 * @param href - The URL that the button should navigate to.
 * @param index - The index of the button.
 * @returns The created button element.
 */
function Button({
  icon,
  color,
  background,
  name,
  lightness,
  url,
  deeplink,
  index,
  searchQuery = '',
}: Engine & {
  index: number;
  searchQuery: string;
}) {
  // Use the deeplink if the device is mobile
  const href = (isMobileDevice ? deeplink || url : url)
    // Replace %s with the search query
    .replaceAll('%s', searchQuery);
  const a = Object.assign(document.createElement('a'), {
    title: name,
    href,
    target: '_blank',
    rel: 'noopener noreferrer',
    'aria-label': name,
    'data-index': String(index),
    innerHTML: icon + `<span>${name}</span>`,
    className: 'icon-button',
  });

  if (color) a.style.setProperty('--color', color);
  if (background) a.style.setProperty('--background', background);

  // If the foreground color is too dark, invert the icon color
  if ((lightness ?? lightnessOfHexColor(color)) < 0.5)
    a.classList.add('dark-invert');
  return a;
}

// SECTION: Search Logic
const getCurrentEngineIndex = (url: string, searchParams: URLSearchParams) => {
  for (let i = engines.length - 1; i >= 0; i--) {
    const e = engines[i];

    if (!e.matcher) continue;

    // RegExp matcher
    if (e.matcher instanceof RegExp) {
      if (e.matcher.test(url)) {
        return i;
      }
    }
    // Function matcher
    else if (typeof e.matcher === 'function') {
      try {
        if (e.matcher(url, searchParams)) {
          return i;
        }
      } catch (e) {
        console.error(e);
      }
    }
    // String matcher
    else if (typeof e.matcher === 'string') {
      if (url.includes(e.matcher)) {
        return i;
      }
    }
  }
  return -1;
};

const getSearchQuery = (
  engine: Engine,
  url: string,
  searchParams: URLSearchParams
) => {
  if (typeof engine.q === 'string') {
    return searchParams.get(engine.q);
  }
  if (Array.isArray(engine.q)) {
    for (const param of engine.q) {
      const q = searchParams.get(param);
      if (q) return q;
    }
  }
  if (engine.q instanceof RegExp) {
    const match = engine.q.exec(window.location.href);
    if (match) return match[1];
  }
  if (typeof engine.q === 'function') {
    return engine.q(url, searchParams);
  }
  return searchParams.get('q') || searchParams.get('query') || undefined;
};

const url = window.location.href;
const params = new URLSearchParams(window.location.search);
const currEngineIndex = getCurrentEngineIndex(url, params);

if (currEngineIndex !== -1) {
  const filtered = engines.filter((_, i) => i !== currEngineIndex);
  const matchedEngine = engines[currEngineIndex];
  let searchQuery = getSearchQuery(matchedEngine, url, params);
  if (searchQuery) {
    // SECTION: Render Logic
    const body = document.querySelector('body')!;
    const root = document.createElement('div');

    const linkContainer = document.createElement('div');
    linkContainer.id = 'metasearch-link-container';
    root.id = 'metasearch-root';

    // Hide on scroll
    let prevScrollPosition = window.scrollY;
    window.addEventListener(
      'scroll',
      throttle(() => {
        const currentScrollPos = window.scrollY;
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

    filtered.forEach((engine, index) => {
      const button = Button({
        ...engine,
        index,
        searchQuery: encodeURIComponent(searchQuery!.trim()),
      });
      linkList.push(button);
      linkContainer.appendChild(button);
    });

    root.appendChild(linkContainer);

    root.appendChild(
      Object.assign(document.createElement('button'), {
        title: 'Close',
        'aria-label': 'Close',
        innerHTML: `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="currentColor" stroke-width="2" d="M3,3 L21,21 M3,21 L21,3"></path></svg>`,
        className: 'icon-button',
        id: 'metasearch-close',
        onclick: () => {
          root.style.bottom = '-40px';
        },
      })
    );

    // Inject Styles Here
    console.warn('__INJECT__');

    /**
     * Returns the index of the next item in the `filtered` array whose key starts with the specified character.
     * If `currIndex` is provided, the search starts from the next index.
     * @param currIndex The current index to start the search from. Default is -1.
     * @param key The character to match the key against.
     * @returns The index of the next item whose key starts with the specified character, or `currIndex` if no match is found.
     */
    const getNextTabIndex = (currIndex = -1, key) => {
      for (let i = currIndex + 1; i < filtered.length + currIndex; i++) {
        const index = i % filtered.length;
        if (filtered[index].key[0] === key.toLowerCase()) return index;
      }
      return currIndex;
    };

    /**
     * Event listener for the 'keydown' event.
     * Handles various keyboard shortcuts and actions.
     *
     * @param e - The KeyboardEvent object.
     */
    const keydownListener = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        root.style.bottom = '0';
      }

      const active = document.activeElement as HTMLElement;
      if (e.key === 'Escape') {
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

    /**
     * Event listener for the keyup event.
     * If the pressed key is 'Alt' and the active element is contained within the linkContainer,
     * it triggers a click event on the active element and removes focus from it.
     *
     * @param e The KeyboardEvent object representing the keyup event.
     */
    const keyUpListener = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement;
      if (e.key === 'Alt' && linkContainer.contains(active)) {
        active.click();
        active.blur();
      }
    };

    document.addEventListener('keydown', keydownListener);
    document.addEventListener('keyup', keyUpListener);

    // Convert vertical scroll to horizontal scroll
    linkContainer.addEventListener(
      'wheel',
      throttle((event: WheelEvent) => {
        if (!event.deltaY) return;
        linkContainer.scrollBy({
          left: event.deltaY * 4,
          behavior: 'smooth',
        });
        event.preventDefault();
        event.stopPropagation();
      }, 100)
    );

    body.appendChild(root);
  }
}
