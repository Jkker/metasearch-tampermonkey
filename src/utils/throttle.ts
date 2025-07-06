/**
 * Returns a throttled version of the specified function.
 * @param callback The function to throttle.
 * @param [limit=100] The minimum time between invocations of the throttled function in milliseconds. Default is 100.
 */
type ThrottledFunction<T extends (...args: any[]) => any> = (...args: Parameters<T>) => void
export const throttle = <T extends (...args: any[]) => any>(callback: T, limit: number = 100): ThrottledFunction<T> => {
  let waiting = false // Initially, we're not waiting
  return (...args: Parameters<T>) => {
    // We return a throttled function
    if (!waiting) {
      // If we're not waiting
      callback.apply(undefined, args) // Execute users function
      waiting = true // Prevent future invocations
      setTimeout(() => {
        // After a period of time
        waiting = false // And allow future invocations
      }, limit)
    }
  }
}
