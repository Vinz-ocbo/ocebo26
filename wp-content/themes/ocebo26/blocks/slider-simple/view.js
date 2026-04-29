/**
 * Slider Simple — Frontend JS
 * Animation discrète : 1 step = 1 slide glisse de droite vers le centre,
 * easing décélération, puis pause 3s.
 * 1 image : aucun JS. ≥2 images : auto-step infini + drag/swipe.
 *
 * DOM : 3 sets du set original (clone-A | réel-B | clone-C).
 * On démarre sur le 1er du middle set, ce qui laisse le dernier slide en
 * peek-gauche dès l'ouverture de la page.
 *
 * Drag/swipe : Pointer Events (mouse + touch + pen). Au commit ±15% de la
 * largeur d'un slide, on avance ou recule d'un step. Le wrap est bidirectionnel.
 */
(function () {
  "use strict";

  const TRANSITION_MS = 700;
  const DWELL_MS = 3000;
  const EASING = "cubic-bezier(0.16, 1, 0.3, 1)";
  const DRAG_LOCK_THRESHOLD = 8;   // px avant de décider du sens
  const DRAG_COMMIT_RATIO = 0.15;  // fraction de stepW pour valider un step

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
    let transitionTimer = null;

    // Drag state
    let dragActive = false;
    let dragLocked = false;
    let dragMoved = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragDeltaX = 0;
    let dragVisualBase = 0;
    let dragStepW = 0;
    let lastPointerType = "";

    function getStepWidth() {
      const cs = getComputedStyle(track);
      const gap = parseFloat(cs.gap) || 0;
      return slides[0].offsetWidth + gap;
    }

    function readCurrentTx() {
      const cs = getComputedStyle(track);
      if (!cs.transform || cs.transform === "none") return 0;
      const m = cs.transform.match(/matrix3d\(([^)]+)\)/) || cs.transform.match(/matrix\(([^)]+)\)/);
      if (!m) return 0;
      const parts = m[1].split(",").map(parseFloat);
      return parts.length === 6 ? parts[4] : parts[12];
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

    function clearTransitionTimer() {
      if (transitionTimer !== null) {
        window.clearTimeout(transitionTimer);
        transitionTimer = null;
      }
    }

    function wrapIfNeeded() {
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
      } else if (physicalIdx < origCount) {
        track.style.transition = "none";
        slides.forEach(function (s) { s.style.transition = "none"; });
        physicalIdx += origCount;
        applyTransform(getStepWidth(), "none");
        setActive(physicalIdx);
        void track.offsetHeight;
        window.requestAnimationFrame(function () {
          slides.forEach(function (s) { s.style.transition = ""; });
        });
      }
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
      if (isPaused || isTransitioning || dragActive) return;
      isTransitioning = true;

      physicalIdx++;
      const stepW = getStepWidth();
      applyTransform(stepW, "transform " + TRANSITION_MS + "ms " + EASING);
      setActive(physicalIdx);

      transitionTimer = window.setTimeout(function () {
        transitionTimer = null;
        wrapIfNeeded();
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
      if (!isTransitioning && !dragActive) scheduleNext();
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

    // ---- Drag / swipe (Pointer Events) ----

    function onPointerDown(e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;

      lastPointerType = e.pointerType || "mouse";
      dragActive = true;
      dragLocked = false;
      dragMoved = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragDeltaX = 0;
      dragStepW = getStepWidth();

      // Interrompt la transition en cours en gelant à la position visuelle actuelle
      clearTransitionTimer();
      dragVisualBase = isTransitioning ? readCurrentTx() : -physicalIdx * dragStepW;
      track.style.transition = "none";
      track.style.transform = "translateX(" + dragVisualBase + "px)";
      isTransitioning = false;

      pause();

      // Empêche la sélection de texte / drag-image natif sur desktop
      if (lastPointerType === "mouse") {
        e.preventDefault();
      }
    }

    function onPointerMove(e) {
      if (!dragActive) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;

      if (!dragLocked) {
        if (Math.abs(dx) < DRAG_LOCK_THRESHOLD && Math.abs(dy) < DRAG_LOCK_THRESHOLD) return;
        if (Math.abs(dx) > Math.abs(dy)) {
          dragLocked = true;
          slider.classList.add("is-dragging");
          try { slider.setPointerCapture(e.pointerId); } catch (_) {}
        } else {
          // Mouvement vertical dominant → on laisse le scroll natif gérer
          dragActive = false;
          track.style.transform = "translateX(" + (-physicalIdx * dragStepW) + "px)";
          track.style.transition = "";
          if (lastPointerType !== "mouse") resume();
          return;
        }
      }

      dragMoved = true;
      dragDeltaX = dx;
      track.style.transform = "translateX(" + (dragVisualBase + dx) + "px)";
    }

    function finishDrag(commit) {
      if (!dragActive) return;
      dragActive = false;
      slider.classList.remove("is-dragging");

      if (!dragLocked) {
        // Pas de drag horizontal engagé : rien à faire
        if (lastPointerType !== "mouse") resume();
        return;
      }

      const stepW = getStepWidth();
      const threshold = stepW * DRAG_COMMIT_RATIO;
      let newIdx = physicalIdx;
      if (commit) {
        if (dragDeltaX <= -threshold) newIdx = physicalIdx + 1;
        else if (dragDeltaX >= threshold) newIdx = physicalIdx - 1;
      }

      physicalIdx = newIdx;
      isTransitioning = true;
      applyTransform(stepW, "transform " + TRANSITION_MS + "ms " + EASING);
      setActive(physicalIdx);

      transitionTimer = window.setTimeout(function () {
        transitionTimer = null;
        wrapIfNeeded();
        isTransitioning = false;
        // Touch/pen : reprise auto. Mouse : géré par mouseleave existant.
        if (lastPointerType !== "mouse") resume();
      }, TRANSITION_MS);

      // Supprime le click qui suit pointerup quand un drag réel a eu lieu
      if (dragMoved) {
        const suppress = function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
        };
        slider.addEventListener("click", suppress, { capture: true, once: true });
        window.setTimeout(function () {
          slider.removeEventListener("click", suppress, true);
        }, 350);
      }
    }

    slider.addEventListener("pointerdown", onPointerDown);
    slider.addEventListener("pointermove", onPointerMove);
    slider.addEventListener("pointerup", function (e) { finishDrag(true); });
    slider.addEventListener("pointercancel", function (e) { finishDrag(false); });

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
