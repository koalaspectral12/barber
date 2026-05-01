/**
 * Barberon — Static Site Configuration
 * ─────────────────────────────────────
 * Set API_BASE to the URL where your PHP backend is hosted.
 * Examples:
 *   'https://seusite.com.br/barberon'   (HostGator subfolder)
 *   'https://api.seusite.com.br'        (subdomain)
 *   'http://localhost:8080'             (local dev)
 */
window.BARBERON_CONFIG = {
  API_BASE: 'https://your-backend.com/barberon',  // ← CHANGE THIS

  // App name shown in tab titles and header
  APP_NAME: 'Barberon',

  // GitHub Pages base path (leave '' if at root, e.g. '/barberon' if at github.io/barberon)
  SITE_BASE: '',
};
