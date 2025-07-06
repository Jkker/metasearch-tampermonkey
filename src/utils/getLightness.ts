/**
 * Calculates the perceived lightness of a hex color using the relative luminance formula.
 * Uses standard RGB to luminance conversion weights as defined by the W3C.
 *
 * @param hex - Hex color string (e.g., "#FF5733" or "FF5733")
 * @returns Lightness value between 0 (darkest) and 1 (lightest)
 *
 * @example
 * ```typescript
 * getLightness("#FFFFFF") // Returns ~1.0 (white)
 * getLightness("#000000") // Returns 0.0 (black)
 * getLightness("#FF5733") // Returns ~0.4 (medium-dark orange)
 * ```
 */
export function getLightness(hex: string): number {
  // Remove # prefix if present
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex

  // Parse RGB components
  const r = parseInt(cleanHex.slice(0, 2), 16)
  const g = parseInt(cleanHex.slice(2, 4), 16)
  const b = parseInt(cleanHex.slice(4, 6), 16)

  // Calculate relative luminance using standard weights
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}
