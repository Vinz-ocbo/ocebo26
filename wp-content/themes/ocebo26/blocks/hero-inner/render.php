<?php
/**
 * Block: Hero — Page intérieure
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content (empty for dynamic blocks).
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$section_number      = trim( (string) ( $attributes['sectionNumber'] ?? '' ) );
$page_name           = trim( (string) ( $attributes['pageName'] ?? '' ) );
$title               = trim( (string) ( $attributes['title'] ?? '' ) );
$text                = trim( (string) ( $attributes['text'] ?? '' ) );
$cta_primary_label   = trim( (string) ( $attributes['ctaPrimaryLabel'] ?? '' ) );
$cta_primary_url     = trim( (string) ( $attributes['ctaPrimaryUrl'] ?? '' ) );
$cta_secondary_label = trim( (string) ( $attributes['ctaSecondaryLabel'] ?? '' ) );
$cta_secondary_url   = trim( (string) ( $attributes['ctaSecondaryUrl'] ?? '' ) );

// Title is required — bail if empty.
if ( '' === $title ) {
	return;
}

$has_section_number = '' !== $section_number;
$has_body           = '' !== $text || '' !== $cta_primary_label || '' !== $cta_secondary_label;

$arrow_svg = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
?>
<section class="hero hero--inner section" aria-labelledby="hero-inner-title">
  <div class="hero__inner container">
    <div class="hero__content">
      <div class="section-header">
        <?php if ( $has_section_number ) : ?>
        <span class="section-number section-number--solid" aria-hidden="true"><?php echo esc_html( $section_number ); ?></span>
        <?php endif; ?>
        <div class="hero__heading-group">
          <?php if ( '' !== $page_name ) : ?>
          <span class="hero__page-name"><?php echo esc_html( $page_name ); ?></span>
          <?php endif; ?>
          <h1 id="hero-inner-title" class="hero__title display-xl"><?php echo wp_kses_post( $title ); ?></h1>
        </div>
      </div>

      <?php if ( $has_body ) : ?>
      <div class="hero__body">
        <?php if ( '' !== $text ) : ?>
        <p class="hero__text body-lg"><?php echo esc_html( $text ); ?></p>
        <?php endif; ?>

        <?php if ( '' !== $cta_primary_label || '' !== $cta_secondary_label ) : ?>
        <div class="hero__ctas">
          <?php if ( '' !== $cta_primary_label ) : ?>
          <a href="<?php echo esc_url( $cta_primary_url ?: '#' ); ?>" class="btn btn--primary">
            <?php echo esc_html( $cta_primary_label ); ?>
            <span class="btn__icon-right" aria-hidden="true"><?php echo $arrow_svg; ?></span>
          </a>
          <?php endif; ?>
          <?php if ( '' !== $cta_secondary_label ) : ?>
          <a href="<?php echo esc_url( $cta_secondary_url ?: '#' ); ?>" class="btn btn--secondary">
            <?php echo esc_html( $cta_secondary_label ); ?>
            <span class="btn__icon-right btn__icon-right--accent" aria-hidden="true"><?php echo $arrow_svg; ?></span>
          </a>
          <?php endif; ?>
        </div>
        <?php endif; ?>
      </div>
      <?php endif; ?>
    </div>
  </div>
</section>
