/**
 * Chiffres clefs — Frontend JS
 * Counter animation + parallax repulsion effect
 */
(function () {
  "use strict";

  /* ---- Counter animation ---- */
  function animateCounter(el) {
    const numberEl = el.querySelector(".card-chiffre__number");
    if (!numberEl) return;

    const target = parseInt(el.dataset.target, 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      numberEl.textContent =
        prefix + current.toLocaleString("fr-FR") + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  function initCounters() {
    const counters = document.querySelectorAll(".card-chiffre");
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => observer.observe(el));
  }

  /* ---- Parallax repulsion ---- */
  function initParallax() {
    const cards = document.querySelectorAll(".card-chiffre");
    if (!cards.length) return;

    const MAX_OFFSET = 80;
    const EASE = 0.08;

    const state = new Map();
    cards.forEach((card) => {
      card.style.transition = "none";
      card.style.willChange = "transform";
      state.set(card, { x: 0, y: 0, targetX: 0, targetY: 0 });
    });

    const section = document.querySelector(".section--chiffres");
    if (!section) return;

    function handlePointer(mx, my) {
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = cx - mx;
        const dy = cy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 400;

        if (dist < radius && dist > 0) {
          const force = (1 - dist / radius) * MAX_OFFSET;
          const angle = Math.atan2(dy, dx);
          state.get(card).targetX = Math.cos(angle) * force;
          state.get(card).targetY = Math.sin(angle) * force;
        } else {
          state.get(card).targetX = 0;
          state.get(card).targetY = 0;
        }
      });
    }

    function resetTargets() {
      cards.forEach((card) => {
        const s = state.get(card);
        s.targetX = 0;
        s.targetY = 0;
      });
    }

    section.addEventListener("mousemove", (e) =>
      handlePointer(e.clientX, e.clientY)
    );
    section.addEventListener(
      "touchmove",
      (e) => handlePointer(e.touches[0].clientX, e.touches[0].clientY),
      { passive: true }
    );
    section.addEventListener("mouseleave", resetTargets);
    section.addEventListener("touchend", resetTargets);

    function tick() {
      cards.forEach((card) => {
        const s = state.get(card);
        s.x += (s.targetX - s.x) * EASE;
        s.y += (s.targetY - s.y) * EASE;

        const len = Math.sqrt(s.x * s.x + s.y * s.y);
        if (len > MAX_OFFSET) {
          s.x = (s.x / len) * MAX_OFFSET;
          s.y = (s.y / len) * MAX_OFFSET;
        }

        card.style.transform =
          "translate(" + s.x.toFixed(1) + "px," + s.y.toFixed(1) + "px)";
      });
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /* ---- Init ---- */
  function init() {
    initCounters();
    initParallax();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
