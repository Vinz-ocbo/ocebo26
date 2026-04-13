<?php
/**
 * Block: Pourquoi Ocebo
 *
 * @package ocebo26
 */

defined( 'ABSPATH' ) || exit;

$section_number = esc_html( $attributes['sectionNumber'] ?? '3' );
$title          = wp_kses_post( $attributes['title'] ?? '' );
$items          = $attributes['items'] ?? [];
?>
<section class="section section--pourquoi" aria-labelledby="bloc3-title">
  <div class="container container--wide">
    <div class="section-header">
      <span class="section-number" aria-hidden="true"><?php echo $section_number; ?></span>
      <h2 id="bloc3-title" class="display-lg"><?php echo $title; ?></h2>
    </div>
    <div class="pourquoi__list">
      <?php foreach ( $items as $item ) : ?>
      <article class="pourquoi__item">
        <h3 class="pourquoi__title heading-md"><?php echo wp_kses_post( $item['title'] ?? '' ); ?></h3>
        <span class="pourquoi__divider" aria-hidden="true"></span>
        <p class="pourquoi__text body-md"><?php echo esc_html( $item['text'] ?? '' ); ?></p>
      </article>
      <?php endforeach; ?>
    </div>
  </div>
</section>
