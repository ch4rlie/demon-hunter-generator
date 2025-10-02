// Custom Analytics Client

const WORKER_URL = import.meta.env.VITE_WORKER_URL;

// Generate or retrieve session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

// Track page view
export function trackPageView(path: string) {
  track('pageview', null, { path });
}

// Track custom event
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  track('event', eventName, properties);
}

// Send to worker
async function track(type: string, name: string | null, properties?: Record<string, any>) {
  try {
    const data = {
      type,
      name,
      path: window.location.pathname,
      referrer: document.referrer,
      sessionId: getSessionId(),
      properties: properties || {},
    };

    // Send beacon (non-blocking)
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon(`${WORKER_URL}/analytics`, blob);
    } else {
      // Fallback to fetch
      fetch(`${WORKER_URL}/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
      }).catch(() => {}); // Silent fail
    }
  } catch (error) {
    // Silent fail - don't break user experience
  }
}
