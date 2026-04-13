<?php
/**
 * Block: Ce qu'on fait — Checklist
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content (empty for dynamic blocks).
 * @var WP_Block $block      Block instance.
 */

defined('ABSPATH') || exit;

$section_number = esc_html($attributes['sectionNumber'] ?? '1');
$title          = wp_kses_post($attributes['title'] ?? '');
$items          = $attributes['items'] ?? [];

if (empty($items)) {
    return;
}

$check_svg = '<svg class="check-list__icon" width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden="true"><path d="M2 8L8 14L20 2" stroke="#d74ed7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
$last_index = count($items) - 1;
?>
<section class="section section--liste" aria-labelledby="bloc1-title">
  <div class="container">
    <div class="bloc-liste">
      <div class="bloc-liste__header">
        <div class="section-header">
          <span class="section-number" aria-hidden="true"><?php echo $section_number; ?></span>
          <h2 id="bloc1-title" class="display-lg"><?php echo $title; ?></h2>
        </div>
      </div>
      <div class="bloc-liste__body">
        <ul class="check-list">
          <?php foreach ($items as $index => $item) : ?>
          <li class="check-list__item">
            <?php echo $check_svg; ?>
            <span><?php echo esc_html($item); ?></span>
          </li>
          <?php if ($index < $last_index) : ?>
          <hr class="check-list__separator" aria-hidden="true">
          <?php endif; ?>
          <?php endforeach; ?>
        </ul>
      </div>
    </div>
  </div>
</section>
