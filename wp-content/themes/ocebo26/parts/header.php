<?php defined('ABSPATH') || exit; ?>
  <a href="#main-content" class="skip-link">Aller au contenu principal</a>

  <!-- HEADER / NAVIGATION -->
  <header class="site-header" role="banner">
    <nav class="nav" aria-label="Navigation principale">
      <div class="nav__inner">
        <a href="<?php echo esc_url(home_url('/')); ?>" class="nav__logo" aria-label="Ocebo — Accueil">
          <span class="nav__logo-text">OCEBO</span>
        </a>

        <ul class="nav__menu" role="menubar">
          <li class="nav__item" role="none">
            <a href="<?php echo esc_url(home_url('/services')); ?>" role="menuitem" class="nav__link" aria-haspopup="true" aria-expanded="false">
              Services
              <svg class="nav__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
            <div class="nav__dropdown" role="menu" aria-label="Sous-menu Services">
              <div class="nav__dropdown-inner">
                <a href="<?php echo esc_url(home_url('/services/sites-applications')); ?>" role="menuitem" class="nav__dropdown-link">
                  <span class="nav__dropdown-title">Sites & Applications web</span>
                  <span class="nav__dropdown-desc">Sites vitrines, e-commerce, applications métier</span>
                </a>
                <a href="<?php echo esc_url(home_url('/services/communication-marketing-digital')); ?>" role="menuitem" class="nav__dropdown-link">
                  <span class="nav__dropdown-title">Communication & Marketing digital</span>
                  <span class="nav__dropdown-desc">Emailing, bannières, social ads, motion design</span>
                </a>
                <a href="<?php echo esc_url(home_url('/services/maintenance-exploitation')); ?>" role="menuitem" class="nav__dropdown-link">
                  <span class="nav__dropdown-title">Maintenance & Exploitation</span>
                  <span class="nav__dropdown-desc">Maintenance technique, évolutions, SEO</span>
                </a>
              </div>
            </div>
          </li>
          <li class="nav__item" role="none">
            <a href="<?php echo esc_url(home_url('/references')); ?>" role="menuitem" class="nav__link">Références</a>
          </li>
          <li class="nav__item" role="none">
            <a href="<?php echo esc_url(home_url('/studio-externe')); ?>" role="menuitem" class="nav__link">Studio externe</a>
          </li>
        </ul>

        <a href="<?php echo esc_url(home_url('/contact')); ?>" class="btn btn--primary btn--sm nav__cta">Nous contacter</a>

        <button class="nav__burger" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="mobile-menu">
          <span class="nav__burger-line"></span>
          <span class="nav__burger-line"></span>
          <span class="nav__burger-line"></span>
        </button>
      </div>
    </nav>

    <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
      <ul class="mobile-menu__list">
        <li><a href="<?php echo esc_url(home_url('/services')); ?>" class="mobile-menu__link">Services</a>
          <ul class="mobile-menu__sub">
            <li><a href="<?php echo esc_url(home_url('/services/sites-applications')); ?>">Sites & Applications web</a></li>
            <li><a href="<?php echo esc_url(home_url('/services/communication-marketing-digital')); ?>">Communication & Marketing digital</a></li>
            <li><a href="<?php echo esc_url(home_url('/services/maintenance-exploitation')); ?>">Maintenance & Exploitation</a></li>
          </ul>
        </li>
        <li><a href="<?php echo esc_url(home_url('/references')); ?>" class="mobile-menu__link">Références</a></li>
        <li><a href="<?php echo esc_url(home_url('/studio-externe')); ?>" class="mobile-menu__link">Studio externe</a></li>
        <li><a href="<?php echo esc_url(home_url('/contact')); ?>" class="mobile-menu__link mobile-menu__link--cta">Nous contacter</a></li>
      </ul>
    </div>
  </header>

  <!-- Interactive dot mesh background -->
  <canvas id="dot-canvas" aria-hidden="true"></canvas>

  <!-- Scroll-driven laces (cyan + magenta) -->
  <div id="lace-wrap" aria-hidden="true">
    <svg id="lace-svg" preserveAspectRatio="none">
      <defs>
        <!-- Cyan gradient: opacity varies 5%–25% along the vertical axis -->
        <linearGradient id="lace-grad-cyan" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="100%">
          <stop offset="0%"   stop-color="#15ffd6" stop-opacity="0.15"/>
          <stop offset="12%"  stop-color="#15ffd6" stop-opacity="0.25"/>
          <stop offset="25%"  stop-color="#15ffd6" stop-opacity="0.10"/>
          <stop offset="40%"  stop-color="#15ffd6" stop-opacity="0.22"/>
          <stop offset="55%"  stop-color="#15ffd6" stop-opacity="0.14"/>
          <stop offset="70%"  stop-color="#15ffd6" stop-opacity="0.25"/>
          <stop offset="85%"  stop-color="#15ffd6" stop-opacity="0.14"/>
          <stop offset="100%" stop-color="#15ffd6" stop-opacity="0.22"/>
        </linearGradient>
        <linearGradient id="lace-grad-cyan-glow" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="100%">
          <stop offset="0%"   stop-color="#15ffd6" stop-opacity="0.04"/>
          <stop offset="12%"  stop-color="#15ffd6" stop-opacity="0.08"/>
          <stop offset="25%"  stop-color="#15ffd6" stop-opacity="0.03"/>
          <stop offset="40%"  stop-color="#15ffd6" stop-opacity="0.07"/>
          <stop offset="55%"  stop-color="#15ffd6" stop-opacity="0.04"/>
          <stop offset="70%"  stop-color="#15ffd6" stop-opacity="0.08"/>
          <stop offset="85%"  stop-color="#15ffd6" stop-opacity="0.04"/>
          <stop offset="100%" stop-color="#15ffd6" stop-opacity="0.07"/>
        </linearGradient>
        <linearGradient id="lace-grad-mag" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="100%">
          <stop offset="0%"   stop-color="#d74ed7" stop-opacity="0.08"/>
          <stop offset="15%"  stop-color="#d74ed7" stop-opacity="0.22"/>
          <stop offset="30%"  stop-color="#d74ed7" stop-opacity="0.10"/>
          <stop offset="45%"  stop-color="#d74ed7" stop-opacity="0.25"/>
          <stop offset="60%"  stop-color="#d74ed7" stop-opacity="0.14"/>
          <stop offset="75%"  stop-color="#d74ed7" stop-opacity="0.22"/>
          <stop offset="88%"  stop-color="#d74ed7" stop-opacity="0.14"/>
          <stop offset="100%" stop-color="#d74ed7" stop-opacity="0.20"/>
        </linearGradient>
        <linearGradient id="lace-grad-mag-glow" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="100%">
          <stop offset="0%"   stop-color="#d74ed7" stop-opacity="0.02"/>
          <stop offset="15%"  stop-color="#d74ed7" stop-opacity="0.07"/>
          <stop offset="30%"  stop-color="#d74ed7" stop-opacity="0.03"/>
          <stop offset="45%"  stop-color="#d74ed7" stop-opacity="0.08"/>
          <stop offset="60%"  stop-color="#d74ed7" stop-opacity="0.04"/>
          <stop offset="75%"  stop-color="#d74ed7" stop-opacity="0.07"/>
          <stop offset="88%"  stop-color="#d74ed7" stop-opacity="0.04"/>
          <stop offset="100%" stop-color="#d74ed7" stop-opacity="0.06"/>
        </linearGradient>
        <!-- Dynamic mask: reveals the lace with a soft fade at the drawing tip.
             Stops are updated per frame from JS. -->
        <linearGradient id="lace-mask-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="100%">
          <stop id="lace-mask-s1" offset="0%"   stop-color="#fff"/>
          <stop id="lace-mask-s2" offset="0%"   stop-color="#fff"/>
          <stop id="lace-mask-s3" offset="0%"   stop-color="#000"/>
          <stop id="lace-mask-s4" offset="100%" stop-color="#000"/>
        </linearGradient>
        <mask id="lace-mask" maskUnits="userSpaceOnUse">
          <rect id="lace-mask-rect" x="0" y="0" width="100%" height="100%" fill="url(#lace-mask-grad)"/>
        </mask>
      </defs>
      <g mask="url(#lace-mask)">
        <!-- Cyan lace -->
        <path id="lace-cyan-glow" fill="none" stroke="url(#lace-grad-cyan-glow)" stroke-width="22" stroke-linecap="round"/>
        <path id="lace-cyan" fill="none" stroke="url(#lace-grad-cyan)" stroke-width="6.6" stroke-linecap="round"/>
        <!-- Magenta lace -->
        <path id="lace-magenta-glow" fill="none" stroke="url(#lace-grad-mag-glow)" stroke-width="20" stroke-linecap="round"/>
        <path id="lace-magenta" fill="none" stroke="url(#lace-grad-mag)" stroke-width="6" stroke-linecap="round"/>
      </g>
    </svg>
  </div>

  <!-- DECORATIVE BACKGROUND (disabled – remove outer comment to restore)
  <div class="bg-effects" aria-hidden="true">
    <div class="bg-effects__glow bg-effects__glow--cyan-cursor"></div>
    <div class="bg-effects__glow bg-effects__glow--magenta"></div>
    <div class="bg-effects__glow bg-effects__glow--yellow"></div>
  </div>
  -->
