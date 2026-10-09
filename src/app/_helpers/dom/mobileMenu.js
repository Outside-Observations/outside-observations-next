/**
 * Mobile menu modal, shared between the button that owns its state
 * (MobileMenuButton) and the controls living inside it (HeaderSearch).
 * The modal closes by itself on a route change. These helpers cover the
 * actions that stay on the same route, like a search on the archive.
 */
export const MOBILE_MENU_CLOSE_EVENT = 'oo:mobile-menu-close';

export function isMobileMenuOpen() {
  return (
    document.body.classList.contains('mobile-nav-open') &&
    !document.body.classList.contains('mobile-nav-closing')
  );
}

export function requestMobileMenuClose() {
  window.dispatchEvent(new Event(MOBILE_MENU_CLOSE_EVENT));
}
