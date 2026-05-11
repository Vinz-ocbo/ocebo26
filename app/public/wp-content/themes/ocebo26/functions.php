<?php
/**
 * Ocebo 2026 — functions.php
 *
 * Hybrid block theme: theme.json for tokens + classic PHP templates for pixel-perfect rendering.
 *
 * @package ocebo26
 */

defined('ABSPATH') || exit;

define('OCEBO26_VERSION', '1.6.0');
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

    // CSS bundle unique — concaténation des 8 fichiers source dans l'ordre
    // cascade (tokens → reset → layout → components → sections → animations →
    // utilities → theme), généré par `npm run build:css` (cf. build/build-css.js).
    // L'above-fold est couvert par critical.css inliné en <head> (voir wp_head
    // action plus bas), ce bundle est chargé non-bloquant via media=print swap
    // dans le filtre style_loader_tag.
    wp_enqueue_style('ocebo26-bundle', OCEBO26_URI . '/assets/css/bundle.min.css', ['ocebo26-typekit'], OCEBO26_VERSION);

    // Frontend JS (minifié via terser, cf. npm run build:js)
    // Deux bundles deferred chargés en parallèle :
    //   - main.min.js : interactivité critique (nav, mobile menu, accordions...)
    //   - main-fx.min.js : effets cosmétiques (Parallax, DotMesh, ScrollLace)
    // main-fx.js auto-init avec chunking rIC pour ne pas créer de long task.
    wp_enqueue_script('ocebo26-main', OCEBO26_URI . '/assets/js/main.min.js', [], OCEBO26_VERSION, ['strategy' => 'defer']);
    wp_enqueue_script('ocebo26-main-fx', OCEBO26_URI . '/assets/js/main-fx.min.js', [], OCEBO26_VERSION, ['strategy' => 'defer']);
});

/* ============================================
   RESOURCE HINTS — preconnect aux serveurs de fonts
   ============================================ */
add_filter('wp_resource_hints', function ($hints, $relation) {
    if ($relation === 'preconnect') {
        $hints[] = [ 'href' => 'https://fonts.googleapis.com' ];
        $hints[] = [ 'href' => 'https://fonts.gstatic.com', 'crossorigin' => 'anonymous' ];
        $hints[] = [ 'href' => 'https://p.typekit.net', 'crossorigin' => 'anonymous' ];
        $hints[] = [ 'href' => 'https://use.typekit.net', 'crossorigin' => 'anonymous' ];
    }
    return $hints;
}, 10, 2);

/* ============================================
   CRITICAL CSS INLINE — above-fold rendu sans render-blocking
   ============================================
   On inline critical.css en tout début de <head> via wp_head priority 1,
   AVANT que les <link> CSS soient imprimés. Le browser peut peindre
   l'above-fold dès que le HTML+critical sont parsés, sans attendre
   le bundle.min.css (qui est chargé non-bloquant ci-dessous). */
add_action('wp_head', function () {
    // Pas d'inline critical en admin (Gutenberg gère sa propre stack).
    if (is_admin()) {
        return;
    }
    $critical_path = OCEBO26_DIR . '/assets/css/critical.css';
    if (!is_readable($critical_path)) {
        return;
    }
    $critical = file_get_contents($critical_path);
    if ($critical !== false && $critical !== '') {
        echo "<style id=\"ocebo26-critical\">" . $critical . "</style>\n";
    }
}, 1);

/* ============================================
   ASYNC LOAD — Google Fonts CSS + bundle CSS principal (typekit reste sync)
   ============================================
   Note : typekit (Bookmania) reste sync car le H1 hero l'utilise et
   l'async retardait le LCP. Google Fonts (Cabin/Kanit) et le bundle CSS
   complet passent en media=print swap, le critical inline gère l'above-fold. */
add_filter('style_loader_tag', function ($tag, $handle) {
    // Admin (Gutenberg) : ne jamais defer un style, sinon casse l'éditeur.
    if (is_admin()) {
        return $tag;
    }
    $async_handles = ['ocebo26-google-fonts', 'ocebo26-bundle'];
    if (!in_array($handle, $async_handles, true)) {
        return $tag;
    }
    $async = preg_replace(
        '/(rel=["\']stylesheet["\'])/',
        '$1 media="print" onload="this.media=\'all\'"',
        $tag
    );
    return $async . '<noscript>' . $tag . '</noscript>';
}, 10, 2);

/* ============================================
   DISABLE wp-emoji (parse JS inutile dans <head>)
   ============================================ */
remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('admin_print_scripts', 'print_emoji_detection_script');
remove_action('wp_print_styles', 'print_emoji_styles');
remove_action('admin_print_styles', 'print_emoji_styles');
remove_filter('the_content_feed', 'wp_staticize_emoji');
remove_filter('comment_text_rss', 'wp_staticize_emoji');
remove_filter('wp_mail', 'wp_staticize_emoji_for_email');

/* ============================================
   DISABLE wp-embed.min.js + jquery-migrate (frontend)
   ============================================ */
add_action('wp_footer', function () {
    wp_dequeue_script('wp-embed');
});
add_action('wp_default_scripts', function ($scripts) {
    if (!is_admin() && !empty($scripts->registered['jquery'])) {
        $jq = $scripts->registered['jquery'];
        if ($jq->deps) {
            $jq->deps = array_diff($jq->deps, ['jquery-migrate']);
        }
    }
});

/* ============================================
   DEFER tous les scripts frontend (sauf admin-bar)
   ============================================ */
add_filter('script_loader_tag', function ($tag, $handle) {
    // Never defer in wp-admin: breaks Gutenberg's wp.apiFetch.use(...) inline
    // setup which assumes api-fetch.js is already executed.
    if (is_admin()) {
        return $tag;
    }
    if (is_admin_bar_showing() && in_array($handle, ['admin-bar', 'jquery', 'jquery-core'], true)) {
        return $tag;
    }
    if (strpos($tag, ' defer') !== false || strpos($tag, ' async') !== false) {
        return $tag;
    }
    return str_replace(' src=', ' defer src=', $tag);
}, 10, 2);

/* ============================================
   DISABLE block library CSS globale (on ne l'utilise pas en front)
   ============================================ */
add_action('wp_enqueue_scripts', function () {
    wp_dequeue_style('wp-block-library');
    wp_dequeue_style('wp-block-library-theme');
    wp_dequeue_style('classic-theme-styles');
    wp_dequeue_style('global-styles');
}, 100);

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
        'hero', 'hero-inner', 'checklist', 'services-grid', 'pourquoi',
        'chiffres', 'logos-slider', 'faq', 'contact-cta',
        'slider-simple', 'chronologie', 'bloc-2-colonnes',
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
