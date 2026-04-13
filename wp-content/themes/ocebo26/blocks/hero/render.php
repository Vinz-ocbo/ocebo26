<?php
/**
 * Block: Hero — Accueil
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content (empty for dynamic blocks).
 * @var WP_Block $block      Block instance.
 */

defined('ABSPATH') || exit;

$section_number     = esc_html($attributes['sectionNumber'] ?? '0');
$title              = wp_kses_post($attributes['title'] ?? '');
$text               = esc_html($attributes['text'] ?? '');
$cta_primary_label  = esc_html($attributes['ctaPrimaryLabel'] ?? '');
$cta_primary_url    = esc_url($attributes['ctaPrimaryUrl'] ?? '/contact');
$cta_secondary_label = esc_html($attributes['ctaSecondaryLabel'] ?? '');
$cta_secondary_url  = esc_url($attributes['ctaSecondaryUrl'] ?? '/references');

$arrow_svg = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
?>
<section class="hero section" aria-labelledby="hero-title">
  <div class="hero__inner container">
    <div class="hero__content">
      <div class="section-header">
        <span class="section-number" aria-hidden="true"><?php echo $section_number; ?></span>
        <h1 id="hero-title" class="hero__title display-xl"><?php echo $title; ?></h1>
      </div>
      <div class="hero__body">
        <p class="hero__text body-lg"><?php echo $text; ?></p>
        <div class="hero__ctas">
          <a href="<?php echo $cta_primary_url; ?>" class="btn btn--primary">
            <?php echo $cta_primary_label; ?>
            <span class="btn__icon-right" aria-hidden="true"><?php echo $arrow_svg; ?></span>
          </a>
          <a href="<?php echo $cta_secondary_url; ?>" class="btn btn--secondary">
            <?php echo $cta_secondary_label; ?>
            <span class="btn__icon-right btn__icon-right--accent" aria-hidden="true"><?php echo $arrow_svg; ?></span>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
