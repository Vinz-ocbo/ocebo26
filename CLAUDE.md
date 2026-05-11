# CLAUDE.md — Contexte projet & reprise de session

> Ce fichier sert à reprendre fluide entre sessions. Il **ne duplique pas** `.clinerules` (standards projet) ni les mémoires auto-Claude — il pointe vers elles et capture l'état courant.
>
> ⚠️ **Document vivant** : à mettre à jour avant chaque pause/fin de session, et à chaque changement matériel (diagnostic qui évolue, décision prise, chantier qui avance ou se ferme). Voir `feedback_maintain_claude_md.md` en mémoire.

## Sources de vérité

1. **`.clinerules`** (racine repo) — Standards projet (posture senior, perf/a11y/SEO budgets, tests, Git). À lire en début de toute tâche non triviale.
2. **`C:\Users\vbali\.claude\projects\C--Users-vbali-Local-Sites-ocebo26\memory\MEMORY.md`** — Mémoires auto (architecture, workflow déploiement, sync miroirs, pièges connus).

**Lire ces deux sources avant tout travail technique.**

## Architecture rapide

Thème WordPress **classique** (pas FSE malgré l'ancien tag) :
- `wp-content/themes/ocebo26/` — thème source
- `app/public/wp-content/themes/ocebo26/` — miroir Local Sites
- `assets/` (racine) + `app/public/assets/` — miroirs statiques servis par Vercel
- Voir `project_overview.md` en mémoire pour le détail (pourquoi pas FSE, miroir Vercel, blocs custom)

**Toute édition CSS/JS du thème doit être synchronisée dans les 4 emplacements** (voir `feedback_sync_static_assets.md` en mémoire).

## Règles de collaboration

- **Pas de git commit/push automatique** sans demande explicite (`feedback_no_auto_push.md`)
- **Filtres `script_loader_tag` / `style_loader_tag`** : `if (is_admin()) return $tag;` en première ligne (`feedback_admin_no_defer.md`) — sinon Gutenberg casse
- **Conventional Commits + commits atomiques** (cf. `.clinerules`)
- Réponses : posture senior, alternatives format "Option retenue X — Alternative Y (avantages/inconvénients)", estimation effort S/M/L

## ✅ Chantier clos — Performance "bases solides"

Démarré 2026-05-07, clos 2026-05-11 sur branche `chore/perf-foundations` (merge vers `main` à venir). Plan **Option Excellence** : Phases 1 → 2 → 4 toutes implémentées et validées.

### 🏁 Résultats finaux Lighthouse Vercel (2026-05-11)

| Métrique | Baseline | Phase 1 v1.5.0 | **Phase 4 v1.7.0** | Δ baseline |
|---|---|---|---|---|
| Desktop | 53 | 99 | **100** | **+47** |
| Mobile | 92 | 81 | **90** | **-2** |

**Lecture** : Desktop atteint la perfection (100). Mobile : on récupère +9 pts depuis la chute Phase 1 (81→90) en gardant l'UX halo eager. On est juste sous la cible ≥95 ambitieuse mais au-dessus de la baseline standard ≥90, et le ressenti UX est conforme aux attentes user (halo immédiat sur Vercel HTTP/2, reveals fonctionnelles).

**Cible ≥95 non atteinte mobile** : les 5 pts restants demanderaient des changements plus invasifs (typekit async risqué pour LCP H1, ou DOM reduction des slider clones ×3). Trade-off jugé acceptable par user.

### URLs Vercel testées
- **Production alias** (sert `main` → AVANT v1.5.0/v1.6.0) : `https://ocebo26-testdesign.vercel.app/`
- **Preview branch dernier commit poussé** : variable, format `https://ocebo26-testdesign-XXXX-vbaliva-2335s-projects.vercel.app/` (visible dashboard Vercel > Deployments). Exemple v1.5.0 : `ocebo26-testdesign-6uqcczvsc-vbaliva-2335s-projects.vercel.app/` (testé OK, halo visible, main-fx.min.js chargé).

### ✅ Phase 1 (code-split JS, chargement eager v1.5.0) — VALIDÉE 2026-05-11

**Le mystère "pas de différence" résolu** : le user testait l'alias prod (qui sert `main`, donc avant la branche perf). Une fois testé sur la **preview URL de la branche**, la différence est nette : main-fx.min.js charge bien en parallèle, halo visible immédiatement.

**Lighthouse v1.5.0 sur preview branch (2026-05-11)** :
- Desktop : **99** (cible ≥ 95 ambitieuse — dépassée)
- Mobile : **81** (cible ≥ 95 — écart à combler par Phase 2)
- Trade-off accepté : mobile baseline 92 → 81 (la bascule eager FX coûte du score mobile, compensé par l'UX halo immédiat)

**Tentatives Phase 1 (chrono)** :
- v1.4.0 (`4311e18`) — code-split lazy-on-interaction main-fx.js
- v1.4.1 (`fa04cf2`) — DotMesh resize : clear immédiat + SPACING adaptatif
- v1.4.2 (`29f4c17`) — Init FX chunké rIC + rAF + retrait pointermove
- v1.4.3 (`7f4bbe6`) — Halo plus rapide : ré-introduit pointermove + setTimeout 4000→1500ms
- v1.5.0 (`b1d9234`) — **Bascule chargement eager** : main-fx.js parallèle via `<script defer>` séparé

### ✅ Phase 2 (critical CSS + bundle WP) — VALIDÉE LOCAL 2026-05-11

Committée en `8918087` (feat) + `758e281` (chore CLAUDE.md). User a confirmé en local "tout est ok pour l'affichage du hero". Bug minifier intermédiaire (espaces autour de `+` dans `calc()`) résolu, hero correctement positionné à 202px sous le menu en desktop.

### ✅ Phase 4 (fonts solides) — VALIDÉE VERCEL 2026-05-11

**Scope** : self-host Cabin (variable, weights 400-600) + Kanit (400, 500), preload des fonts critiques, retrait Google CDN. Bookmania reste sur Adobe Typekit (license self-host non triviale).

**Ce qui a été fait** :

1. **3 fichiers woff2 téléchargés** depuis fonts.gstatic.com (subset latin uniquement, suffit pour français) :
   - `cabin-variable-latin.woff2` (28.3 KB, variable font 400-600)
   - `kanit-400-latin.woff2` (19.3 KB)
   - `kanit-500-latin.woff2` (19.2 KB)
   Synchronisés aux 4 emplacements (`wp-content/themes/.../assets/fonts/`, idem `app/public/wp-content/...`, `assets/fonts/`, `app/public/assets/fonts/`).

2. **`assets/css/fonts.css`** — nouveau fichier avec 3 `@font-face` (1 Cabin variable + 2 Kanit séparés), `font-display: swap`, URLs `url('../fonts/...')` qui résolvent correctement WP comme statique.

3. **`bundle.min.css` (1.7.0)** — concat de 9 fichiers maintenant (fonts.css inclus en premier), 50.8 KB raw → 35.2 KB minifié (69.4%).

4. **`functions.php`** :
   - Bump 1.6.0 → **1.7.0**
   - `wp_enqueue_style('ocebo26-google-fonts', ...)` retiré
   - `wp_resource_hints` : retiré `fonts.googleapis.com` + `fonts.gstatic.com` du preconnect, gardé typekit
   - `style_loader_tag` : retiré `'ocebo26-google-fonts'` du filtre async (n'existe plus)
   - `wp_head` priority 1 : **PAS de preload font** (testé puis retiré — voir Note ci-dessous)
   - Editor `enqueue_block_editor_assets` : retiré `ocebo26-google-fonts-editor`, ajouté `fonts` en tête de la liste `$css_files`

5. **HTML statique** (`index.html` racine + `app/public/index.html`) :
   - Preconnect : retiré `fonts.googleapis.com` + `fonts.gstatic.com`, gardé `p.typekit.net` + `use.typekit.net`
   - **PAS de preload font** (testé puis retiré — voir Note ci-dessous)
   - Bloc post-critical : retiré le `<link>` Google Fonts CSS + son noscript, conservé typekit (async via media=print swap)

**Note régression preload (2026-05-11)** : v1.7.0 initiale incluait `<link rel="preload">` pour Cabin variable + Kanit 400. User a signalé sur local WP que le halo DotMesh et les reveals des sections sous le slider apparaissaient plus tard qu'en Phase 2. Diagnostic : sur Local Sites HTTP/1.1 (max 6 connexions parallèles/origine), les preloads priorité haute grabbaient des slots au détriment de `main.min.js` / `main-fx.min.js` (defer, priorité medium). Solution : preloads retirés des 3 fichiers (functions.php + 2 index.html), behaviour restauré. Fonts maintenant via `@font-face` dans bundle.min.css avec `font-display:swap` — brief fallback Cabin/Kanit puis swap. Mémoire : `feedback_font_preload_http1.md`.

**Gain attendu** :
- 1 HTTP request en moins (Google Fonts CSS éliminé)
- 1 preconnect en moins (`fonts.googleapis.com`)
- Fonts disponibles ~100-200ms plus tôt (preload + same-origin)
- LCP body/buttons : meilleur (Cabin/Kanit chargés en parallèle du critical au lieu d'attendre)
- FOUT visible MAIS court (font-display: swap)
- URLs stables (plus de versionnement aléatoire Google v15→v17, v27→v35)
- Côté WP : pas de gain sur typekit (toujours sync, intentionnel pour LCP H1)
- Côté statique Vercel : où Lighthouse mesure, devrait pousser le mobile 81 vers 90+

**Mesure Vercel** : Desktop 100, Mobile 90 (cf. tableau plus haut). User a confirmé le halo immédiat sur HTTP/2, validant le diagnostic de contention HTTP/1.1.

### Cibles ambitieuses (rappel)
| Métrique | Cible |
|---|---|
| LCP mobile | ≤ 1,5s |
| INP | ≤ 100ms |
| TBT (Lighthouse) | ≤ 100ms |
| CLS | ≤ 0,05 |
| Lighthouse mobile | ≥ 95 |
| Poids total above-fold | ≤ 250 KB |

### Baseline 2026-05-07 (référence pour comparer)
- Lighthouse desktop : 53 / SI 4,3s / TBT 2 220 ms / bfcache cancelled
- Lighthouse mobile : 92 / FCP 2,7s (score 0.59 — point faible) / LCP 2,7s / TBT 0ms / SI 2,7s
- Inventaire : `bundle.css` 37 KB raw / 6,8 KB gzip render-blocking ; main.min.js 16,8 KB / 5,6 KB gzip ; main-fx.min.js (v1.4+) 8 KB / 3,3 KB gzip
- DOM : 527 nodes home, 470 accueil. Slider clones ses slides ×3.

## État Git (2026-05-11, post-validation Vercel)

**Branche `chore/perf-foundations`** poussée sur origin à `c4c83f6`. Working tree clean sauf `.clinerules` (user-owned).

**Commits de la branche depuis `main` (b532ec3)** :
```
c4c83f6 chore: CLAUDE.md historique - Phase 4 fonts self-hostées (v1.7.0)
3c3f2ef feat(perf): self-host Cabin/Kanit + retrait Google Fonts CDN — Phase 4 (v1.7.0)
758e281 chore: CLAUDE.md historique - Phase 2 critical CSS (v1.6.0)
8918087 feat(perf): critical CSS inline + bundle CSS non-blocking — Phase 2 (v1.6.0)
57ed488 chore: CLAUDE.md - pause session, mystère "pas de différence" v1.5.0 documenté
1e0c568 chore: CLAUDE.md historique - eager FX (v1.5.0)
b1d9234 feat(perf): chargement eager main-fx.js — halo visible immédiatement (v1.5.0)
+ 8 commits antérieurs Phase 0/1 (cf. git log)
```

**Prochaine action** : merge vers `main` (--no-ff pour préserver la chronologie du chantier).

### Working tree archivé pour mémoire (avant clôture) :
```
M  .clinerules                                                          (pré-existant user)
M  CLAUDE.md                                                             (Phase 4 ajoutée)
M  wp-content/themes/ocebo26/functions.php                               (1.7.0, removeGoogle, add font preload)
M  wp-content/themes/ocebo26/build/build-css.js                          (ajout fonts.css à ORDER)
A  wp-content/themes/ocebo26/assets/css/fonts.css                        (3 @font-face self-hostés)
M  wp-content/themes/ocebo26/assets/css/bundle.min.css                   (regénéré avec fonts.css)
A  wp-content/themes/ocebo26/assets/fonts/cabin-variable-latin.woff2     (28 KB)
A  wp-content/themes/ocebo26/assets/fonts/kanit-400-latin.woff2          (19 KB)
A  wp-content/themes/ocebo26/assets/fonts/kanit-500-latin.woff2          (19 KB)
[+ sync miroirs : app/public/wp-content/themes/ocebo26/{functions.php, build/build-css.js, assets/css/fonts.css, assets/css/bundle.min.css, assets/fonts/*.woff2}]
[+ sync statiques : index.html, app/public/index.html (preload local au lieu de gstatic + retrait Google Fonts CSS)]
[+ sync statiques : assets/css/{fonts.css, bundle.min.css}, app/public/assets/css/{fonts.css, bundle.min.css}, assets/fonts/*.woff2, app/public/assets/fonts/*.woff2]
```

**Commit Phase 4 à préparer après validation user**. Suggestion message :
```
feat(perf): self-host Cabin/Kanit + preload LCP fonts — Phase 4 (v1.7.0)

- Télécharge 3 woff2 subset latin (Cabin variable 28 KB, Kanit 400/500 19 KB chacun) dans assets/fonts/
- assets/css/fonts.css : 3 @font-face avec font-display:swap, URLs relatives ../fonts/
- bundle.min.css : fonts.css concaténé en premier (9 fichiers, 35.2 KB minifié)
- WP : wp_enqueue_style ocebo26-google-fonts retiré, preconnect googleapis/gstatic retirés, wp_head priority 1 imprime aussi les <link rel=preload> pour Cabin variable + Kanit 400 avant le critical inline
- Statique : preconnect googleapis/gstatic retirés, link rel=preload local ajoutés, Google Fonts CSS link retiré
- Bookmania reste sur Adobe Typekit (license self-host non triviale)
- Bump 1.6.0 → 1.7.0
```

`main` reste propre. **Pas de PR ouverte** — push prévu après validation user de Phase 4 (les 2 commits Phase 2 + nouveau commit Phase 4 partiront ensemble).

## Historique des chantiers

Format : *date · résumé 1 ligne · commits clés ou statut*. Les chantiers en cours restent en haut ; les terminés/abandonnés s'accumulent par ordre chrono inverse.

- **2026-05-11** · ✅ Chantier perf clos — Lighthouse Vercel final : **Desktop 100 / Mobile 90** (vs baseline 53/92, +47/-2) ; user valide ressenti halo immédiat HTTP/2 ; cible ≥95 mobile non atteinte mais 90 acceptable (trade-off accepté) ; merge `chore/perf-foundations` vers `main` à faire
- **2026-05-11** · Régression preload font fixée — sur Local Sites HTTP/1.1, `<link rel=preload as=font>` saturait connexions parallèles et retardait main.min.js/main-fx.min.js (halo + reveals décalés) ; preloads retirés des 3 fichiers, fonts via @font-face dans bundle.min.css avec font-display:swap ; mémoire `feedback_font_preload_http1.md`
- **2026-05-11** · Phase 4 implémentée + commit `3c3f2ef` + `c4c83f6` — self-host Cabin (variable 28 KB) + Kanit 400/500 (19 KB chacun), retrait Google Fonts CDN, bundle 9 fichiers ; v1.7.0
- **2026-05-11** · ✅ Phase 2 validée local + commitée — `8918087` (feat) + `758e281` (chore CLAUDE.md) ; user a confirmé "tout est ok pour l'affichage du hero" après fix bug minifier calc() ; v1.6.0
- **2026-05-11** · Bug minifier `calc()` corrigé · regex stripait les espaces autour de `+` même dans `calc()`, browser parsait comme 0, hero collé en haut ; fix : retiré `+` du char class du regex ; mémoire `feedback_css_minifier_calc.md`
- **2026-05-11** · ✅ Phase 1 v1.5.0 validée objectivement — user testait l'alias prod (= main, avant v1.5.0) ; sur preview branch URL il voit bien la différence, halo immédiat, main-fx.min.js chargé ; Lighthouse desktop 99 / mobile 81
- **2026-05-07** · 🔴 Pause perf — user pas satisfait du ressenti UX malgré 5 itérations de fix · v1.4.0→v1.5.0, à reprendre par mesure objective avant de continuer (cf. "Mystère à résoudre" ci-dessus)
- **2026-05-07** · Bascule chargement eager main-fx.js (priorité user : halo immédiat) ; main.js -15% sans loader ; init reste chunké pour éviter long task ; trade-off score Lighthouse 98→~90 attendu mais user dit "pas de différence" ; commit `b1d9234` ; v1.5.0
- **2026-05-07** · Fix halo trop tardif · ré-introduit pointermove + setTimeout 4000→1500ms + chunks rIC accélérés (200/800/1500→30/50/100) ; commit `7f4bbe6` ; v1.4.3
- **2026-05-07** · Fix preload fonts Google obsolètes (404) ; commit `c42e1da`
- **2026-05-07** · Fix UX page freeze pendant FX init · init chunké rIC + rAF avant 1er paint + retrait pointermove du loader ; commit `29f4c17` ; v1.4.2
- **2026-05-07** · Fix DotMesh resize · clear immédiat + SPACING adaptatif (cap dotCount à ~30K) ; commit `fa04cf2` ; v1.4.1
- **2026-05-07** · Phase 1 perf — résultats Vercel : **desktop 53→98 (+45)**, mobile 92→93, TBT desktop 2 220ms→0ms, LCP desktop 0,8s, SI desktop 0,8s
- **2026-05-07** · Phase 1 perf code-split JS · main-fx.js lazy-loadé sur première interaction, main.min.js -44%/-50% gzip (commit `4311e18`) ; v1.4.0
- **2026-05-07** · Plan révisé Option Excellence · baseline mobile = 92 (déjà ≥ 90), scope réduit aux 3 phases ROI (1, 2, 4)
- **2026-05-07** · Pause perf · Diagnostic posé (DotMesh → TBT 2,2s), plan retenu, en attente reprise — voir "Chantier en cours" ci-dessus
- **2026-05-07** · Architecture clarifiée · style.css ne revendique plus FSE, archi "PHP classique + theme.json + blocs dynamiques" actée comme déviation assumée à `.clinerules` (working tree, non commité)
- **2026-05-07** · 3 nouveaux blocs · `hero-inner`, `chronologie`, `bloc-2-colonnes` ajoutés et intégrés (commit `7058179`) ; v1.3.4
- **2026-05-07** · Hygiène Git · `.gitignore` étendu (.tmp/, debug.log) (commit `852b087`) ; checklist/pourquoi tweaks isolés (commit `b532ec3`)
- **2026-04-29** · Perf pass v1 · Lighthouse 66 sur Local Sites HTTP/1.1 ; minif main.js, defer auto, dequeue wp-emoji/embed/jquery-migrate/block-library, .htaccess cache headers, fonts async (sauf typekit) (commits `c3ba13a`, `062364c`, `e1e3c87`) — voir `project_perf_status.md` en mémoire
