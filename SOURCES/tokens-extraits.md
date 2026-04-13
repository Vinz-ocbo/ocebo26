# Tokens extraits — OCEBO 2026 Homepage

> Source : Figma `VrEtdqgf1uOwUhLniGuyoZ` / Page PROD / Frame `theme-ocebo2026-homepage` (1440x6101px)
> Date d'extraction : 2026-04-07

---

## 1. Couleurs

### Palette principale

| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#000000` | Fond de page principal |
| `--color-surface-dark` | `#030217` | Surfaces sombres, cartes, overlays, ombres dures |
| `--color-surface-light` | `#f2f2f2` | Fond clair (bloc Contact) |
| `--color-surface-input` | `#f5f5f5` | Fond des champs de formulaire |

### Textes

| Token | Hex | Usage |
|---|---|---|
| `--color-text-primary` | `#ffffff` | Texte principal sur fond sombre |
| `--color-text-secondary` | `#697077` | Texte secondaire, badges, descriptions |
| `--color-text-body` | `#383b4d` | Texte body sur fond clair |

### Accents

| Token | Hex | Usage |
|---|---|---|
| `--color-accent-cyan` | `#15ffd6` | Accent principal — CTA, numéros de section, chiffres clefs, glow |
| `--color-accent-magenta` | `#d74ed7` | Accent secondaire — mots-clefs dans titres, liens, traits décoratifs |
| `--color-accent-yellow` | `#ffee00` | Accent tertiaire (paillettes / décor) |
| `--color-accent-red` | `#ed3a31` | Accent décoratif (ellipse/paillettes) |

### Bordures

| Token | Hex | Usage |
|---|---|---|
| `--color-border-default` | `#e0e0e0` | Bordures champs formulaire |
| `--color-border-light` | `#dde1e6` | Bordure menu |

### Gradients

| Token | Valeur | Usage |
|---|---|---|
| `--gradient-glow-cyan` | `radial-gradient(#66edd8, transparent)` | Halo lumineux (ellipses décoratives) |
| `--gradient-overlay` | `linear-gradient(rgba(122,144,200,0.1), rgba(122,144,200,0.3))` | Overlay glassmorphism sur Container |

---

## 2. Typographie

### Familles

| Token | Famille | Source | Usage |
|---|---|---|---|
| `--font-display` | `Bookmania` | Adobe Typekit (kit `nmz1tbi`) | Titres, display |
| `--font-heading` | `Kanit` | Google Fonts | Chiffres, navigation, CTA, labels |
| `--font-body` | `Cabin` | Google Fonts | Texte courant |
| ~~`--font-footer`~~ | ~~`Noto Sans`~~ | — | **Supprimé** — unifié avec Cabin |

### Echelle typographique

| Token | Famille | Taille | Graisse | Line-height | Ratio LH | Usage |
|---|---|---|---|---|---|---|
| `--text-display-xl` | Bookmania | 56px | 900 (Black) | 56px | 1.0 | H1 hero, titre CTA final |
| `--text-display-lg` | Bookmania | 40px | 900 (Black) | 40px | 1.0 | H2 sections |
| `--text-number-xl` | Kanit | 100px | 400 | 100px | 1.0 | Grands chiffres (20+, 999+) |
| `--text-number-lg` | Kanit | 38px | 400 | 38px | 1.0 | Numéros de section (1, 2, 3...) |
| `--text-heading-md` | Kanit | 26px | 400 | 36px | 1.38 | Titres de cartes (services) |
| `--text-heading-sm` | Kanit | 20px | 400 | 26px | 1.3 | Labels chiffres clefs |
| `--text-body-lg` | Cabin | 18px | 400 | 29px | 1.6 | Paragraphe hero |
| `--text-body-md` | Cabin | 16px | 400 | 26px | 1.6 | Corps de texte courant |
| `--text-label` | Kanit | 16px | 400 | 16px | 1.0 | Navigation, CTA buttons |
| `--text-body-sm` | Cabin | 14px | 400 | 22px | 1.6 | Footer, petits textes |
| `--text-caption` | Cabin | 13px | 400 | 20px | 1.6 | Labels formulaire |
| `--text-small` | Cabin | 11px | 400 | 16px | 1.4 | Mentions légales (checkbox RGPD) |

### Letter-spacing

| Token | Valeur | Usage |
|---|---|---|
| `--ls-wide` | `0.4px` | Boutons (Poppins, certains CTA) |

---

## 3. Espacements

### Echelle (base 8px)

| Token | Valeur | Usage principal |
|---|---|---|
| `--space-1` | `8px` | Gaps internes, petits paddings |
| `--space-1.5` | `10px` | Padding interne cartes, gaps menus |
| `--space-2` | `16px` | Gutter grille, padding formulaires |
| `--space-3` | `24px` | Gap entre éléments de section, padding FAQ |
| `--space-4` | `32px` | Padding FAQ, gap hero |
| `--space-5` | `40px` | Padding top/bottom Accès Direct, top Container |
| `--space-7` | `56px` | Gap hero, gap titres-contenu |
| `--space-8` | `64px` | Padding latéral chiffres, gap chiffres |
| `--space-10` | `80px` | Gap entre sections, padding bottom Container |

---

## 4. Layout / Grille

| Token | Valeur | Notes |
|---|---|---|
| `--grid-viewport` | `1440px` | Largeur de référence desktop |
| `--grid-content` | `1024px` | Max-width contenu principal (hero, liste, contact) |
| `--grid-content-wide` | `1090px` | Max-width blocs élargis (Accès Direct, Chiffres, FAQ, Logos) |
| `--grid-columns` | `12` | Nombre de colonnes |
| `--grid-gutter` | `16px` | Gouttière entre colonnes |
| `--grid-margin` | `208px` | Marge latérale (grille active) |
| `--section-gap` | `80px` | Espace vertical entre sections |
| `--container-padding-top` | `40px` | Padding top Container |
| `--container-padding-bottom` | `80px` | Padding bottom Container |

### Tailles de blocs (desktop)

| Bloc | Largeur | Hauteur | Layout |
|---|---|---|---|
| Menu | 1024px | ~82px | Vertical |
| Hero Accueil | 1024px | ~258px | Horizontal |
| Bloc Liste (Ce qu'on fait) | 1024px | 496px | Horizontal |
| Bloc Accès Direct | 1090px | ~628px | Vertical |
| Bloc Liste 2 (Pourquoi Ocebo) | 1090px | ~706px | Vertical |
| Bloc Chiffres clefs | 1090px | ~789px | Horizontal |
| Bloc Logos | 1090px | ~383px | Vertical |
| Bloc FAQ | 1090px | ~1335px | Vertical |
| Bloc Contact | 1024px | ~458px | Horizontal |
| Footer | 1440px | 22px | Horizontal |

---

## 5. Border Radius

| Token | Valeur | Usage |
|---|---|---|
| `--radius-sm` | `8px` | Boutons, petits éléments, blur containers |
| `--radius-md` | `12px` | Cartes, containers internes |
| `--radius-lg` | `16px` | Cartes services, accordéons FAQ |
| `--radius-xl` | `24px` | Tags, badges arrondis |
| `--radius-pill` | `9999px` | Boutons pill / arrondis complets |

---

## 6. Effets

### Glassmorphism

| Token | Valeur | Usage |
|---|---|---|
| `--blur-card` | `backdrop-filter: blur(8px)` | Cartes glass (services, chiffres, FAQ) |
| `--blur-menu` | `backdrop-filter: blur(40px)` | Barre de navigation |
| `--blur-heavy` | `backdrop-filter: blur(91px)` | Effets glass forts (Bloc Liste) |

### Ombres

| Token | Valeur | Usage |
|---|---|---|
| `--shadow-card` | `0 0 3px #000000` | Ombre subtile sur cartes |
| `--shadow-hard` | `1.6px 1.6px 0 #030217` | Ombre dure "décalée" sur accordéons FAQ |
| `--shadow-drop` | `0 3px 3px rgba(0,0,0,0.25)` | Ombre portée (logos) |
| `--shadow-glow-cyan` | `0 0 14px rgba(21,255,214,0.3)` | Halo lumineux cyan (logos) |

### Transitions (a definir en Phase 1)

| Token | Valeur suggere | Usage |
|---|---|---|
| `--transition-fast` | `150ms ease` | Hover boutons, liens |
| `--transition-base` | `300ms ease` | Accordéons, apparitions |
| `--transition-slow` | `500ms ease-out` | Animations scroll, parallaxe |

---

## 7. Breakpoints (valides)

| Token | Valeur | Cible |
|---|---|---|
| `--bp-mobile` | `320px` | Mobile petit |
| `--bp-tablet` | `768px` | Tablette portrait |
| `--bp-desktop` | `1024px` | Desktop / tablette paysage |
| `--bp-wide` | `1440px` | Desktop large (reference maquette) |

> Pas de maquettes mobile/tablette dans Figma. Adaptation responsive proposee en mobile-first selon ces breakpoints.

---

## 8. Notes & observations

### Inconsistances detectees
- **Polices parasites** : Inter, Roboto, Poppins, Montserrat apparaissent dans certains composants (hérités d'une librairie externe). Les polices du projet sont **Bookmania, Kanit, Cabin**.
- **Valeurs fractionnelles** : Certaines tailles (9.6px, 12.8px, 38.4px) viennent de composants importés a une echelle ~80%. Rationalisees a des valeurs entieres dans ce document.
- **Noto Sans** : Utilise uniquement dans le footer. A confirmer si on le remplace par Cabin pour simplifier.

### Elements decoratifs
- **Paillettes** : Images bitmap en overlay (mode Multiply) creant un effet texture grain
- **Ellipses lumineuses** : Gradients radiaux cyan/jaune/rouge en fond (Component 9) creant des halos ambiants
- **Vagues vectorielles** : Deux paths SVG (Container group) formant des lignes ondulees decoratives

### Decisions validees (2026-04-07)
1. **Noto Sans supprime** — unifie avec Cabin (3 familles : Bookmania, Kanit, Cabin)
2. **Breakpoints confirmes** : 320 / 768 / 1024 / 1440
3. **Menu deroulant** : design propose par le dev, coherent avec le design system
4. **Border radius rationalises** : 8 / 12 / 16 / 24 / pill (9999px)
