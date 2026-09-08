/**
 * QivroPay Admin Panel — Domain & Navigation Utilities
 * Target: client.qivropay.com
 */

export function isAdminDomain(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname.toLowerCase();

  // 1. Exact production admin domain
  if (hostname === 'client.qivropay.com') return true;

  // 2. Subdomains for staging or preview (e.g. client.localhost, client.qivropay.vercel.app)
  if (hostname.startsWith('client.')) return true;

  // 3. Dev / Localhost testing support
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('portal') === 'admin' || params.has('admin')) {
      try {
        sessionStorage.setItem('qivropay_dev_portal', 'admin');
      } catch {}
      return true;
    }
    if (window.location.pathname.startsWith('/admin')) {
      return true;
    }
    try {
      if (sessionStorage.getItem('qivropay_dev_portal') === 'admin') {
        return true;
      }
    } catch {}
  }

  return false;
}

export function getAdminPath(): string {
  if (typeof window === 'undefined') return '/';
  let path = window.location.pathname;

  // If testing on localhost with /admin prefix, normalize it
  if (path.startsWith('/admin')) {
    path = path.slice(6) || '/';
  }

  // Strip trailing slash unless it is root '/'
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  return path || '/';
}

export function navigateAdmin(targetPath: string): void {
  if (typeof window === 'undefined') return;

  let actualUrl = targetPath;
  const hostname = window.location.hostname.toLowerCase();

  // If running on localhost or preview without client. subdomain and using /admin prefix:
  if (!hostname.startsWith('client.') && hostname !== 'client.qivropay.com') {
    if (window.location.pathname.startsWith('/admin')) {
      actualUrl = `/admin${targetPath === '/' ? '' : targetPath}`;
    }
  }

  window.history.pushState({}, '', actualUrl);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function formatINR(amount: number | string | undefined | null): string {
  const num = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(num);
}
