/**
 * contact.js · Sección "Contacto"
 * Botón "Copiar" del email: usa el portapapeles si el contexto es seguro y la
 * API existe; si no (o falla), selecciona el texto para que se copie a mano.
 * Anuncia el resultado en una región aria-live y restaura el botón a los 2 s.
 * Al cambiar de idioma (y en la carga) se cancelan los temporizadores.
 */
(() => {
  'use strict';

  const root = document.getElementById('contact');
  if (!root || !window.site) return;

  const site = window.site;
  const button = root.querySelector('[data-contact-copy]');
  const label = root.querySelector('[data-contact-copy-text]');
  const email = root.querySelector('[data-contact-email]');
  const status = root.querySelector('[data-contact-status]');
  if (!button || !label || !email) return;

  const RESET_MS = 2000;
  const ANNOUNCE_MS = 50;
  let resetTimer = 0;
  let announceTimer = 0;

  function clearStatus() {
    window.clearTimeout(announceTimer);
    if (status) status.textContent = '';
  }

  function announce(message) {
    if (!status) return;
    clearStatus();
    // Pequeño retardo para que los lectores de pantalla repitan el aviso.
    announceTimer = window.setTimeout(() => {
      status.textContent = message;
    }, ANNOUNCE_MS);
  }

  function selectEmail() {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(email);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function reset() {
    window.clearTimeout(resetTimer);
    button.classList.remove('is-copied');
    label.textContent = site.t('contact.copy');
  }

  function showResult(ok) {
    window.clearTimeout(resetTimer);
    if (ok) {
      button.classList.add('is-copied');
      label.textContent = site.t('contact.copied');
      announce(site.t('contact.copied_status'));
    } else {
      selectEmail();
      announce(site.t('contact.copy_failed'));
    }
    resetTimer = window.setTimeout(reset, RESET_MS);
  }

  button.addEventListener('click', () => {
    const text = email.textContent.trim();
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => showResult(true),
        () => showResult(false)
      );
    } else {
      showResult(false);
    }
  });

  // Se llama también en la carga: deja el botón y el aviso en su estado inicial.
  site.onLangChange(() => {
    reset();
    clearStatus();
  });
})();
