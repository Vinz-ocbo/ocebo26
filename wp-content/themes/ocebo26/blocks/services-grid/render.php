<?php
/**
 * Block: Accès direct — Services
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content (empty for dynamic blocks).
 * @var WP_Block $block      Block instance.
 */

defined('ABSPATH') || exit;

$section_number = esc_html($attributes['sectionNumber'] ?? '2');
$title          = wp_kses_post($attributes['title'] ?? '');
$cards          = $attributes['cards'] ?? [];

if (empty($cards)) {
    return;
}

$arrow_svg = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
?>
<section class="section section--acces-direct" aria-labelledby="bloc2-title">
  <div class="container container--wide">
    <div class="section-header">
      <span class="section-number" aria-hidden="true"><?php echo $section_number; ?></span>
      <h2 id="bloc2-title" class="display-lg"><?php echo $title; ?></h2>
    </div>
    <div class="acces-direct__grid">
      <?php foreach ($cards as $card) :
        $card_title = wp_kses_post($card['title'] ?? '');
        $card_text  = esc_html($card['text'] ?? '');
        $cta_label  = esc_html($card['ctaLabel'] ?? '');
        $cta_url    = esc_url($card['ctaUrl'] ?? '#');
      ?>
      <div class="card-service">
        <div class="card-service__header">
          <h3 class="card-service__title heading-md"><?php echo $card_title; ?></h3>
        </div>
        <hr class="card-service__separator" aria-hidden="true">
        <p class="card-service__text body-md"><?php echo $card_text; ?></p>
        <a href="<?php echo $cta_url; ?>" class="card-service__cta">
          <span><?php echo $cta_label; ?></span>
          <span class="card-service__cta-icon" aria-hidden="true"><?php echo $arrow_svg; ?></span>
        </a>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>
