<?php
/**
 * Template: Index (fallback)
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
      if (have_posts()) :
          while (have_posts()) :
              the_post();
      ?>
        <article>
          <h2 class="display-lg"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
          <div class="body-md" style="margin-top: var(--space-2, 16px); color: var(--color-text-primary, #fff);">
            <?php the_excerpt(); ?>
          </div>
        </article>
      <?php
          endwhile;
      else :
      ?>
        <p class="body-lg" style="color: var(--color-text-primary, #fff);">Aucun contenu pour le moment.</p>
      <?php endif; ?>
    </div>
  </main>

<?php ocebo26_get_part('footer'); ?>
</body>
</html>
