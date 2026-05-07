/**
 * OCEBO 2026 — Main FX (lazy-loaded bundle)
 *
 * Effets cosmétiques différés au-delà de la fenêtre TBT de Lighthouse :
 *   - Parallax (cards Chiffres clefs)
 *   - DotMesh (canvas particles)
 *   - ScrollLace (SVG laces)
 *
 * Chargé par main.js via injection <script> sur première interaction
 * utilisateur (scroll / touchstart / keydown) ou setTimeout safety.
 * Les 3 inits sont chunkés sur plusieurs idle callbacks pour ne jamais
 * bloquer le main thread plus de ~50ms — la page reste cliquable même
 * pendant que les effets se mettent en place.
 * Skip si prefers-reduced-motion (le loader main.js fait déjà cette
 * check, on la double ici en defense in depth).
 *
 * Vanilla JS — no dependencies.
 */
(function () {
  "use strict";

  function prefersReducedMotion() {
    return window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  if (prefersReducedMotion()) return;

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

    // Animation loop — idle-stop quand toutes les cards ont convergé vers leur cible
    let parallaxRafId = null;
    const SETTLE = 0.05;
    function tick() {
      let stillMoving = false;
      cards.forEach((card) => {
        const s = state.get(card);
        s.x += (s.targetX - s.x) * EASE;
        s.y += (s.targetY - s.y) * EASE;

        if (Math.abs(s.targetX - s.x) > SETTLE || Math.abs(s.targetY - s.y) > SETTLE) {
          stillMoving = true;
        }

        const len = Math.sqrt(s.x * s.x + s.y * s.y);
        if (len > MAX_OFFSET) {
          s.x = (s.x / len) * MAX_OFFSET;
          s.y = (s.y / len) * MAX_OFFSET;
        }

        card.style.transform =
          "translate(" + s.x.toFixed(1) + "px," + s.y.toFixed(1) + "px)";
      });

      if (stillMoving) {
        parallaxRafId = requestAnimationFrame(tick);
      } else {
        parallaxRafId = null;
      }
    }

    function startParallaxTick() {
      if (parallaxRafId === null) parallaxRafId = requestAnimationFrame(tick);
    }

    section.addEventListener("mousemove", startParallaxTick);
    section.addEventListener("touchmove", startParallaxTick, { passive: true });
    section.addEventListener("mouseleave", startParallaxTick);
    section.addEventListener("touchend", startParallaxTick);
  }

  /* ============================================
     INTERACTIVE DOT MESH BACKGROUND (optimized)
     ============================================ */
  function initDotMesh() {
    var canvas = document.getElementById("dot-canvas");
    if (!canvas) return;

    var ctx = canvas.getContext("2d");

    // SPACING + GROWTH sont recalculés dans buildGrid() pour cap dotCount à
    // ~30K même sur des écrans 4K — sinon le rebuild post-resize bloque le
    // main thread plusieurs secondes (Float32Array allocs + repaint full grid).
    var SPACING     = 8;
    var BASE_RADIUS = 0.5;
    var PROXIMITY   = 250;
    var GROWTH      = SPACING / 2 - BASE_RADIUS; // 3.5 — dots never overlap (recalculé en buildGrid)
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

      // Cap dotCount à ~30K via SPACING adaptatif. Sur 1080p (~32K natifs)
      // SPACING reste 8-9, peu perceptible. Sur 4K (~130K natifs sans cap)
      // SPACING monte à ~17 pour limiter le coût de rebuild à ~30K dots.
      var area = canvas.width * canvas.height;
      SPACING = Math.max(8, Math.ceil(Math.sqrt(area / 30000)));
      GROWTH = SPACING / 2 - BASE_RADIUS;

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
    var PULSE_IDLE_DELAY = 500;
    var PULSE_PERIOD     = 3800;
    var PULSE_MIN        = 0.55;
    var PULSE_MAX        = 0.80;
    var PULSE_HOVER_MIN  = 1.10;
    var PULSE_HOVER_MAX  = 1.45;

    function stopPulse() {
      if (pulseRafId !== null) {
        cancelAnimationFrame(pulseRafId);
        pulseRafId = null;
      }
    }

    function startPulse() {
      stopPulse();
      var lastTime = performance.now();
      var phase = 0;
      function pulseStep(now) {
        var dt = now - lastTime;
        lastTime = now;
        var period = hoverActive ? PULSE_PERIOD / 2 : PULSE_PERIOD;
        var lo = hoverActive ? PULSE_HOVER_MIN : PULSE_MIN;
        var hi = hoverActive ? PULSE_HOVER_MAX : PULSE_MAX;
        var mid = (hi + lo) / 2;
        var amp = (hi - lo) / 2;
        phase += (dt / period) * 2 * Math.PI;
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

    var hoverActive = false;

    var ctaSelector = ".btn, .card-service__cta, .card-service";
    document.querySelectorAll(ctaSelector).forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        if (lastCx < 0 || lastCy < 0) return;
        hoverActive = true;
        clearTimeout(idleTimer);
        startPulse();
      });
      el.addEventListener("mouseleave", function () {
        hoverActive = false;
      });
    });

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
      updateNumberHalos(lastCx, lastCy);
      if (hoverActive) {
        startLoop();
      } else {
        handleProximity(lastCx, lastCy, 1);
        startLoop();
        scheduleIdlePulse();
      }
    });

    window.addEventListener("touchmove", function (e) {
      lastCx = e.touches[0].clientX;
      lastCy = e.touches[0].clientY;
      updateNumberHalos(lastCx, lastCy);
      if (hoverActive) {
        startLoop();
      } else {
        handleProximity(lastCx, lastCy, 1);
        startLoop();
        scheduleIdlePulse();
      }
    }, { passive: true });

    var resizeTimer;
    window.addEventListener("resize", function () {
      // Clear immédiat à chaque event : sans ça, pendant un drag de fenêtre
      // la canvas backing store garde ses dimensions originales mais le CSS
      // l'étire à 100% du window — les dots apparaissent déformés.
      // Effacer rend la zone blanche le temps du drag (mieux que stretch).
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Le rebuild lui-même reste débouncé pour éviter de relancer une boucle
      // sur ~30K dots + un canvas fullscreen à chaque event resize du drag.
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
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
        hoverActive = false;
        buildGrid();
        requestAnimationFrame(animate);
      }, 150);
    });

    buildGrid();
    // requestAnimationFrame avant le 1er paint : laisse le browser traiter
    // les events en attente (clics, scrolls) avant d'itérer ~30K dots.
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

    // Mask stops for the progressive tip fade (updated per frame)
    var maskS2 = document.getElementById("lace-mask-s2");
    var maskS3 = document.getElementById("lace-mask-s3");

    var allPaths = [cyanPath, cyanGlow, magPath, magGlow];
    var totalLen = 0;
    var pageH_cached = 0;
    var OFFSET_X = 12;   // small gap between the two laces
    var FEATHER  = 220;  // px over which the drawing tip fades to transparent
    var currentTipY = 0; // animated reveal position (0..pageH)
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

      totalLen = cyanPath.getTotalLength();
      pageH_cached = pageH;
      currentTipY = hasScrolled ? getTargetTipY() : 0;
      applyTipMask(currentTipY);
    }

    function getTargetTipY() {
      var tipY = window.scrollY + window.innerHeight / 2 + driftAmount;
      if (tipY < 0) tipY = 0;
      if (tipY > pageH_cached) tipY = pageH_cached;
      return tipY;
    }

    function applyTipMask(tipY) {
      if (!maskS2 || !maskS3 || pageH_cached <= 0) return;
      var bot = tipY;
      var top = bot - FEATHER;
      if (top < 0) top = 0;
      maskS2.setAttribute("offset", ((top / pageH_cached) * 100).toFixed(3) + "%");
      maskS3.setAttribute("offset", ((bot / pageH_cached) * 100).toFixed(3) + "%");
    }

    function tick() {
      if (driftAmount < MAX_DRIFT) driftAmount += DRIFT_PX;
      var target = getTargetTipY();
      var delta = target - currentTipY;
      var step = delta * EASE;
      if (step > MAX_SPEED) step = MAX_SPEED;
      else if (step < -MAX_SPEED) step = -MAX_SPEED;
      currentTipY += step;
      applyTipMask(currentTipY);

      var stillMoving = Math.abs(delta) > 0.5;
      var stillDrifting = driftAmount < MAX_DRIFT && currentTipY < pageH_cached - 0.5;
      if (stillMoving || stillDrifting) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    }

    // Continuous opacity tied to scroll — no abrupt binary toggles
    function updateWrapOpacity() {
      var y = window.scrollY;
      // Fully invisible under 10px, fully opaque at 110px, smooth fade in-between
      var t = (y - 10) / 100;
      if (t < 0) t = 0;
      if (t > 1) t = 1;
      wrap.style.opacity = t;
      if (t > 0 && !hasScrolled) hasScrolled = true;
    }

    function onScroll() {
      updateWrapOpacity();
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
        var dist = t * pathLen;
        var pt = srcPath.getPointAtLength(dist);
        // Stop the particle once it passes the revealed tip
        if (pt.y > currentTipY) {
          if (circle.parentNode) circle.remove();
          return;
        }
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
     INIT — chunked sur plusieurs idle callbacks
     ============================================ */
  // Chaque init s'exécute dans un idle callback distinct → le browser peut
  // traiter les clics et scrolls utilisateur ENTRE chaque chunk. Sans ce
  // chunking, les 3 inits + le premier paint canvas formaient une long task
  // de 200-500ms qui bloquait l'interactivité de la page.
  function defer(fn, timeout) {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(fn, { timeout: timeout || 1500 });
    } else {
      window.setTimeout(fn, 16); // une frame ~60fps
    }
  }

  defer(function () {
    initParallax();
    defer(function () {
      initDotMesh();
      defer(initScrollLace, 100);
    }, 50);
  }, 30);
})();
