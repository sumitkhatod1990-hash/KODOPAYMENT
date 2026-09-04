import React, { useEffect, useRef, useState } from 'react';

// Renders Google's own "Sign in with Google" button via the official Google
// Identity Services library (https://accounts.google.com/gsi/client) — no
// hand-drawn logo/button, and no Firebase/Supabase/Clerk/Auth0 involved.
// The library hands back a signed ID token (the `credential`); this
// component never reads the user's email/name off the client-decoded token
// itself, it just forwards the opaque credential to the backend, which is
// the only place it gets verified.

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

function loadGsiScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SCRIPT_SRC}"]`);
  if (existing) {
    return new Promise((resolve) => existing.addEventListener('load', () => resolve(), { once: true }));
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
}

// Google's button is given a fixed pixel width via its own `width` render
// option (it renders into an iframe, so CSS like `w-full` cannot stretch it
// after the fact) — GIS only accepts 200-400px, so this measures the
// container Tailwind already sized to match the email/password buttons and
// clamps to that range, keeping the two visually aligned at any viewport.
const MIN_GSI_WIDTH = 200;
const MAX_GSI_WIDTH = 400;

export const GoogleSignInButton: React.FC<{
  onCredential: (credential: string) => void;
}> = ({ onCredential }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!clientId) { setUnavailable(true); return; }
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;

    const renderButton = () => {
      const container = containerRef.current;
      if (!container || !window.google) return;
      const measured = Math.round(container.getBoundingClientRect().width);
      if (measured <= 0) return;
      const width = Math.min(MAX_GSI_WIDTH, Math.max(MIN_GSI_WIDTH, measured));
      container.innerHTML = '';
      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width,
      });
    };

    loadGsiScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => onCredential(response.credential),
        });
        renderButton();
        resizeObserver = new ResizeObserver(() => renderButton());
        resizeObserver.observe(containerRef.current);
      })
      .catch(() => { if (!cancelled) setUnavailable(true); });
    return () => { cancelled = true; resizeObserver?.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  if (unavailable) return null;
  return <div ref={containerRef} className="w-full flex justify-center" />;
};
