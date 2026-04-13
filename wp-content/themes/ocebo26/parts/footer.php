<?php defined('ABSPATH') || exit; ?>
  <footer class="site-footer" role="contentinfo">
    <div class="footer__inner container container--full">
      <p class="footer__copy body-sm">©ocebo</p>
      <p class="footer__legal body-sm"><a href="<?php echo esc_url(home_url('/mentions-legales')); ?>">Mentions légales</a></p>
      <p class="footer__credits body-sm"><a href="<?php echo esc_url(home_url('/politique-confidentialite')); ?>">Politique de confidentialité</a></p>
    </div>
  </footer>

  <?php wp_footer(); ?>
