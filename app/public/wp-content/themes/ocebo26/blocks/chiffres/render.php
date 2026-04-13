<?php
/**
 * Block: Chiffres clefs
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content (empty for dynamic blocks).
 * @var WP_Block $block      Block instance.
 */

defined('ABSPATH') || exit;

$items = $attributes['items'] ?? [];
if (empty($items)) {
    return;
}

$wrapper_attrs = get_block_wrapper_attributes([
    'class' => 'section section--chiffres',
]);
?>
<section <?php echo $wrapper_attrs; ?> style="padding-block: var(--wp--custom--section-gap);">
  <div class="container container--wide">
    <h2 class="sr-only">Quelques chiffres</h2>
    <div class="chiffres__grid">
      <?php foreach ($items as $item) :
        $number  = (int) ($item['number'] ?? 0);
        $prefix  = esc_html($item['prefix'] ?? '');
        $suffix  = esc_html($item['suffix'] ?? '');
        $label   = wp_kses_post($item['label'] ?? '');
        $color   = in_array($item['color'] ?? '', ['cyan', 'magenta'], true) ? $item['color'] : 'cyan';
        $size    = in_array($item['size'] ?? '', ['tall', 'short'], true) ? $item['size'] : 'short';
        $display = $prefix . number_format($number, 0, ',', "\u{202f}") . $suffix;
      ?>
        <div class="card-chiffre card-chiffre--<?php echo $size; ?>"
             data-target="<?php echo $number; ?>"
             <?php if ($prefix) : ?>data-prefix="<?php echo $prefix; ?>"<?php endif; ?>
             <?php if ($suffix) : ?>data-suffix="<?php echo $suffix; ?>"<?php endif; ?>>
          <div class="card-chiffre__inner">
            <span class="card-chiffre__number number-xl card-chiffre__number--<?php echo $color; ?>" aria-live="polite"><?php echo $display; ?></span>
            <span class="card-chiffre__label heading-sm"><?php echo $label; ?></span>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>
