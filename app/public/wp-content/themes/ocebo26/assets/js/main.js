/**
 * OCEBO 2026 — Main JavaScript
 * Vanilla JS — no dependencies
 */

(function () {
  "use strict";

  /* ============================================
     SCROLL REVEAL (IntersectionObserver)
     ============================================ */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll(
      ".reveal, .reveal-stagger"
    );
    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  /* ============================================
     HEADER SCROLL STATE
     ============================================ */
  function initHeaderScroll() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    let lastScrollY = 0;
    let ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const delta = currentY - lastScrollY;

          header.classList.toggle("is-scrolled", currentY > 50);

          if (delta > 0 && currentY > 100) {
            // Scrolling down
            header.classList.add("is-hidden");
          } else if (delta < -20) {
            // Scrolling up more than 20px
            header.classList.remove("is-hidden");
          }

          lastScrollY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ============================================
     MOBILE MENU
     ============================================ */
  function initMobileMenu() {
    const burger = document.querySelector(".nav__burger");
    const mobileMenu = document.getElementById("mobile-menu");
    if (!burger || !mobileMenu) return;

    burger.addEventListener("click", () => {
      const isOpen = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!isOpen));
      mobileMenu.setAttribute("aria-hidden", String(isOpen));
      document.body.style.overflow = isOpen ? "" : "hidden";
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        burger.getAttribute("aria-expanded") === "true"
      ) {
        burger.setAttribute("aria-expanded", "false");
        mobileMenu.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        burger.focus();
      }
    });
  }

  /* ============================================
     DROPDOWN MENU — KEYBOARD ACCESSIBILITY
     ============================================ */
  function initDropdownKeyboard() {
    const dropdownItems = document.querySelectorAll(
      '.nav__item [aria-haspopup="true"]'
    );

    dropdownItems.forEach((trigger) => {
      trigger.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const expanded = trigger.getAttribute("aria-expanded") === "true";
          trigger.setAttribute("aria-expanded", String(!expanded));
        }
      });

      // Close dropdown on Escape
      const parent = trigger.closest(".nav__item");
      parent.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          trigger.setAttribute("aria-expanded", "false");
          trigger.focus();
        }
      });
    });
  }

  /* ============================================
     ACCORDION ANIMATION (FAQ)
     ============================================ */
  function initAccordions() {
    const accordions = document.querySelectorAll(".accordion");

    accordions.forEach((details) => {
      const summary = details.querySelector(".accordion__header");
      const body = details.querySelector(".accordion__body");
      if (!summary || !body) return;

      let isAnimating = false;

      summary.addEventListener("click", (e) => {
        e.preventDefault();
        if (isAnimating) return;

        if (details.open) {
          // Close
          isAnimating = true;
          const startHeight = details.offsetHeight;
          const endHeight = summary.offsetHeight;

          const anim = details.animate(
            { height: [startHeight + "px", endHeight + "px"] },
            { duration: 300, easing: "ease" }
          );

          anim.onfinish = () => {
            details.open = false;
            isAnimating = false;
            details.style.height = "";
            details.style.overflow = "";
          };

          details.style.overflow = "hidden";
        } else {
          // Open
          details.open = true;
          isAnimating = true;

          const startHeight = summary.offsetHeight;
          const endHeight = details.offsetHeight;

          const anim = details.animate(
            { height: [startHeight + "px", endHeight + "px"] },
            { duration: 300, easing: "ease" }
          );

          details.style.overflow = "hidden";

          anim.onfinish = () => {
            isAnimating = false;
            details.style.height = "";
            details.style.overflow = "";
          };
        }
      });
    });
  }

  /* ============================================
     COUNTER ANIMATION (Chiffres clefs)
     ============================================ */
  function initCounters() {
    const counters = document.querySelectorAll(".card-chiffre");
    if (!counters.length) return;

    function animateCounter(el) {
      const numberEl = el.querySelector(".card-chiffre__number");
      const target = parseInt(el.dataset.target, 10);
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      const duration = 2000;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        numberEl.textContent = prefix + current.toLocaleString("fr-FR") + suffix;

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }

      requestAnimationFrame(update);
    }

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

  /* ============================================
     PARALLAX (Chiffres clefs cards)
     ============================================ */
  function initParallax() {
    const cards = document.querySelectorAll(".card-chiffre");
    if (!cards.length) return;

    const MAX_OFFSET = 80;
    const EASE = 0.08;

    // Store each card's current animated position
    const state = new Map();
    cards.forEach((card) => {
      card.style.transition = "none";
      card.style.willChange = "transform";
      state.set(card, { x: 0, y: 0, targetX: 0, targetY: 0 });
    });

    // On mouse move over the chiffres section, compute repulsion
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

    section.addEventListener("mousemove", (e) => {
      handlePointer(e.clientX, e.clientY);
    });

    section.addEventListener("touchmove", (e) => {
      const t = e.touches[0];
      handlePointer(t.clientX, t.clientY);
    }, { passive: true });

    section.addEventListener("mouseleave", resetTargets);
    section.addEventListener("touchend", resetTargets);

    // Animation loop — lerp toward target
    function tick() {
      cards.forEach((card) => {
        const s = state.get(card);
        s.x += (s.targetX - s.x) * EASE;
        s.y += (s.targetY - s.y) * EASE;

        // Clamp
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

  /* ============================================
     LOGOS SLIDER — Infinite loop + drag
     ============================================ */
  function initLogosSlider() {
    const slider = document.querySelector(".logos-slider");
    const track = document.querySelector(".logos-slider__track");
    if (!slider || !track) return;

    const slides = Array.from(
      track.querySelectorAll(".logos-slider__slide:not([aria-hidden])")
    );
    const gap = 40; // matches --space-5
    let offset = 0;
    let speed = 0.5; // px per frame
    let isDragging = false;
    let dragStartX = 0;
    let dragOffset = 0;
    let rafId = null;

    // Measure one set width (original slides only)
    function getSetWidth() {
      let w = 0;
      slides.forEach((s) => {
        w += s.offsetWidth + gap;
      });
      return w;
    }

    // Auto-scroll tick
    function tick() {
      if (!isDragging) {
        offset -= speed;
      }

      const setW = getSetWidth();
      // Wrap around: when we've scrolled past one full set, reset
      if (offset <= -setW) {
        offset += setW;
      }
      if (offset > 0) {
        offset -= setW;
      }

      track.style.transform = "translateX(" + offset + "px)";
      updateOpacity();
      rafId = requestAnimationFrame(tick);
    }

    // Opacity based on center distance
    function updateOpacity() {
      const sliderRect = slider.getBoundingClientRect();
      const center = sliderRect.left + sliderRect.width / 2;
      const allSlides = track.querySelectorAll(".logos-slider__slide");

      allSlides.forEach((slide) => {
        const slideRect = slide.getBoundingClientRect();
        const slideCenter = slideRect.left + slideRect.width / 2;
        const distance = Math.abs(center - slideCenter);
        const maxDist = sliderRect.width / 2;

        slide.classList.remove("is-center", "is-near");

        if (distance < 80) {
          slide.classList.add("is-center");
        } else if (distance < maxDist * 0.4) {
          slide.classList.add("is-near");
        }
      });
    }

    // Drag handlers
    function onDown(e) {
      isDragging = true;
      dragStartX = e.clientX ?? e.touches[0].clientX;
      dragOffset = offset;
      slider.classList.add("is-dragging");
      e.preventDefault();
    }

    function onMove(e) {
      if (!isDragging) return;
      const x = e.clientX ?? e.touches[0].clientX;
      offset = dragOffset + (x - dragStartX);
    }

    function onUp() {
      if (!isDragging) return;
      isDragging = false;
      slider.classList.remove("is-dragging");
    }

    slider.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    slider.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);

    // Pause auto-scroll on hover (but allow drag)
    slider.addEventListener("mouseenter", () => {
      speed = 0;
    });
    slider.addEventListener("mouseleave", () => {
      speed = 0.5;
    });

    // Disable CSS animation — we drive everything from JS
    track.style.animation = "none";
    rafId = requestAnimationFrame(tick);
  }

  /* ============================================
     ADD REVEAL CLASSES TO SECTIONS
     ============================================ */
  function addRevealClasses() {
    // Section headers
    document.querySelectorAll(
      ".hero__content, .bloc-liste__header, .section-header, .contact__inner > h2"
    ).forEach((el) => el.classList.add("reveal"));

    // Stagger grids
    document.querySelectorAll(
      ".acces-direct__grid, .pourquoi__list, .chiffres__grid, .faq__list"
    ).forEach((el) => el.classList.add("reveal-stagger"));

    // Individual reveals
    document.querySelectorAll(
      ".bloc-liste__body, .contact-form, .logos-slider, .logos__desc"
    ).forEach((el) => el.classList.add("reveal"));
  }

  /* ============================================
     INTERACTIVE DOT MESH BACKGROUND (optimized)
     ============================================ */
  function initDotMesh() {
    var canvas = document.getElementById("dot-canvas");
    if (!canvas) return;

    var ctx = canvas.getContext("2d");

    var SPACING     = 8;
    var BASE_RADIUS = 0.5;
    var PROXIMITY   = 250;
    var GROWTH      = SPACING / 2 - BASE_RADIUS; // 3.5 — dots never overlap
    var EASE        = 0.15;
    var BASE_ALPHA  = 0.12;
    var ACTIVE_EXTRA_ALPHA = 0.30;

    // Pre-build a palette of 32 steps (white → magenta) with matching alpha
    var PALETTE_STEPS = 32;
    var palette = new Array(PALETTE_STEPS);
    for (var s = 0; s < PALETTE_STEPS; s++) {
      var t = s / (PALETTE_STEPS - 1);
      var cr = ~~(255 + (215 - 255) * t);
      var cg = ~~(255 + (78  - 255) * t);
      var cb = ~~(255 + (215 - 255) * t);
      var a  = (BASE_ALPHA + t * ACTIVE_EXTRA_ALPHA).toFixed(3);
      palette[s] = "rgba(" + cr + "," + cg + "," + cb + "," + a + ")";
    }

    // Violet style for touched-but-inactive dots (base size, magenta color)
    var TOUCHED_STYLE = "rgba(215,78,215," + BASE_ALPHA.toFixed(3) + ")";

    // Dot data stored in flat typed arrays for cache performance
    var dotX, dotY, dotR, dotGR, dotTouched, dotCount;
    var cols;

    function buildGrid() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;

      cols = Math.ceil(canvas.width / SPACING) + 1;
      var rows = Math.ceil(canvas.height / SPACING) + 1;
      dotCount = cols * rows;

      dotX  = new Float32Array(dotCount);
      dotY  = new Float32Array(dotCount);
      dotR  = new Float32Array(dotCount);
      dotGR = new Float32Array(dotCount);
      dotTouched = new Uint8Array(dotCount); // 0 = never touched, 1 = touched

      for (var i = 0; i < dotCount; i++) {
        dotX[i] = (i % cols) * SPACING;
        dotY[i] = ~~(i / cols) * SPACING;
        dotR[i] = BASE_RADIUS;
        dotGR[i] = 0;
      }
    }

    // ---- Render: batch inactive dots, draw active ones per-palette step ----
    var ACTIVE_THRESHOLD = BASE_RADIUS + 0.05;
    var SETTLE_EPSILON  = 0.01;

    // Pre-allocated scratch buffers (reused across frames — no per-frame GC churn)
    var activeDots = [];
    var buckets = new Array(PALETTE_STEPS);
    for (var b0 = 0; b0 < PALETTE_STEPS; b0++) buckets[b0] = [];

    // rAF is only scheduled while something is actually moving. When everything
    // has eased to its target, the loop stops and the canvas keeps its last frame.
    var running = false;

    function startLoop() {
      if (running) return;
      running = true;
      requestAnimationFrame(animate);
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      activeDots.length = 0;
      for (var b1 = 0; b1 < PALETTE_STEPS; b1++) buckets[b1].length = 0;

      var hasTouchedInactive = false;
      var anyTransitioning = false;

      // Pass 1: advance radii, categorize, draw untouched-inactive (white base) in one path
      ctx.fillStyle = palette[0];
      ctx.beginPath();

      for (var i = 0; i < dotCount; i++) {
        var target = BASE_RADIUS + dotGR[i];
        var delta  = target - dotR[i];
        if (delta > SETTLE_EPSILON || delta < -SETTLE_EPSILON) {
          dotR[i] += delta * EASE;
          anyTransitioning = true;
        } else {
          dotR[i] = target;
        }

        if (dotR[i] > ACTIVE_THRESHOLD) {
          activeDots.push(i);
        } else if (dotTouched[i]) {
          hasTouchedInactive = true;
        } else {
          ctx.moveTo(dotX[i] + BASE_RADIUS, dotY[i]);
          ctx.arc(dotX[i], dotY[i], BASE_RADIUS, 0, 6.2832);
        }
      }
      ctx.fill();

      // Pass 2: touched-but-settled dots (magenta trail)
      if (hasTouchedInactive) {
        ctx.fillStyle = TOUCHED_STYLE;
        ctx.beginPath();
        for (var t1 = 0; t1 < dotCount; t1++) {
          if (dotTouched[t1] && dotR[t1] <= ACTIVE_THRESHOLD) {
            ctx.moveTo(dotX[t1] + BASE_RADIUS, dotY[t1]);
            ctx.arc(dotX[t1], dotY[t1], BASE_RADIUS, 0, 6.2832);
          }
        }
        ctx.fill();
      }

      // Pass 3: active dots grouped by palette bucket
      var aLen = activeDots.length;
      if (aLen > 0) {
        for (var j = 0; j < aLen; j++) {
          var idx = activeDots[j];
          var tt = (dotR[idx] - BASE_RADIUS) / GROWTH;
          if (tt > 1) tt = 1;
          buckets[~~(tt * (PALETTE_STEPS - 1))].push(idx);
        }
        for (var b2 = 0; b2 < PALETTE_STEPS; b2++) {
          var bucket = buckets[b2];
          var bLen = bucket.length;
          if (bLen === 0) continue;
          ctx.fillStyle = palette[b2];
          ctx.beginPath();
          for (var k = 0; k < bLen; k++) {
            var di = bucket[k];
            ctx.moveTo(dotX[di] + dotR[di], dotY[di]);
            ctx.arc(dotX[di], dotY[di], dotR[di], 0, 6.2832);
          }
          ctx.fill();
        }
      }

      if (anyTransitioning) {
        requestAnimationFrame(animate);
      } else {
        running = false;
      }
    }

    // ---- Proximity: only check dots in cursor's neighbourhood ----
    // pulse multiplier: 1 = full growth, <1 = dimmed (used for idle pulsation)
    function handleProximity(cx, cy, pulse) {
      if (pulse == null) pulse = 1;

      var colMin = Math.max(0, ~~((cx - PROXIMITY) / SPACING) - 1);
      var colMax = Math.min(cols - 1, ~~((cx + PROXIMITY) / SPACING) + 1);
      var rowMin = Math.max(0, ~~((cy - PROXIMITY) / SPACING) - 1);
      var rowMax = Math.min(~~((canvas.height) / SPACING) + 1, ~~((cy + PROXIMITY) / SPACING) + 1);
      var proxSq = PROXIMITY * PROXIMITY;

      if (handleProximity._prevIndices) {
        var prev = handleProximity._prevIndices;
        for (var p = 0; p < prev.length; p++) {
          dotGR[prev[p]] = 0;
        }
      }

      var touched = [];

      for (var row = rowMin; row <= rowMax; row++) {
        var base = row * cols;
        for (var col = colMin; col <= colMax; col++) {
          var i = base + col;
          if (i >= dotCount) continue;

          var dx = dotX[i] - cx;
          var dy = dotY[i] - cy;
          var distSq = dx * dx + dy * dy;

          if (distSq < proxSq) {
            var dist = Math.sqrt(distSq);
            var factor = 1 - dist / PROXIMITY;
            var g = factor * GROWTH * pulse;
            dotGR[i] = g > 0 ? g : 0;
            dotTouched[i] = 1;
            touched.push(i);
          }
        }
      }

      handleProximity._prevIndices = touched;
    }
    handleProximity._prevIndices = null;

    // ---- Idle pulsation: when cursor is stationary, gently breathe the halo ----
    var lastCx = -1, lastCy = -1;
    var idleTimer = null;
    var pulseRafId = null;
    var pulseStart = 0;
    var PULSE_IDLE_DELAY = 500;  // ms of stillness before pulse starts
    var PULSE_PERIOD     = 3800; // ms per full breath cycle (slow)
    var PULSE_MIN        = 0.725; // scale at the "shrink" bottom (halved drop)
    var PULSE_MAX        = 1.0;   // scale at the "expand" peak

    function stopPulse() {
      if (pulseRafId !== null) {
        cancelAnimationFrame(pulseRafId);
        pulseRafId = null;
      }
    }

    function startPulse() {
      stopPulse();
      pulseStart = performance.now();
      var amp = (PULSE_MAX - PULSE_MIN) / 2;
      var mid = (PULSE_MAX + PULSE_MIN) / 2;
      function pulseStep(now) {
        var phase = ((now - pulseStart) / PULSE_PERIOD) * 2 * Math.PI;
        // start near max so transition from active state is smooth
        var pulse = mid + amp * Math.cos(phase);
        handleProximity(lastCx, lastCy, pulse);
        startLoop();
        pulseRafId = requestAnimationFrame(pulseStep);
      }
      pulseRafId = requestAnimationFrame(pulseStep);
    }

    function scheduleIdlePulse() {
      clearTimeout(idleTimer);
      stopPulse();
      idleTimer = setTimeout(startPulse, PULSE_IDLE_DELAY);
    }

    // ---- Section-number halo proximity (viewport-relative) ----
    var sectionNumberEls = [];
    function refreshSectionNumbers() {
      sectionNumberEls = Array.prototype.slice.call(
        document.querySelectorAll(".section-number")
      );
    }
    refreshSectionNumbers();

    function updateNumberHalos(cx, cy) {
      var proxSq = PROXIMITY * PROXIMITY;
      for (var n = 0; n < sectionNumberEls.length; n++) {
        var el = sectionNumberEls[n];
        var rect = el.getBoundingClientRect();
        var mx = rect.left + rect.width / 2;
        var my = rect.top + rect.height / 2;
        var dx = mx - cx;
        var dy = my - cy;
        if (dx * dx + dy * dy < proxSq) {
          el.classList.add("is-haloed");
        } else {
          el.classList.remove("is-haloed");
        }
      }
    }

    window.addEventListener("mousemove", function (e) {
      lastCx = e.clientX;
      lastCy = e.clientY;
      handleProximity(lastCx, lastCy, 1);
      updateNumberHalos(lastCx, lastCy);
      startLoop();
      scheduleIdlePulse();
    });

    window.addEventListener("touchmove", function (e) {
      lastCx = e.touches[0].clientX;
      lastCy = e.touches[0].clientY;
      handleProximity(lastCx, lastCy, 1);
      updateNumberHalos(lastCx, lastCy);
      startLoop();
      scheduleIdlePulse();
    }, { passive: true });

    var resizeTimer;
    window.addEventListener("resize", function () {
      // Immediate reset: wipe halo + any in-flight growth so dots return to base size
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (dotR) {
        for (var r = 0; r < dotCount; r++) {
          dotR[r] = BASE_RADIUS;
          dotGR[r] = 0;
          dotTouched[r] = 0;
        }
      }
      handleProximity._prevIndices = null;
      stopPulse();
      clearTimeout(idleTimer);

      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        buildGrid();
        animate(); // one frame to repaint base grid at new size
      }, 150);
    });

    buildGrid();
    animate(); // single initial paint; rAF won't reschedule because nothing is transitioning
  }

  /* ============================================
     SCROLL-DRIVEN LACES (cyan + magenta)
     ============================================ */
  function initScrollLace() {
    var wrap = document.getElementById("lace-wrap");
    var svg = document.getElementById("lace-svg");
    var cyanPath = document.getElementById("lace-cyan");
    var cyanGlow = document.getElementById("lace-cyan-glow");
    var magPath  = document.getElementById("lace-magenta");
    var magGlow  = document.getElementById("lace-magenta-glow");
    if (!wrap || !svg || !cyanPath || !magPath) return;

    var allPaths = [cyanPath, cyanGlow, magPath, magGlow];
    var totalLen = 0;
    var OFFSET_X = 12; // small gap between the two laces
    var currentOffset = 0;
    var rafId = null;
    var MAX_SPEED = 80;   // max px per frame (cap)
    var EASE = 0.12;      // lerp factor — lower = smoother ease-out
    var DRIFT_PX = 0.15;  // continuous downward drift (~9px/s @ 60fps)
    var MAX_DRIFT = 300;  // cap drift so scroll-up can retract the lace
    var driftAmount = 0;
    var hasScrolled = false;

    // Deterministic pseudo-random in [0,1) from an integer seed
    function psr(n) {
      var x = Math.sin(n * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    }

    function buildBezier(points) {
      var d = "M " + points[0].x + " " + points[0].y;
      for (var i = 1; i < points.length; i++) {
        var prev = points[i - 1];
        var curr = points[i];
        var dy = (curr.y - prev.y) * 0.5;
        d += " C " + prev.x + " " + (prev.y + dy) + " " + curr.x + " " + (curr.y - dy) + " " + curr.x + " " + curr.y;
      }
      return d;
    }

    function buildPath() {
      var pageH = document.documentElement.scrollHeight;
      var pageW = document.documentElement.clientWidth;
      var cx = pageW / 2;
      var margin = 60; // min distance from viewport edges

      wrap.style.height = pageH + "px";
      svg.setAttribute("viewBox", "0 0 " + pageW + " " + pageH);

      // Update gradient y2 to match page height
      var grads = svg.querySelectorAll("linearGradient[gradientUnits]");
      grads.forEach(function (g) { g.setAttribute("y2", pageH); });

      // Collect section midpoints
      var sects = document.querySelectorAll(".section");
      var sections = [];
      sects.forEach(function (s) {
        var rect = s.getBoundingClientRect();
        sections.push({ mid: rect.top + window.scrollY + rect.height / 2 });
      });

      // Max 200px beyond the widest content block (1090px / 2 + 200 = 745px)
      var maxAmplitude = 745;
      var amplitude = Math.min(maxAmplitude, (pageW / 2) - margin);

      // Build waypoints for cyan with variable amplitude and vertical shift
      // so turns aren't all aligned horizontally
      var cyanPts = [{ x: cx, y: 0 }];
      for (var i = 0; i < sections.length; i++) {
        var side = (i % 2 === 0) ? -1 : 1;
        var ampFactor = 0.5 + psr(i + 1) * 0.5;         // 0.5..1.0
        var yShift    = (psr(i * 2 + 3) - 0.5) * 140;   // ±70px
        cyanPts.push({
          x: cx + side * amplitude * ampFactor,
          y: sections[i].mid + yShift
        });
      }
      cyanPts.push({ x: cx, y: pageH });

      // Magenta: same shape, slight horizontal offset
      var magPts = cyanPts.map(function (p) {
        return { x: p.x + OFFSET_X, y: p.y };
      });

      var dCyan = buildBezier(cyanPts);
      var dMag  = buildBezier(magPts);

      cyanPath.setAttribute("d", dCyan);
      cyanGlow.setAttribute("d", dCyan);
      magPath.setAttribute("d", dMag);
      magGlow.setAttribute("d", dMag);

      // Set up dash — include a fade gap for progressive tip
      totalLen = cyanPath.getTotalLength();
      allPaths.forEach(function (p) {
        p.style.strokeDasharray = totalLen;
      });
      currentOffset = hasScrolled ? getTargetOffset() : totalLen;
      applyOffset(currentOffset);
    }

    function getTargetOffset() {
      var pageH = document.documentElement.scrollHeight;
      var tipY = window.scrollY + window.innerHeight / 2 + driftAmount;
      var progress = Math.max(0, Math.min(1, tipY / pageH));
      return totalLen * (1 - progress);
    }

    function applyOffset(v) {
      for (var i = 0; i < allPaths.length; i++) {
        allPaths[i].style.strokeDashoffset = v;
      }
    }

    function tick() {
      if (driftAmount < MAX_DRIFT) driftAmount += DRIFT_PX;
      var target = getTargetOffset();
      var delta = target - currentOffset;
      var step = delta * EASE;
      if (step > MAX_SPEED) step = MAX_SPEED;
      else if (step < -MAX_SPEED) step = -MAX_SPEED;
      currentOffset += step;
      applyOffset(currentOffset);

      // Keep looping while we're still moving toward the target OR drifting forward
      var stillMoving = Math.abs(delta) > 0.5;
      var stillDrifting = driftAmount < MAX_DRIFT && currentOffset > 0.5;
      if (stillMoving || stillDrifting) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    }

    function onScroll() {
      var y = window.scrollY;
      if (!hasScrolled && y > 20) {
        hasScrolled = true;
        wrap.classList.add("is-active");
      } else if (hasScrolled && y < 5) {
        // Back at top — fade out and reset so the lace re-appears fresh next scroll
        hasScrolled = false;
        wrap.classList.remove("is-active");
        driftAmount = 0;
        currentOffset = totalLen;
        applyOffset(currentOffset);
      }
      if (rafId === null) rafId = requestAnimationFrame(tick);
    }

    // ---- Luminous particles traveling along the path ----
    function spawnParticle() {
      if (!hasScrolled || totalLen === 0) {
        setTimeout(spawnParticle, 1500);
        return;
      }
      var useCyan = Math.random() < 0.5;
      var color = useCyan ? "#15ffd6" : "#d74ed7";
      var srcPath = useCyan ? cyanPath : magPath;
      var pathLen = srcPath.getTotalLength();
      if (pathLen === 0) {
        setTimeout(spawnParticle, 1500);
        return;
      }

      var ns = "http://www.w3.org/2000/svg";
      var circle = document.createElementNS(ns, "circle");
      circle.setAttribute("r", "1.5");
      circle.setAttribute("fill", color);
      circle.style.filter =
        "drop-shadow(0 0 6px " + color + ") drop-shadow(0 0 2px " + color + ")";
      svg.appendChild(circle);

      var duration = 5200 + Math.random() * 2800; // 5.2–8s (half-speed)
      var startTime = performance.now();
      var enteredViewport = false;
      var fadeStart = 0;
      var FADE_DUR = 600;

      function step(now) {
        var t = (now - startTime) / duration;
        if (t >= 1) {
          if (circle.parentNode) circle.remove();
          return;
        }
        var drawnLen = totalLen - currentOffset;
        var dist = t * pathLen;
        if (dist > drawnLen) {
          if (circle.parentNode) circle.remove();
          return;
        }
        var pt = srcPath.getPointAtLength(dist);
        circle.setAttribute("cx", pt.x);
        circle.setAttribute("cy", pt.y);

        // Detect first entry into viewport and schedule a random fade-out
        if (!enteredViewport) {
          var vTop = window.scrollY;
          var vBot = vTop + window.innerHeight;
          if (pt.y >= vTop && pt.y <= vBot) {
            enteredViewport = true;
            fadeStart = now + 400 + Math.random() * 1800; // 0.4–2.2s delay
          }
        }

        var op = 1;
        if (t < 0.1) op = t / 0.1; // gentle fade-in at spawn
        if (enteredViewport && now >= fadeStart) {
          var ft = (now - fadeStart) / FADE_DUR;
          if (ft >= 1) {
            if (circle.parentNode) circle.remove();
            return;
          }
          op = Math.min(op, 1 - ft);
        }
        circle.setAttribute("opacity", op.toFixed(2));
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);

      var nextDelay = 3000 + Math.random() * 3000; // 3–6s
      setTimeout(spawnParticle, nextDelay);
    }
    setTimeout(spawnParticle, 3000 + Math.random() * 3000);

    buildPath();

    window.addEventListener("scroll", onScroll, { passive: true });

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        buildPath();
        onScroll();
      }, 200);
    });
  }


  /* ============================================
     HEADING LETTER REVEAL (H1 / H2)
     Inspired by Tobias Ahlin's "ml10" effect: each letter rotates
     in on Y-axis with a 45ms stagger when its heading enters view.
     Pure CSS transitions — no animation library.
     ============================================ */
  function initHeadingLetterReveal() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var headings = document.querySelectorAll("h1, h2");
    if (!headings.length) return;

    for (var i = 0; i < headings.length; i++) {
      wrapHeadingLetters(headings[i]);
    }

    if (!("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(
      function (entries) {
        for (var k = 0; k < entries.length; k++) {
          if (!entries[k].isIntersecting) continue;
          var t = entries[k].target;
          io.unobserve(t);
          // Prepare (hidden state) then reveal on next frame so the transition plays.
          t.classList.add("letters-prepared");
          void t.offsetWidth;
          requestAnimationFrame(function (el) {
            return function () { el.classList.add("is-letters-visible"); };
          }(t));
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    for (var m = 0; m < headings.length; m++) io.observe(headings[m]);
  }

  function wrapHeadingLetters(heading) {
    // Skip if already wrapped
    if (heading.getAttribute("data-letters-wrapped")) return;

    // Preserve accessible text (letters-as-spans can confuse some screen readers)
    if (!heading.hasAttribute("aria-label")) {
      var label = (heading.innerText || heading.textContent || "").replace(/\s+/g, " ").trim();
      if (label) heading.setAttribute("aria-label", label);
    }

    var letterIndex = 0;

    function walk(node) {
      var children = Array.prototype.slice.call(node.childNodes);
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child.nodeType === 3) {
          var text = child.nodeValue;
          if (!text) continue;
          var frag = document.createDocumentFragment();
          for (var c = 0; c < text.length; c++) {
            var ch = text.charAt(c);
            if (ch === " " || ch === "\u00a0") {
              frag.appendChild(document.createTextNode(ch));
            } else {
              var span = document.createElement("span");
              span.className = "letter";
              span.setAttribute("aria-hidden", "true");
              span.style.transitionDelay = (letterIndex * 45) + "ms";
              span.textContent = ch;
              frag.appendChild(span);
              letterIndex++;
            }
          }
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          walk(child);
        }
      }
    }

    walk(heading);
    heading.setAttribute("data-letters-wrapped", "1");
  }

  /* ============================================
     INIT
     ============================================ */
  function init() {
    initDotMesh();
    addRevealClasses();
    initScrollReveal();
    initHeaderScroll();
    initMobileMenu();
    initDropdownKeyboard();
    initAccordions();
    initCounters();
    initParallax();
    initLogosSlider();
    initScrollLace();
    initHeadingLetterReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
