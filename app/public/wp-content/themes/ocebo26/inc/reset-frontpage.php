<?php
/**
 * One-time reset: clear front page content so auto-populate re-runs.
 * Visit ?ocebo26_reset=1 as admin to trigger.
 *
 * @package ocebo26
 */

defined('ABSPATH') || exit;

add_action('admin_init', function () {
    if (empty($_GET['ocebo26_reset']) || !current_user_can('manage_options')) {
        return;
    }

    $front_id = (int) get_option('page_on_front');
    if ($front_id) {
        wp_update_post([
            'ID'           => $front_id,
            'post_content' => '',
        ]);
        delete_post_meta($front_id, '_ocebo26_populated');
    }

    wp_safe_redirect(admin_url('edit.php?post_type=page&ocebo26_reset_done=1'));
    exit;
});
