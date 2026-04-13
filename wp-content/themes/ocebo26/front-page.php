<?php
/**
 * Template: Front Page (Accueil)
 *
 * Renders homepage content from the Gutenberg editor (wp:html blocks).
 * Fallback to PHP patterns if page content is empty.
 *
 * @package ocebo26
 */

defined('ABSPATH') || exit;
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<?php ocebo26_get_part('header'); ?>

  <main id="main-content">
    <?php
    while (have_posts()) :
        the_post();

        if (trim(get_the_content())) :
            the_content();
        else :
            // Fallback: PHP patterns if page content is empty
            ocebo26_get_pattern('hero');
            ocebo26_get_pattern('checklist');
            ocebo26_get_pattern('services-grid');
            ocebo26_get_pattern('pourquoi');
            ocebo26_get_pattern('chiffres');
            ocebo26_get_pattern('logos');
            ocebo26_get_pattern('faq');
            ocebo26_get_pattern('contact-cta');
        endif;
    endwhile;
    ?>
  </main>

<?php ocebo26_get_part('footer'); ?>
</body>
</html>
