/* Alchamentry — progressive enhancement only.
 *
 * The reveal animation is CSS scroll-driven (see site.css), so this file does
 * one thing: give the sticky header a hairline once the page has moved. With
 * JavaScript blocked the page is identical, minus that hairline.
 */
(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  if (!header) return;

  var ticking = false;

  function update() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
})();
