<?php
/**
 * Block: Liste avancée (formerly Pourquoi Ocebo)
 *
 * @package ocebo26
 */

defined( 'ABSPATH' ) || exit;

$section_number = esc_html( $attributes['sectionNumber'] ?? '3' );
$title          = wp_kses_post( $attributes['title'] ?? '' );
$items          = $attributes['items'] ?? [];

$arrow_svg = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
?>
<section class="section section--pourquoi" aria-labelledby="bloc3-title">
  <div class="container container--wide">
    <div class="section-header">
      <span class="section-number" aria-hidden="true"><?php echo $section_number; ?></span>
      <h2 id="bloc3-title" class="display-lg"><?php echo $title; ?></h2>
    </div>
    <div class="pourquoi__list">
      <?php foreach ( $items as $item ) :
        $item_title = wp_kses_post( $item['title'] ?? '' );
        $item_text  = (string) ( $item['text'] ?? '' );
        $cta_url    = trim( (string) ( $item['ctaUrl'] ?? '' ) );
      ?>
      <article class="pourquoi__item">
        <h3 class="pourquoi__title heading-md"><?php echo $item_title; ?></h3>
        <span class="pourquoi__divider" aria-hidden="true"></span>
        <p class="pourquoi__text body-md"><?php echo esc_html( $item_text ); ?></p>
        <?php if ( '' !== $cta_url ) : ?>
        <a class="pourquoi__cta" href="<?php echo esc_url( $cta_url ); ?>" aria-label="<?php echo esc_attr( wp_strip_all_tags( $item_title ) ?: 'En savoir plus' ); ?>">
          <?php echo $arrow_svg; ?>
        </a>
        <?php endif; ?>
      </article>
      <?php endforeach; ?>
    </div>
  </div>
</section>
