/**
 * Determines if the current device is likely a mobile device by checking for coarse pointer input.
 * This method is more reliable than user agent detection as it checks actual device capabilities.
 *
 * @returns `true` if the device has a coarse pointer (touch input), indicating mobile/tablet devices
 */
export const isTouchScreen = (): boolean => window.matchMedia('(pointer: coarse)').matches

/**
 * Determines if the user's system is currently set to dark mode preference.
 * Checks the CSS media query for color scheme preference.
 *
 * @returns `true` if dark mode is preferred, `false` for light mode
 */
export const isDarkMode = (): boolean => window.matchMedia('(prefers-color-scheme: dark)').matches

/**
 * Determines if the current device is running Android OS by inspecting the user agent string.
 *
 * @returns `true` if the device is identified as Android, `false` otherwise
 */
export const isAndroid = (): boolean => /Android/i.test(navigator.userAgent)
