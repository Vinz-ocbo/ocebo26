<?php
/**
 * Block: Logos — Confiance
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

defined('ABSPATH') || exit;

$section_number = esc_html($attributes['sectionNumber'] ?? '4');
$title          = wp_kses_post($attributes['title'] ?? '');
$text           = esc_html($attributes['text'] ?? '');
$logos          = $attributes['logos'] ?? [];

if (empty($logos)) {
    $logos = [
        ['src' => 'chanel.svg',  'alt' => 'Chanel'],
        ['src' => 'hermes.svg',  'alt' => 'Hermès'],
        ['src' => 'gucci.svg',   'alt' => 'Gucci'],
        ['src' => 'clarins.svg', 'alt' => 'Clarins'],
        ['src' => 'bnp.svg',     'alt' => 'BNP Paribas'],
        ['src' => 'netflix.svg', 'alt' => 'Netflix'],
        ['src' => 'konbini.svg', 'alt' => 'Konbini'],
        ['src' => 'total.svg',   'alt' => 'TotalEnergies'],
    ];
    $use_theme_path = true;
} else {
    $use_theme_path = false;
}
?>
<section class="section section--logos" aria-labelledby="bloc5-title">
  <div class="container container--wide">
    <div class="section-header">
      <span class="section-number" aria-hidden="true"><?php echo $section_number; ?></span>
      <h2 id="bloc5-title" class="display-lg"><?php echo $title; ?></h2>
    </div>
    <p class="logos__desc body-md section-body-indent"><?php echo $text; ?></p>
    <div class="logos-slider" aria-label="Logos de nos clients">
      <div class="logos-slider__track">
        <?php
        for ($set = 0; $set < 2; $set++) :
            foreach ($logos as $logo) :
                if ($use_theme_path) {
                    $src = esc_url(get_template_directory_uri() . '/assets/img/logos/' . $logo['src']);
                } else {
                    $src = esc_url($logo['src']);
                }
                $alt  = ($set === 0) ? esc_attr($logo['alt']) : '';
                $aria = ($set === 1) ? ' aria-hidden="true"' : '';
        ?>
          <div class="logos-slider__slide"<?php echo $aria; ?>>
            <img src="<?php echo $src; ?>" alt="<?php echo $alt; ?>" width="120" height="60" loading="lazy">
          </div>
        <?php
            endforeach;
        endfor;
        ?>
      </div>
    </div>
  </div>
</section>
