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
    var EASE        = 0.04;
    var BASE_ALPHA  = 0.12;
    var ACTIVE_EXTRA_ALPHA = 0.35;

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

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "overlay";

      // 1) Batch inactive dots: white (untouched) vs violet (touched)
      var activeDots = [];
      ctx.fillStyle = palette[0];
      ctx.beginPath();
      var hasTouchedInactive = false;

      for (var i = 0; i < dotCount; i++) {
        dotR[i] += ((BASE_RADIUS + dotGR[i]) - dotR[i]) * EASE;

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

      // 1b) Batch touched-but-inactive dots in violet
      if (hasTouchedInactive) {
        ctx.fillStyle = TOUCHED_STYLE;
        ctx.beginPath();
        for (var i = 0; i < dotCount; i++) {
          if (dotTouched[i] && dotR[i] <= ACTIVE_THRESHOLD) {
            ctx.moveTo(dotX[i] + BASE_RADIUS, dotY[i]);
            ctx.arc(dotX[i], dotY[i], BASE_RADIUS, 0, 6.2832);
          }
        }
        ctx.fill();
      }

      // 2) Draw active dots grouped by palette bucket
      if (activeDots.length > 0) {
        // Sort into palette buckets
        var buckets = new Array(PALETTE_STEPS);
        for (var b = 0; b < PALETTE_STEPS; b++) buckets[b] = [];

        for (var j = 0; j < activeDots.length; j++) {
          var idx = activeDots[j];
          var t = (dotR[idx] - BASE_RADIUS) / GROWTH;
          if (t > 1) t = 1;
          var bucket = ~~(t * (PALETTE_STEPS - 1));
          buckets[bucket].push(idx);
        }

        // One beginPath + fill per non-empty bucket
        for (var b = 0; b < PALETTE_STEPS; b++) {
          if (buckets[b].length === 0) continue;
          ctx.fillStyle = palette[b];
          ctx.beginPath();
          for (var k = 0; k < buckets[b].length; k++) {
            var idx = buckets[b][k];
            ctx.moveTo(dotX[idx] + dotR[idx], dotY[idx]);
            ctx.arc(dotX[idx], dotY[idx], dotR[idx], 0, 6.2832);
          }
          ctx.fill();
        }
      }

      requestAnimationFrame(animate);
    }

    // ---- Proximity: only check dots in cursor's neighbourhood ----
    function handleProximity(cx, cy) {
      // Determine column/row range to scan
      var colMin = Math.max(0, ~~((cx - PROXIMITY) / SPACING) - 1);
      var colMax = Math.min(cols - 1, ~~((cx + PROXIMITY) / SPACING) + 1);
      var rowMin = Math.max(0, ~~((cy - PROXIMITY) / SPACING) - 1);
      var rowMax = Math.min(~~((canvas.height) / SPACING) + 1, ~~((cy + PROXIMITY) / SPACING) + 1);
      var proxSq = PROXIMITY * PROXIMITY;

      // Reset all dots first (only previous active zone needs it,
      // but resetting the local neighbourhood is fast enough)
      // We track previous zone to reset it
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
            var g = factor * GROWTH;
            dotGR[i] = g > 0 ? g : 0;
            dotTouched[i] = 1;
            touched.push(i);
          }
        }
      }

      handleProximity._prevIndices = touched;
    }
    handleProximity._prevIndices = null;

    window.addEventListener("mousemove", function (e) {
      handleProximity(e.clientX, e.clientY);
    });

    window.addEventListener("touchmove", function (e) {
      handleProximity(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildGrid, 150);
    });

    buildGrid();
    requestAnimationFrame(animate);
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

      // Build waypoints for cyan
      var cyanPts = [{ x: cx, y: 0 }];
      for (var i = 0; i < sections.length; i++) {
        var side = (i % 2 === 0) ? -1 : 1;
        cyanPts.push({ x: cx + side * amplitude, y: sections[i].mid });
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
        // dash = solid + transparent gap (for fade effect the gradient mask handles it)
        p.style.strokeDasharray = totalLen;
        p.style.strokeDashoffset = totalLen;
      });
    }

    function onScroll() {
      var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      var progress = window.scrollY / maxScroll;
      var offset = totalLen * (1 - progress);

      allPaths.forEach(function (p) {
        p.style.strokeDashoffset = offset;
      });
    }

    buildPath();
    onScroll();

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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
