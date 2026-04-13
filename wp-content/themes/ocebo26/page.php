<?php
/**
 * Template: Default Page
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

  <main id="main-content" class="section" style="padding-top: calc(82px + 80px);">
    <div class="container">
      <?php
      while (have_posts()) :
          the_post();
      ?>
        <h1 class="display-xl"><?php the_title(); ?></h1>
        <div class="page-content body-md" style="margin-top: var(--space-4, 32px); color: var(--color-text-primary, #fff);">
          <?php the_content(); ?>
        </div>
      <?php endwhile; ?>
    </div>
  </main>

<?php ocebo26_get_part('footer'); ?>
</body>
</html>
