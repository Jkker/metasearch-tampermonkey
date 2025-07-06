import { config } from './config.ts'
import { isDarkMode, isTouchScreen } from './utils/mediaQueries.ts'
import { throttle } from './utils/throttle.ts'

import css from './style.css?inline'
import type { Engine } from './types.ts'
import { getLightness } from './utils/getLightness.ts'

const debug = import.meta.env.DEV ? console.log.bind(console, '[MetaSearch]') : undefined

async function main() {
  const mobile = isTouchScreen()

  const url = new URL(window.location.href)

  const entries = config.engines.filter(({ disabled }) => !disabled).map((e) => createItem(e, mobile))

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
    })
  )
  body.append(root)

  // Register hotkeys & mouse events on Desktop
  if (!isTouchScreen()) {
    cleanup.push(setupKeyboardShortcutHandler(container, filtered))
    cleanup.push(setupHorizontalScrollHandler(container))
  }
}

/**
 * Sets up scroll-based visibility toggling for a given root HTMLDivElement.
 *
 * When the user scrolls down, the element is hidden by moving it downwards.
 * When the user scrolls up, the element is shown by resetting its position.
 * The scroll event handler is throttled to improve performance.
 *
 * @param root - The HTMLDivElement whose visibility should be toggled based on scroll direction.
 * @returns A cleanup function that removes the scroll event listener when called.
 */
function setupScrollVisibilityToggleHandler(root: HTMLDivElement) {
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
 * Sets up keyboard shortcuts for navigating and activating anchor elements within a given container.
 *
 * - Allows navigation between links using Alt + [ / - (previous), Alt + ] / = (next), Alt + number (1-based), or Alt + a custom shortcut letter.
 * - Pressing Escape blurs the currently focused link if it is inside the container.
 * - Pressing and releasing Alt while a link is focused triggers a click on that link.
 * - Optionally, pressing Alt alone sets the container's parent element's bottom style to '0'.
 *
 * @param container - The HTMLDivElement containing the anchor elements to navigate.
 * @param items - An array of items representing search engines, each with a `shortcut` property used for keyboard navigation.
 * @returns A cleanup function that removes the event listeners when called.
 */
function setupKeyboardShortcutHandler(container: HTMLDivElement, items: Item[]) {
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

main()

/**
 * Sets up a horizontal scroll handler on the given container element.
 * Converts vertical mouse wheel scrolling into horizontal scrolling,
 * allowing users to scroll horizontally using the mouse wheel.
 * The scroll event is throttled to improve performance.
 *
 * @param container - The HTMLDivElement to attach the horizontal scroll handler to.
 * @returns A cleanup function that removes the event listener when called.
 */
function setupHorizontalScrollHandler(container: HTMLDivElement) {
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


type Item = ReturnType<typeof createItem>