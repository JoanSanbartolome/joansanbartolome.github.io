/**
 * featured.js · Pestañas del proyecto destacado (patrón ARIA "tabs", activación automática)
 * Clic o flechas izquierda/derecha, Inicio y Fin. Tabindex itinerante: solo la pestaña activa es tabulable.
 * Sin JavaScript no hay pestañas: la lista lleva `hidden` en el HTML y los paneles se ven seguidos.
 * Al iniciar, este script muestra la lista y convierte los paneles en tabpanel (rol, aria-labelledby,
 * tabindex); los inactivos se ocultan con el atributo `hidden`.
 */
(() => {
  'use strict';

  const root = document.getElementById('featured');
  if (!root) return;

  const tablist = root.querySelector('[role="tablist"]');
  if (!tablist) return;

  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
  if (!tabs.length || panels.some((panel) => !panel)) return;

  panels.forEach((panel, i) => {
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabs[i].id);
    panel.tabIndex = 0;
  });

  function select(index, moveFocus) {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
    });
    if (moveFocus) tabs[index].focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i, false));
  });

  tablist.addEventListener('keydown', (event) => {
    const current = tabs.indexOf(document.activeElement);
    if (current === -1) return;

    let next;
    switch (event.key) {
      case 'ArrowRight':
        next = (current + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        next = (current - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = tabs.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    select(next, true);
  });

  const initial = tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');
  select(initial === -1 ? 0 : initial, false);
  tablist.hidden = false;
})();
