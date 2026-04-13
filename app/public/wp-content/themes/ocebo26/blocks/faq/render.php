<?php
/**
 * Block: FAQ — Foire aux questions
 *
 * @package ocebo26
 */

defined( 'ABSPATH' ) || exit;

$section_number = esc_html( $attributes['sectionNumber'] ?? '5' );
$title          = wp_kses_post( $attributes['title'] ?? '' );
$items          = $attributes['items'] ?? [];
?>
<section class="section section--faq" aria-labelledby="bloc6-title">
  <div class="container container--wide">
    <div class="section-header">
      <span class="section-number" aria-hidden="true"><?php echo $section_number; ?></span>
      <h2 id="bloc6-title" class="display-lg"><?php echo $title; ?></h2>
    </div>
    <div class="faq__list" role="list">
      <?php foreach ( $items as $item ) : ?>
      <details class="accordion" role="listitem">
        <summary class="accordion__header">
          <span class="accordion__title heading-sm"><?php echo esc_html( $item['question'] ?? '' ); ?></span>
          <span class="accordion__icon" aria-hidden="true"></span>
        </summary>
        <div class="accordion__body">
          <div class="accordion__body-inner"><p class="body-md"><?php echo esc_html( $item['answer'] ?? '' ); ?></p></div>
        </div>
      </details>
      <?php endforeach; ?>
    </div>
  </div>
</section>
