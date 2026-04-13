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

  <!-- DECORATIVE BACKGROUND -->
  <div class="bg-effects" aria-hidden="true">
    <div class="bg-effects__glow bg-effects__glow--cyan"></div>
    <div class="bg-effects__glow bg-effects__glow--magenta"></div>
    <div class="bg-effects__glow bg-effects__glow--yellow"></div>
  </div>
