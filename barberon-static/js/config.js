/**
 * Barberon — Static Site Configuration
 * ─────────────────────────────────────
 * PASSO 1: Defina API_BASE com a URL do seu backend PHP no HostGator.
 * PASSO 2: Defina SITE_BASE com o caminho base do GitHub Pages.
 *
 * Exemplos de API_BASE:
 *   'https://seusite.com.br/barberon'   → HostGator em subpasta
 *   'https://api.seusite.com.br'        → subdomínio dedicado
 *   'http://localhost:8080'             → desenvolvimento local
 *
 * Exemplos de SITE_BASE (GitHub Pages):
 *   ''          → domínio próprio ou raiz (https://seusite.com/)
 *   '/barber'   → https://koalaspectral12.github.io/barber/
 */
window.BARBERON_CONFIG = {
  // ← MUDE PARA A URL DO SEU BACKEND HOSTGATOR ←
  API_BASE: 'https://seusite.com.br/barberon',

  // Nome do app exibido no título das abas
  APP_NAME: 'Barberon',

  // Caminho base do GitHub Pages ('' se domínio próprio, '/barber' se github.io/barber)
  SITE_BASE: '/barber',
};
