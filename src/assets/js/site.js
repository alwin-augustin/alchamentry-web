/* Alchamentry — from the showcase, unchanged apart from being a file rather
   than an inline block. Progressive enhancement: the page works without it. */
(function () {
  "use strict";

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-navigation');
  menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
    nav.classList.toggle('is-open', !isOpen);
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open navigation menu');
  }));
  document.querySelector('#year').textContent = new Date().getFullYear();
})();
