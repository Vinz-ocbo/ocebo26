<?php
/**
 * Template: 404
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
      <h1 class="display-xl">Page non <em class="text-cyan">trouvée</em></h1>
      <p class="body-lg" style="margin-top: var(--space-3, 24px); color: var(--color-text-primary, #fff);">La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <div style="margin-top: var(--space-4, 32px);">
        <a href="<?php echo esc_url(home_url('/')); ?>" class="btn btn--primary">Retour à l'accueil</a>
      </div>
    </div>
  </main>

<?php ocebo26_get_part('footer'); ?>
</body>
</html>
