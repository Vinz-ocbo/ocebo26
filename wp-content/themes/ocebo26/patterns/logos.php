<?php
defined('ABSPATH') || exit;
$img = esc_url(get_template_directory_uri() . '/assets/img/logos');
?>
    <!-- BLOC 5 — LOGOS / CONFIANCE -->
    <section class="section section--logos" aria-labelledby="bloc5-title">
      <div class="container container--wide">
        <div class="section-header">
          <span class="section-number" aria-hidden="true">4</span>
          <h2 id="bloc5-title" class="display-lg">Ils nous font <em class="text-cyan">confiance</em></h2>
        </div>
        <p class="logos__desc body-md section-body-indent">Cosmétique, automobile, pharma, grande distribution, industrie, secteur public : on s'adapte à tous les univers.</p>
        <div class="logos-slider" aria-label="Logos de nos clients">
          <div class="logos-slider__track">
            <div class="logos-slider__slide"><img src="<?php echo $img; ?>/chanel.svg" alt="Chanel" width="120" height="60" loading="lazy"></div>
            <div class="logos-slider__slide"><img src="<?php echo $img; ?>/hermes.svg" alt="Hermès" width="120" height="60" loading="lazy"></div>
            <div class="logos-slider__slide"><img src="<?php echo $img; ?>/gucci.svg" alt="Gucci" width="120" height="60" loading="lazy"></div>
            <div class="logos-slider__slide"><img src="<?php echo $img; ?>/clarins.svg" alt="Clarins" width="120" height="60" loading="lazy"></div>
            <div class="logos-slider__slide"><img src="<?php echo $img; ?>/bnp.svg" alt="BNP Paribas" width="120" height="60" loading="lazy"></div>
            <div class="logos-slider__slide"><img src="<?php echo $img; ?>/netflix.svg" alt="Netflix" width="120" height="60" loading="lazy"></div>
            <div class="logos-slider__slide"><img src="<?php echo $img; ?>/konbini.svg" alt="Konbini" width="120" height="60" loading="lazy"></div>
            <div class="logos-slider__slide"><img src="<?php echo $img; ?>/total.svg" alt="TotalEnergies" width="120" height="60" loading="lazy"></div>
            <!-- Duplicated for infinite loop -->
            <div class="logos-slider__slide" aria-hidden="true"><img src="<?php echo $img; ?>/chanel.svg" alt="" width="120" height="60" loading="lazy"></div>
            <div class="logos-slider__slide" aria-hidden="true"><img src="<?php echo $img; ?>/hermes.svg" alt="" width="120" height="60" loading="lazy"></div>
            <div class="logos-slider__slide" aria-hidden="true"><img src="<?php echo $img; ?>/gucci.svg" alt="" width="120" height="60" loading="lazy"></div>
            <div class="logos-slider__slide" aria-hidden="true"><img src="<?php echo $img; ?>/clarins.svg" alt="" width="120" height="60" loading="lazy"></div>
            <div class="logos-slider__slide" aria-hidden="true"><img src="<?php echo $img; ?>/bnp.svg" alt="" width="120" height="60" loading="lazy"></div>
            <div class="logos-slider__slide" aria-hidden="true"><img src="<?php echo $img; ?>/netflix.svg" alt="" width="120" height="60" loading="lazy"></div>
            <div class="logos-slider__slide" aria-hidden="true"><img src="<?php echo $img; ?>/konbini.svg" alt="" width="120" height="60" loading="lazy"></div>
            <div class="logos-slider__slide" aria-hidden="true"><img src="<?php echo $img; ?>/total.svg" alt="" width="120" height="60" loading="lazy"></div>
          </div>
        </div>
      </div>
    </section>
