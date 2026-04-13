<?php
/**
 * Auto-populate the front page with custom Gutenberg blocks.
 *
 * Runs once: when the front page exists but has empty content.
 * Uses the registered ocebo26/* blocks — each renders server-side via render.php.
 *
 * @package ocebo26
 */

defined('ABSPATH') || exit;

add_action('wp', function () {
    if (!is_front_page() || is_admin()) {
        return;
    }

    $front_id = (int) get_option('page_on_front');
    if (!$front_id) {
        return;
    }

    $page = get_post($front_id);
    if (!$page || trim($page->post_content) !== '') {
        return;
    }

    if (get_post_meta($front_id, '_ocebo26_populated', true)) {
        return;
    }

    $content = <<<'BLOCKS'
<!-- wp:ocebo26/hero /-->

<!-- wp:ocebo26/checklist /-->

<!-- wp:ocebo26/services-grid /-->

<!-- wp:ocebo26/pourquoi /-->

<!-- wp:ocebo26/chiffres /-->

<!-- wp:ocebo26/logos-slider /-->

<!-- wp:ocebo26/faq /-->

<!-- wp:ocebo26/contact-cta /-->
BLOCKS;

    wp_update_post([
        'ID'           => $front_id,
        'post_content' => $content,
    ]);

    update_post_meta($front_id, '_ocebo26_populated', '1');
});
