<?php
/**
 * Block: Chronologie
 *
 * @package ocebo26
 */

defined( 'ABSPATH' ) || exit;

$section_number = esc_html( $attributes['sectionNumber'] ?? '3' );
$title          = wp_kses_post( $attributes['title'] ?? '' );
$items          = $attributes['items'] ?? [];
?>
<section class="section section--chronologie" aria-labelledby="bloc-chronologie-title">
  <div class="container container--wide">
    <div class="section-header">
      <span class="section-number" aria-hidden="true"><?php echo $section_number; ?></span>
      <h2 id="bloc-chronologie-title" class="display-lg"><?php echo $title; ?></h2>
    </div>
    <ol class="chronologie__list">
      <?php foreach ( $items as $index => $item ) : ?>
      <li class="chronologie__step">
        <h3 class="chronologie__step-title heading-sm"><?php echo wp_kses_post( $item['title'] ?? '' ); ?></h3>
        <span class="chronologie__step-marker" aria-hidden="true">
          <span class="chronologie__step-number"><?php echo (int) $index + 1; ?></span>
        </span>
        <p class="chronologie__step-text body-sm"><?php echo esc_html( $item['text'] ?? '' ); ?></p>
      </li>
      <?php endforeach; ?>
    </ol>
  </div>
</section>
