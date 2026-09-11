export type MetaPixelEventName =
  | 'Lead'
  | 'CompleteRegistration'
  | 'StartTrial';

export type MetaPixelParameters = Record<string, string | number | boolean>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Sends a standard Meta Pixel browser event when the base pixel is available.
 * No email, name, payment details, or other personally identifiable data is sent.
 */
export function trackMetaEvent(
  eventName: MetaPixelEventName,
  parameters: MetaPixelParameters = {},
): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;

  window.fbq('track', eventName, parameters);
}
