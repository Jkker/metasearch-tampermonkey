/**
 * Type definition for a throttled function that maintains the same parameters but returns void.
 */
type ThrottledFunction<T extends (...args: any[]) => any> = (...args: Parameters<T>) => void

/**
 * Creates a throttled version of the provided function that limits its execution frequency.
 * The throttled function will execute immediately on first call, then ignore subsequent calls
 * until the specified time limit has passed.
 * 
 * @param callback - The function to throttle
 * @param limit - The minimum time between invocations in milliseconds
 * @returns A throttled version of the original function
 * 
 * @example
 * ```typescript
 * const handleScroll = throttle((event) => {
 *   console.log('Scroll event processed');
 * }, 100);
 * 
 * window.addEventListener('scroll', handleScroll);
 * ```
 */
export const throttle = <T extends (...args: any[]) => any>(
  callback: T, 
  limit: number = 100
): ThrottledFunction<T> => {
  let waiting = false // Flag to track if we're in the waiting period
  
  return (...args: Parameters<T>) => {
    if (!waiting) {
      // Execute immediately if not waiting
      callback.apply(undefined, args)
      waiting = true

      // Set up the waiting period
      setTimeout(() => {
        waiting = false
      }, limit)
    }
  }
}
