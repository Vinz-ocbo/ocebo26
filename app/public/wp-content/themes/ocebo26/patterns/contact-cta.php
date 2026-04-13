<?php defined('ABSPATH') || exit; ?>
    <!-- BLOC 7 — CONTACT / CTA FINAL -->
    <section class="section section--contact" aria-labelledby="bloc7-title">
      <div class="container">
        <div class="contact__inner">
          <h2 id="bloc7-title" class="display-xl">Prêt à créer avec <em class="text-cyan">Océbo</em> ?</h2>
          <form class="contact-form" action="#" method="post" novalidate>
            <div class="contact-form__fields">
              <div class="form-group">
                <label for="field-prenom" class="form-label">Prénom</label>
                <input type="text" id="field-prenom" name="prenom" class="form-input" placeholder="Placeholder" required autocomplete="given-name">
              </div>
              <div class="form-group">
                <label for="field-nom" class="form-label">Nom *</label>
                <input type="text" id="field-nom" name="nom" class="form-input" placeholder="Placeholder" required autocomplete="family-name">
              </div>
              <div class="form-group">
                <label for="field-email" class="form-label">Adresse e-mail *</label>
                <input type="email" id="field-email" name="email" class="form-input" placeholder="Placeholder" required autocomplete="email">
              </div>
              <div class="form-group">
                <label for="field-tel" class="form-label">Numéro de téléphone</label>
                <input type="tel" id="field-tel" name="tel" class="form-input" placeholder="Placeholder" autocomplete="tel">
              </div>
              <div class="form-group form-group--full">
                <label for="field-sujet" class="form-label">Sujet</label>
                <select id="field-sujet" name="sujet" class="form-input form-select">
                  <option value="" disabled selected>- choisissez le sujet -</option>
                  <option value="projet">Nouveau projet</option>
                  <option value="devis">Demande de devis</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>
            <div class="contact-form__consent">
              <label class="form-checkbox">
                <input type="checkbox" name="consent" required>
                <span class="form-checkbox__mark"></span>
                <span class="form-checkbox__text text-small">J'accepte que mes données soient utilisées pour répondre à ma demande conformément à la <a href="<?php echo esc_url(home_url('/politique-confidentialite')); ?>">politique de confidentialité</a>.</span>
              </label>
            </div>
            <button type="submit" class="btn btn--primary btn--submit">DÉMARRER UN PROJET</button>
          </form>
        </div>
      </div>
    </section>
