<?php
/**
 * Block: Bloc 2 colonnes
 *
 * @package ocebo26
 */

defined( 'ABSPATH' ) || exit;

$section_number   = trim( (string) ( $attributes['sectionNumber'] ?? '' ) );
$title            = (string) ( $attributes['title'] ?? '' );
$white_background = ! empty( $attributes['whiteBackground'] );
$columns          = $attributes['columns'] ?? [];

if ( '' === trim( wp_strip_all_tags( $title ) ) && empty( $columns ) ) {
	return;
}

$arrow_svg = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

$section_classes = [ 'section', 'section--bloc2col' ];
if ( $white_background ) {
	$section_classes[] = 'section--white';
}

$number_classes = [ 'section-number' ];
if ( $white_background ) {
	$number_classes[] = 'section-number--solid';
}
?>
<section class="<?php echo esc_attr( implode( ' ', $section_classes ) ); ?>" aria-labelledby="bloc2col-title">
  <div class="container">
    <div class="section-header">
      <?php if ( '' !== $section_number ) : ?>
      <span class="<?php echo esc_attr( implode( ' ', $number_classes ) ); ?>" aria-hidden="true"><?php echo esc_html( $section_number ); ?></span>
      <?php endif; ?>
      <h2 id="bloc2col-title" class="bloc2col__title display-lg"><?php echo wp_kses_post( $title ); ?></h2>
    </div>

    <div class="bloc2col__columns">
      <?php foreach ( $columns as $col ) :
        $col_title  = (string) ( $col['title'] ?? '' );
        $col_image  = trim( (string) ( $col['imageUrl'] ?? '' ) );
        $col_alt    = (string) ( $col['imageAlt'] ?? '' );
        $col_text   = (string) ( $col['text'] ?? '' );
        $cta_label  = trim( (string) ( $col['ctaLabel'] ?? '' ) );
        $cta_url    = trim( (string) ( $col['ctaUrl'] ?? '' ) );
        $has_any    = '' !== trim( wp_strip_all_tags( $col_title ) ) || '' !== $col_image || '' !== trim( wp_strip_all_tags( $col_text ) ) || '' !== $cta_label;
        if ( ! $has_any ) {
          continue;
        }
      ?>
      <div class="bloc2col__column">
        <?php if ( '' !== trim( wp_strip_all_tags( $col_title ) ) ) : ?>
        <h3 class="bloc2col__col-title heading-md"><?php echo wp_kses_post( $col_title ); ?></h3>
        <?php endif; ?>

        <?php if ( '' !== $col_image ) : ?>
        <img class="bloc2col__image" src="<?php echo esc_url( $col_image ); ?>" alt="<?php echo esc_attr( $col_alt ); ?>" loading="lazy" decoding="async">
        <?php endif; ?>

        <?php if ( '' !== trim( wp_strip_all_tags( $col_text ) ) ) : ?>
        <p class="bloc2col__text body-md"><?php echo wp_kses_post( $col_text ); ?></p>
        <?php endif; ?>

        <?php if ( '' !== $cta_label ) : ?>
        <a href="<?php echo esc_url( $cta_url ?: '#' ); ?>" class="btn btn--primary bloc2col__cta">
          <?php echo esc_html( $cta_label ); ?>
          <span class="btn__icon-right" aria-hidden="true"><?php echo $arrow_svg; ?></span>
        </a>
        <?php endif; ?>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>
