export type FormatFn = (query: string) => string

export type ParseFn = (url: URL) => string | undefined | false | null

export interface Engine {
  title: string
  url: string

  mobile?: Partial<Omit<Engine, 'mobile'>>

  parse?: RegExp | ParseFn

  format?: FormatFn | string

  q?: string

  site?: string

  /** Unique ASCII string for identifying the engine and for keyboard shortcuts. */
  slug?: string
  /** Icon for the engine. */
  svg: string
  /** Foreground color for the engine. */
  hex: string
  /** Hides the engine from the list.
   *
   * @default false
   */
  disabled?: boolean
}
