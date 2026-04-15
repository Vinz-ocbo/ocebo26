<?php
/**
 * Ocebo 2026 — functions.php
 *
 * Hybrid block theme: theme.json for tokens + classic PHP templates for pixel-perfect rendering.
 *
 * @package ocebo26
 */

defined('ABSPATH') || exit;

define('OCEBO26_VERSION', '1.0.17');
define('OCEBO26_DIR', get_template_directory());
define('OCEBO26_URI', get_template_directory_uri());

/* ============================================
   THEME SETUP
   ============================================ */
add_action('after_setup_theme', function () {
    add_theme_support('editor-styles');
    add_theme_support('responsive-embeds');
    add_theme_support('post-thumbnails');
    add_theme_support('title-tag');
    add_theme_support('menus');
    add_theme_support('html5', [
        'search-form', 'comment-form', 'comment-list',
        'gallery', 'caption', 'style', 'script',
    ]);

    register_nav_menus([
        'primary'  => __('Navigation principale', 'ocebo26'),
    ]);
});

/* ============================================
   ENQUEUE — FRONTEND
   ============================================ */
add_action('wp_enqueue_scripts', function () {
    // Fonts — Google Fonts
    wp_enqueue_style('ocebo26-google-fonts',
        'https://fonts.googleapis.com/css2?family=Cabin:wght@400;500;600&family=Kanit:wght@400;500&display=swap',
        [], null
    );

    // Fonts — Adobe Typekit (Bookmania)
    wp_enqueue_style('ocebo26-typekit',
        'https://p.typekit.net/p.css?s=1&k=nmz1tbi&ht=tk&f=14719.39512.39519.39521.39523&a=40567368&app=typekit&e=css',
        [], null
    );

    // Original CSS stack — in order
    $css_files = [
        'tokens'     => 'tokens.css',
        'reset'      => 'reset.css',
        'layout'     => 'layout.css',
        'components' => 'components.css',
        'sections'   => 'sections.css',
        'animations' => 'animations.css',
        'utilities'  => 'utilities.css',
        'theme'      => 'theme.css',
    ];

    $prev = 'ocebo26-typekit';
    foreach ($css_files as $handle => $file) {
        $full_handle = 'ocebo26-' . $handle;
        wp_enqueue_style($full_handle, OCEBO26_URI . '/assets/css/' . $file, [$prev], OCEBO26_VERSION);
        $prev = $full_handle;
    }

    // Frontend JS
    wp_enqueue_script('ocebo26-main', OCEBO26_URI . '/assets/js/main.js', [], OCEBO26_VERSION, ['strategy' => 'defer']);
});

/* ============================================
   ENQUEUE — EDITOR
   ============================================ */
add_action('enqueue_block_editor_assets', function () {
    // Load the same CSS stack as frontend so ServerSideRender previews match
    wp_enqueue_style('ocebo26-google-fonts-editor',
        'https://fonts.googleapis.com/css2?family=Cabin:wght@400;500;600&family=Kanit:wght@400;500&display=swap',
        [], null
    );
    wp_enqueue_style('ocebo26-typekit-editor',
        'https://p.typekit.net/p.css?s=1&k=nmz1tbi&ht=tk&f=14719.39512.39519.39521.39523&a=40567368&app=typekit&e=css',
        [], null
    );

    $css_files = ['tokens', 'reset', 'layout', 'components', 'sections', 'animations', 'utilities', 'theme', 'editor'];
    $prev = 'ocebo26-typekit-editor';
    foreach ($css_files as $file) {
        $handle = 'ocebo26-editor-' . $file;
        wp_enqueue_style($handle, OCEBO26_URI . '/assets/css/' . $file . '.css', [$prev], OCEBO26_VERSION);
        $prev = $handle;
    }
});

/* ============================================
   REGISTER CUSTOM BLOCKS
   ============================================ */
add_action('init', function () {
    $blocks = [
        'hero', 'checklist', 'services-grid', 'pourquoi',
        'chiffres', 'logos-slider', 'faq', 'contact-cta',
    ];

    foreach ($blocks as $block) {
        $dir = OCEBO26_DIR . '/blocks/' . $block;
        if (file_exists($dir . '/block.json')) {
            register_block_type($dir);
        }
    }
});

/* ============================================
   REGISTER BLOCK CATEGORY
   ============================================ */
add_filter('block_categories_all', function ($categories) {
    array_unshift($categories, [
        'slug'  => 'ocebo26',
        'title' => __('Ocebo 2026', 'ocebo26'),
        'icon'  => null,
    ]);
    return $categories;
});

/* ============================================
   REGISTER BLOCK PATTERN CATEGORY
   ============================================ */
add_action('init', function () {
    register_block_pattern_category('ocebo26', [
        'label' => __('Ocebo 2026', 'ocebo26'),
    ]);
    register_block_pattern_category('ocebo26-accueil', [
        'label' => __('Ocebo — Accueil', 'ocebo26'),
    ]);
});

/* ============================================
   CUSTOM IMAGE SIZES
   ============================================ */
add_action('after_setup_theme', function () {
    add_image_size('logo-client', 120, 60, false);
});

/* ============================================
   DISABLE COMMENTS (site vitrine)
   ============================================ */
add_filter('comments_open', '__return_false');
add_filter('pings_open', '__return_false');
add_filter('comments_array', '__return_empty_array');

/* ============================================
   AUTO-POPULATE FRONT PAGE
   ============================================ */
require_once OCEBO26_DIR . '/inc/frontpage-content.php';
require_once OCEBO26_DIR . '/inc/reset-frontpage.php';

/* ============================================
   HELPER: get template part from /parts/ dir
   ============================================ */
function ocebo26_get_part(string $slug): void {
    $file = OCEBO26_DIR . '/parts/' . $slug . '.php';
    if (file_exists($file)) {
        include $file;
    }
}

/* ============================================
   HELPER: get pattern from /patterns/ dir
   ============================================ */
function ocebo26_get_pattern(string $slug): void {
    $file = OCEBO26_DIR . '/patterns/' . $slug . '.php';
    if (file_exists($file)) {
        include $file;
    }
}
