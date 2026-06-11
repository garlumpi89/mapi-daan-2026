/* ============================================
   Mapi & Daan — animations
   (scroll reveal · gold particles · 3D parallax)
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {
  const stage = document.getElementById("hero-stage");
  if (!stage) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- subtle gold light particles ---- */
  const canvas = document.getElementById("particles");
  if (canvas && !reduced) {
    const ctx = canvas.getContext("2d");
    let W, H, parts = [];
    function resize() {
      W = canvas.width = stage.clientWidth;
      H = canvas.height = stage.clientHeight;
    }
    function spawn(n) {
      parts = [];
      for (let i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.8 + Math.random() * 2.2,
          vy: -(0.08 + Math.random() * 0.25),
          vx: (Math.random() - 0.5) * 0.12,
          tw: Math.random() * Math.PI * 2,
          ts: 0.008 + Math.random() * 0.02
        });
      }
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.y += p.vy; p.x += p.vx; p.tw += p.ts;
        if (p.y < -8) { p.y = H + 8; p.x = Math.random() * W; }
        const a = 0.12 + 0.38 * (0.5 + 0.5 * Math.sin(p.tw));
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.5);
        g.addColorStop(0, "rgba(201,168,76," + a + ")");
        g.addColorStop(1, "rgba(201,168,76,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    resize();
    spawn(Math.max(24, Math.round(stage.clientWidth / 28)));
    window.addEventListener("resize", function () { resize(); spawn(Math.max(24, Math.round(W / 28))); });
    requestAnimationFrame(tick);
  }

  /* ---- gentle 3D parallax (card tilt + floral drift) ---- */
  const card = document.getElementById("invite-card");
  const florals = stage.querySelectorAll(".stage-floral");
  if (!reduced && card) {
    let raf = null;
    stage.addEventListener("mousemove", function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        const rect = stage.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5..0.5
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          "rotateY(" + (nx * 5) + "deg) rotateX(" + (-ny * 4) + "deg)";
        florals.forEach(function (f) {
          const d = parseFloat(f.getAttribute("data-depth") || "10");
          f.style.translate = (-nx * d) + "px " + (-ny * d) + "px";
        });
        raf = null;
      });
    });
    stage.addEventListener("mouseleave", function () {
      card.style.transform = "";
      florals.forEach(function (f) { f.style.translate = ""; });
    });
    /* mobile: tiny drift on scroll instead of mouse */
    window.addEventListener("scroll", function () {
      const y = Math.min(window.scrollY, 600) / 600;
      card.style.transform = "translateY(" + (y * 26) + "px) scale(" + (1 - y * 0.04) + ")";
    }, { passive: true });
  }
});

/* ============================================
   Liquid-glass header: elevate on scroll
   ============================================ */
document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".site-header");
  if (!header) return;
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
});

/* ============================================
   Scroll reveal
   ============================================ */

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
