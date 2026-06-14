/* Mapi & Daan — simple interactions (no parallax flower layers) */

document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 12); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
});

document.addEventListener("DOMContentLoaded", function () {
  const reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("visible"); });
    return;
  }
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  reveals.forEach(function (el) { io.observe(el); });
});




// v1.7 update: elegant vertical floral drift on scroll.
document.addEventListener("DOMContentLoaded", function () {
  const root = document.documentElement;
  let ticking = false;
  function updateFlorals() {
    const y = window.scrollY || 0;
    const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const p = Math.min(1, y / max);
    root.style.setProperty("--floral-y", `${Math.round(-760 * p)}px`);
    root.style.setProperty("--floral-opacity", (0.90 - Math.min(0.18, p * 0.16)).toFixed(2));
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) {
      requestAnimationFrame(updateFlorals);
      ticking = true;
    }
  }, { passive: true });
  updateFlorals();
});

// v1.10: subtle scroll drift for the single floral frame.
document.addEventListener("DOMContentLoaded", function () {
  const root = document.documentElement;
  let ticking = false;
  function updateFlowerFrame() {
    const y = window.scrollY || 0;
    const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const p = Math.min(1, y / max);
    root.style.setProperty("--flower-frame-y", `${Math.round(-1550 * p)}px`);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) {
      requestAnimationFrame(updateFlowerFrame);
      ticking = true;
    }
  }, { passive: true });
  updateFlowerFrame();
});

// v1.12: scroll the single tall flower frame without duplicating it.
document.addEventListener("DOMContentLoaded", function () {
  const root = document.documentElement;
  let ticking = false;

  function frameRenderedHeight() {
    const w = window.innerWidth;
    const rsvp = document.body.classList.contains("rsvp-active");
    const imageW = rsvp ? 1080 : 884;
    const imageH = rsvp ? 1400 : 2048;
    let factor = 1.0;
    if (window.innerWidth <= 520) factor = 2.30;
    else if (window.innerWidth <= 720) factor = 1.75;
    else if (!rsvp && window.innerWidth <= 900) factor = 1.50;
    return imageH * ((w * factor) / imageW);
  }

  function updateFlowerFrameV112() {
    const y = window.scrollY || 0;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const p = Math.min(1, y / maxScroll);
    const maxMove = Math.max(0, frameRenderedHeight() - window.innerHeight);
    root.style.setProperty("--flower-frame-y", `${Math.round(-maxMove * p)}px`);
    ticking = false;
  }

  function requestUpdate() {
    if (!ticking) {
      requestAnimationFrame(updateFlowerFrameV112);
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  updateFlowerFrameV112();
});

// v1.14: four-piece floral frame. Move side artwork subtly while scrolling.
document.addEventListener("DOMContentLoaded", function () {
  const root = document.documentElement;
  let ticking = false;
  function updateFourPartFrame() {
    const y = window.scrollY || 0;
    // Small parallax drift. It is intentionally subtle and never duplicates the artwork.
    root.style.setProperty("--frame-side-y", `${Math.round(-y * 0.045)}px`);
    ticking = false;
  }
  function requestUpdate() {
    if (!ticking) {
      requestAnimationFrame(updateFourPartFrame);
      ticking = true;
    }
  }
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  updateFourPartFrame();
});

// v2.3: subtle loading screen fade-out.
(function () {
  function finishLoading() {
    // Small delay so the wreath appears deliberately, not as a flash.
    window.setTimeout(function () {
      document.body.classList.add("loaded");
    }, 2200);
  }
  if (document.readyState === "complete") finishLoading();
  else window.addEventListener("load", finishLoading, { once: true });
})();
