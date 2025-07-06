/**
 * Determines if the current device is likely a mobile device by checking if it uses a coarse pointer (e.g., touch input).
 *
 * @returns {boolean} `true` if the device has a coarse pointer (commonly mobile or tablet devices), otherwise `false`.
 */
export const isTouchScreen = (): boolean => window.matchMedia('(pointer: coarse)').matches

export const isDarkMode = (): boolean => window.matchMedia('(prefers-color-scheme: dark)').matches
