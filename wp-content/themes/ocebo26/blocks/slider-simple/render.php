<?php
/**
 * Block: Slider — Simple
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content (empty for dynamic blocks).
 * @var WP_Block $block      Block instance.
 */

defined('ABSPATH') || exit;

$slides = $attributes['slides'] ?? [];
if (empty($slides) || !is_array($slides)) {
    return;
}

// Filtre : on n'accepte que les slides ayant une image
$slides = array_values(array_filter($slides, static function ($s) {
    return !empty($s['url']);
}));
if (empty($slides)) {
    return;
}

$count     = count($slides);
$is_single = $count === 1;

// Pour ≥2 slides, on triple le set : [A clone, B réel, C clone].
// Le middle (B) reçoit l'attention ; A donne le peek-gauche, C le peek-droit.
$render_slides = $is_single ? $slides : array_merge($slides, $slides, $slides);
$wrap_class    = 'slider-simple' . ($is_single ? ' is-single' : '');
$loop_attr     = $is_single ? '' : ' data-loop="1"';
$style_attr    = $is_single ? '' : sprintf(' style="--orig-count: %d;"', $count);
?>
<div class="<?php echo esc_attr($wrap_class); ?>"<?php echo $loop_attr; ?><?php echo $style_attr; ?> aria-roledescription="carousel">
  <div class="slider-simple__track">
    <?php foreach ($render_slides as $i => $slide):
        $url      = esc_url($slide['url'] ?? '');
        $alt      = esc_attr($slide['alt'] ?? '');
        $title    = wp_kses_post($slide['title'] ?? '');
        $link     = esc_url($slide['link'] ?? '');
        // Pour le mode triple : middle set = $i ∈ [$count, 2*$count - 1]
        $is_clone = !$is_single && ($i < $count || $i >= 2 * $count);
        // Slide actif initial = 1er du set du milieu
        $is_active_init = !$is_single && $i === $count;
        $aria      = $is_clone ? ' aria-hidden="true"' : '';
        $tabindex  = $is_clone ? ' tabindex="-1"' : '';
        $slide_cls = 'slider-simple__slide' . ($is_active_init || $is_single ? ' is-center' : '');
    ?>
    <div class="<?php echo esc_attr($slide_cls); ?>"<?php echo $aria; ?>>
      <?php if ($link): ?>
      <a href="<?php echo $link; ?>" class="slider-simple__link"<?php echo $tabindex; ?>>
      <?php endif; ?>
        <div class="slider-simple__media">
          <img src="<?php echo $url; ?>" alt="<?php echo $alt; ?>" loading="lazy">
        </div>
        <?php if ($title !== ''): ?>
          <h3 class="slider-simple__title heading-md"><?php echo $title; ?></h3>
        <?php endif; ?>
      <?php if ($link): ?>
      </a>
      <?php endif; ?>
    </div>
    <?php endforeach; ?>
  </div>
</div>
