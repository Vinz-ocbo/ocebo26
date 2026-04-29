/**
 * Slider Simple — Frontend JS
 * Animation discrète : 1 step = 1 slide glisse de droite vers le centre,
 * easing décélération, puis pause 3s.
 * 1 image : aucun JS. ≥2 images : auto-step infini.
 *
 * DOM : 3 sets du set original (clone-A | réel-B | clone-C).
 * On démarre sur le 1er du middle set, ce qui laisse le dernier slide en
 * peek-gauche dès l'ouverture de la page.
 */
(function () {
  "use strict";

  const TRANSITION_MS = 700;
  const DWELL_MS = 3000;
  const EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

  function initOne(slider) {
    if (!slider || slider.getAttribute("data-loop") !== "1") return;
    const track = slider.querySelector(".slider-simple__track");
    if (!track) return;

    const slides = Array.from(track.querySelectorAll(".slider-simple__slide"));
    if (slides.length < 6) return; // 3 sets * ≥2 slides

    const origCount = Math.floor(slides.length / 3);

    // Position initiale = 1er du set du milieu (peek-gauche du dernier slide visible)
    let physicalIdx = origCount;
    let isPaused = false;
    let isTransitioning = false;
    let dwellTimer = null;
    let resizeTimer = null;

    function getStepWidth() {
      const cs = getComputedStyle(track);
      const gap = parseFloat(cs.gap) || 0;
      return slides[0].offsetWidth + gap;
    }

    function setActive(idx) {
      slides.forEach((s, i) => {
        s.classList.toggle("is-center", i === idx);
      });
    }

    function applyTransform(stepW, transition) {
      track.style.transition = transition;
      track.style.transform = "translateX(" + (-physicalIdx * stepW) + "px)";
    }

    // Init : on aligne le inline-style avec ce que la CSS fait (calc sur --orig-count)
    (function initState() {
      const stepW = getStepWidth();
      track.style.transition = "none";
      track.style.transform = "translateX(" + (-physicalIdx * stepW) + "px)";
      void track.offsetHeight; // force reflow
      window.requestAnimationFrame(function () {
        track.style.transition = "";
      });
      setActive(physicalIdx);
    })();

    function step() {
      if (isPaused || isTransitioning) return;
      isTransitioning = true;

      physicalIdx++;
      const stepW = getStepWidth();
      applyTransform(stepW, "transform " + TRANSITION_MS + "ms " + EASING);
      setActive(physicalIdx);

      window.setTimeout(function () {
        // On a atteint le 1er du dernier set (clone) → snap silencieux vers le middle
        if (physicalIdx >= 2 * origCount) {
          track.style.transition = "none";
          slides.forEach(function (s) { s.style.transition = "none"; });

          physicalIdx -= origCount;
          applyTransform(getStepWidth(), "none");
          setActive(physicalIdx);

          void track.offsetHeight;
          window.requestAnimationFrame(function () {
            slides.forEach(function (s) { s.style.transition = ""; });
          });
        }
        isTransitioning = false;
        scheduleNext();
      }, TRANSITION_MS);
    }

    function scheduleNext() {
      window.clearTimeout(dwellTimer);
      if (isPaused) return;
      dwellTimer = window.setTimeout(step, DWELL_MS);
    }

    function pause() {
      isPaused = true;
      window.clearTimeout(dwellTimer);
    }

    function resume() {
      if (!isPaused) return;
      isPaused = false;
      if (!isTransitioning) scheduleNext();
    }

    function handleResize() {
      const stepW = getStepWidth();
      track.style.transition = "none";
      track.style.transform = "translateX(" + (-physicalIdx * stepW) + "px)";
      void track.offsetHeight;
      window.requestAnimationFrame(function () {
        track.style.transition = "";
      });
    }

    // Pause auto-step quand le slider est hors viewport (économie CPU)
    let isInView = false;
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            isInView = true;
            resume();
          } else {
            isInView = false;
            pause();
          }
        });
      }, { threshold: 0.1 });
      io.observe(slider);
    } else {
      // Pas d'IO : on lance dès l'init
      isInView = true;
      scheduleNext();
    }

    slider.addEventListener("mouseenter", pause);
    slider.addEventListener("mouseleave", function () {
      if (isInView) resume();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) pause();
      else if (isInView) resume();
    });

    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(handleResize, 150);
    });
  }

  function initAll() {
    document.querySelectorAll(".slider-simple").forEach(initOne);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
