/**
 * Trigger native mobile haptic vibration feedback on tap-down / interactions.
 * @param pattern Duration in milliseconds (default: 12ms for subtle crisp feedback) or array pattern
 */
export function triggerHapticFeedback(pattern: number | number[] = 12): void {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore vibration errors on unsupported devices
    }
  }
}
