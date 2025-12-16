/**
 * Metasearch Tampermonkey Script
 *
 * A customizable search engine aggregator that adds a floating bar to search result pages,
 * enabling quick cross-platform searching with keyboard shortcuts and mobile app integration.
 */

import { config } from './config.ts'
import { isDarkMode, isTouchScreen } from './utils/mediaQueries.ts'
import { throttle } from './utils/throttle.ts'

import css from './style.css?inline'
import type { Engine } from './types.ts'
import { getLightness } from './utils/getLightness.ts'

// Development logging utility
const debug = import.meta.env.DEV ? console.log.bind(console, '[MetaSearch]') : undefined

/**
 * Main application entry point.
 * Initializes the search engine aggregator interface and sets up event handlers.
 */
async function main() {
  const mobile = isTouchScreen()

  const url = new URL(window.location.href)

  const entries = config.engines
    .filter(({ disabled }) => !disabled)
    .map((e) => createItem(e, mobile))

  const res = entries.map(({ parse }) => parse(url))
  const active = res.findIndex((i) => i)
  if (active) debug?.('Active search engine index:', entries[active]?.title, active)

  if (active === -1) return

  const body = document.querySelector('body')!
  const root = document.createElement('div')

  const shadow = root.attachShadow({ mode: 'open' })
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(css)
  shadow.adoptedStyleSheets = [sheet]

  const cleanup = [setupScrollVisibilityToggleHandler(root)]

  const container = document.createElement('div')
  container.id = 'link-container'

  const filtered = entries.filter((e, i) => i !== active)

  const q = encodeURIComponent(res[active] as string)
  filtered.forEach(({ format, render }) => container.append(render(format(q))))

  shadow.appendChild(container)

  container.append(
    Object.assign(document.createElement('button'), {
      title: 'Close',
      'aria-label': 'Close',
      innerHTML: '&#10005;',
      className: 'icon-button',
      id: 'metasearch-close',
      onclick: () => {
        root.style.bottom = '-40px'
        cleanup.forEach((fn) => fn())
      },
    }),
  )
  body.append(root)

  // Register hotkeys & mouse events on Desktop
  if (!isTouchScreen()) {
    cleanup.push(setupKeyboardShortcutHandler(container, filtered))
    cleanup.push(setupHorizontalScrollHandler(container))
  }
}

/**
 * Sets up scroll-based visibility toggling for the search engine bar.
 * Hides the bar when scrolling down and shows it when scrolling up,
 * providing a cleaner browsing experience.
 *
 * @param root - The root container element to show/hide
 * @returns Cleanup function that removes the scroll event listener
 */
function setupScrollVisibilityToggleHandler(root: HTMLDivElement): () => void {
  let prevScrollPosition = window.scrollY

  const handleScroll = throttle(() => {
    // Scrolling down
    if (prevScrollPosition < window.scrollY) root.style.bottom = '-48px'
    // Scrolling up
    else root.style.bottom = '0'
    prevScrollPosition = window.scrollY
  }, 100)

  window.addEventListener('scroll', handleScroll, { passive: true })
  return () => window.removeEventListener('scroll', handleScroll)
}

/**
 * Sets up comprehensive keyboard navigation for search engine buttons.
 * Provides multiple navigation methods: arrow keys, numbers, letters, and Alt shortcuts.
 *
 * Keyboard shortcuts:
 * - Alt + [ / - : Navigate to previous engine
 * - Alt + ] / = : Navigate to next engine
 * - Alt + 1-9 : Jump to engine by position (1-based)
 * - Alt + letter : Jump to engine by first letter of slug/title
 * - Escape : Blur currently focused engine
 * - Alt (release) : Activate focused engine
 *
 * @param container - Container element holding the search engine buttons
 * @param items - Array of search engine configurations with shortcut mappings
 * @returns Cleanup function that removes all event listeners
 */
function setupKeyboardShortcutHandler(
  container: HTMLDivElement,
  items: ReturnType<typeof createItem>[],
): () => void {
  const getActive = () => document.activeElement as HTMLAnchorElement
  const links = [...container.querySelectorAll('a')]
  const shortcuts = new Set(items.map((e) => e.shortcut))
  const n = items.length

  const keydownListener = (e: KeyboardEvent): void => {
    const focus = (i: number) => {
      e.preventDefault()
      i = (i + n) % n // Wrap around
      const target = links?.at(i)
      if (!target) return
      target.focus()
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
    const active = getActive()
    const curr = links.indexOf(active)

    // Blur root if active element is inside
    if ('Escape' === e.key && curr !== -1) {
      e.preventDefault()
      return active.blur()
    }
    // if ('Alt' === e.key) container.parentElement!.style.bottom = '0'

    if (!e.altKey) return

    // Alt + [ or Alt + -: Previous
    if ('[' === e.key || '-' === e.key) return focus((curr || 0) - 1)
    // Alt + ] or Alt + =: Next
    if (']' === e.key || '=' === e.key) return focus(curr + 1)

    // Alt + Number
    const num = Number.parseInt(e.key)
    if (!isNaN(num)) return focus(num - 1) // 1-based to 0-based index;

    // Alt + Letter
    const key = e.key.toLowerCase()
    if (!shortcuts.has(key)) return
    for (let i = curr + 1; i < n + curr; i++) {
      const index = i % n
      if (items[index].shortcut === key) return focus(index)
    }
  }
  document.addEventListener('keydown', keydownListener)

  const keyupListener = (e: KeyboardEvent): void => {
    const active = document.activeElement as HTMLElement
    if (e.key === 'Alt' && container.contains(active)) {
      active.click()
      active.blur()
    }
  }
  document.addEventListener('keyup', keyupListener)
  return () => {
    document.removeEventListener('keydown', keydownListener)
    document.removeEventListener('keyup', keyupListener)
  }
}

/**
 * Sets up horizontal scrolling for the search engine container using mouse wheel input.
 * Converts vertical wheel movement to horizontal scrolling for better UX on desktop devices.
 *
 * @param container - The scrollable container element
 * @returns Cleanup function that removes the wheel event listener
 */
function setupHorizontalScrollHandler(container: HTMLDivElement): () => void {
  const horizontalScrollThrottler = throttle((event: WheelEvent) => {
    if (!event.deltaY) {
      return
    }
    container.scrollBy({
      left: event.deltaY * 4,
      behavior: 'smooth',
    })
    event.preventDefault()
    event.stopPropagation()
  }, 100)
  // Convert vertical scroll to horizontal scroll
  container.addEventListener('wheel', horizontalScrollThrottler)
  return () => container.removeEventListener('wheel', horizontalScrollThrottler)
}

/**
 * Creates a search engine item with all necessary properties and methods.
 * Processes the engine configuration and generates parsing, formatting, and rendering functions.
 *
 * @param _engine - Base engine configuration
 * @param mobile - Whether to apply mobile-specific overrides
 * @returns Complete engine item with parse, format, and render methods
 */
function createItem(_engine: Engine, mobile = false) {
  const engine = mobile ? { ..._engine, ..._engine.mobile } : _engine
  if (!engine.hex.startsWith('#')) engine.hex = `#${engine.hex}`

  const { title, svg, hex, parse, format, slug, url, site } = engine
  const { host } = new URL(url)
  const shortcut = (slug || title)[0].toLowerCase()

  return {
    ...engine,
    shortcut,
    parse: (current = new URL(window.location.href)) => {
      if (current.host !== host) return

      if (typeof parse === 'function') return parse(current)

      if (parse instanceof RegExp) return current.href.match(parse)?.[0]

      // Custom or default query param key
      const q = current.searchParams.get(engine.q ?? 'q')

      if (site && q?.includes('site:')) {
        const [siteQuery, siteName] = q.split(`site:`).map((s) => s.trim())
        return siteName === site ? siteQuery : undefined
      }
      return q
    },
    format: (query: string): string => {
      // Custom format function
      if (typeof format === 'function') return format(query)
      // If the format is a string, replace '%s' with the query
      if (typeof format === 'string') return format.replaceAll('%s', query)

      return url.replaceAll('%s', query)
    },

    render: (href: string): HTMLAnchorElement => {
      const a = document.createElement('a')

      a.href = href
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      a.className = 'icon-button'
      a.innerHTML = svg
      if (getLightness(hex) < 0.2 && isDarkMode()) a.style.color = '#fcfcfa'
      else a.style.color = hex

      return a
    },
  }
}

// Initialize the application
void main()
