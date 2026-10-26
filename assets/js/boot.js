/**
 * boot.js · Arranque síncrono (en <head>, antes de los CSS)
 *
 * - Sustituye la clase de <html> por 'js': los estilos sin JavaScript usan html:not(.js).
 * - Si el idioma guardado es 'en', añade 'i18n-pending' para ocultar <main> hasta que
 *   main.js aplique la traducción (evita ver el español un instante).
 * Es un archivo externo (no inline) para respetar la Content-Security-Policy.
 */
(function () {
  'use strict';
  var root = document.documentElement;
  root.className = 'js';
  try {
    if (window.localStorage.getItem('site-lang') === 'en') {
      root.classList.add('i18n-pending');
    }
  } catch (e) {
    /* almacenamiento bloqueado: se queda el idioma por defecto */
  }
})();
