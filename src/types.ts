/**
 * Function type for formatting search queries into URLs.
 * @param query - The search query to format
 * @returns The formatted URL string
 */
export type FormatFn = (query: string) => string

/**
 * Function type for parsing search queries from URLs.
 * @param url - The URL object to parse
 * @returns The extracted search query, or falsy value if no query found
 */
export type ParseFn = (url: URL) => string | undefined | false | null

/**
 * Configuration interface for search engines.
 * Defines how each search engine should be displayed and how queries should be processed.
 */
export interface Engine {
  /** Display name of the search engine */
  title: string

  /** Search URL template with %s placeholder for query substitution */
  url: string

  /** Mobile-specific configuration overrides */
  mobile?: Partial<Omit<Engine, 'mobile'>>

  /**
   * Custom parsing logic for extracting queries from URLs.
   * Can be a RegExp pattern or custom function.
   * @default Uses 'q' query parameter
   */
  parse?: RegExp | ParseFn

  /**
   * Custom formatting logic for generating search URLs.
   * Can be a format string with %s placeholders or custom function.
   * @default Uses the 'url' property with %s substitution
   */
  format?: FormatFn | string

  /**
   * Query parameter name used by this search engine.
   * @default 'q'
   */
  q?: string

  /**
   * Site-specific search parameter for engines that support site filtering.
   * Used for engines like Google with "site:example.com" syntax.
   */
  site?: string

  /**
   * Unique ASCII identifier for keyboard shortcuts and engine identification.
   * If not provided, defaults to the first character of the title.
   */
  slug?: string

  /** SVG icon markup for the search engine button */
  svg: string

  /** Foreground color in hex format (e.g., #FF5733) */
  hex: string

  /**
   * Whether to hide this engine from the interface.
   * @default false
   */
  disabled?: boolean
}
