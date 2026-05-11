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

## Chantier en cours — Performance "bases solides"

Démarré 2026-05-07 sur branche `chore/perf-foundations` (cible : Mobile ≥ 96, Desktop ≥ 90). Plan **Option Excellence** (validé par user) : Phases 1 → 2 → 4 → mesure finale.

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

### 🟡 Phase 2 (critical CSS + bundle WP) — IMPLÉMENTÉE 2026-05-11, en attente de test user

**Option B retenue** (vs Penthouse automatisé) : critical manuel + defer bundle. Ratio effort/gain meilleur, pas de Puppeteer fragile sur Windows.

**Ce qui a été fait cette session (working tree, pas encore committé)** :

1. **`critical.css`** (148 lignes, 11.8 KB raw / ~4 KB gzip) — créé dans `wp-content/themes/ocebo26/assets/css/` :
   - Reset + tokens + body + canvas/lace + skip-link
   - Header/nav + mobile-menu (état fermé)
   - Hero complet (.hero, .hero__inner, .hero__title, .hero__ctas)
   - Buttons (.btn, --primary, --secondary, --sm)
   - Section-header + section-number + animation start state
   - Utilities (.display-xl, .body-lg, .text-cyan, :focus-visible)
   - Media queries responsive

2. **`bundle.min.css`** (34.7 KB minifié, vs 49 KB raw — 70.7%) — généré par `build/build-css.js`. Concatène les 8 CSS source dans l'ordre cascade WP (tokens → reset → layout → components → sections → animations → utilities → theme), minification basique (commentaires + whitespaces).

3. **`functions.php`** modifié :
   - Bump `OCEBO26_VERSION` à **1.6.0**
   - Remplace les 8 `wp_enqueue_style` par 1 seul (`ocebo26-bundle`)
   - Hook `wp_head` priority 1 : inline `critical.css` en `<style id="ocebo26-critical">` (bypass admin)
   - Filtre `style_loader_tag` étendu : `media=print` + `onload` swap pour `ocebo26-bundle` ET `ocebo26-google-fonts` (bypass `is_admin()`)
   - Editor stack (`enqueue_block_editor_assets`) **intacte** — charge toujours les 9 fichiers individuels avec handles `-editor-*`

4. **HTML statique** (`index.html` racine + `app/public/index.html`) :
   - `<style>` critical inline entre sentinelles `<!-- CRITICAL:BEGIN -->` / `<!-- CRITICAL:END -->`
   - `bundle.min.css` et `slider-simple/style.css` en `media=print onload="this.media='all'"`
   - `<noscript>` fallback pour les deux
   - Injection automatisée par `build/inject-critical-static.js` (idempotent)

5. **Build pipeline** (`package.json`) :
   - `npm run build:css` — bundle WP
   - `npm run build:critical` — re-inject critical dans les statiques
   - `npm run build` enchaîne wp-scripts + build:css + build:critical + build:js

6. **Sync miroir** : tous les fichiers copiés vers `app/public/wp-content/themes/ocebo26/` (functions.php, critical.css, bundle.min.css, package.json, build/*.js). Checksums MD5 vérifiés identiques.

**Gain attendu mobile** : +8-12 pts (FCP 2,7s → ~1,2-1,5s estimé). À mesurer après push + build Vercel.

### À faire prochaine étape (avant fin session)

1. **Test local** par user sur Local Sites (`http://ocebo26.local`) :
   - Hard reload home en viewport mobile (DevTools 414×896)
   - Vérifier qu'il n'y a **pas de FOUC** above-fold (le hero doit apparaître stylé d'emblée)
   - Vérifier qu'aucun élément ne "saute" quand le bundle.min.css finit de charger
   - Tester une page intérieure (services, références) pour vérifier que le hero `--inner` (qui N'EST PAS dans critical) n'a pas de FOUC inacceptable

2. **Si OK localement** : push + tester sur preview branch Vercel + Lighthouse mobile

3. **Si FOUC visible** : identifier le sélecteur manquant, l'ajouter à `critical.css`, re-run `npm run build:critical`

### Phases restantes du plan (après validation Phase 2)
- **Phase 4 — Fonts solides** (self-host Cabin/Kanit, preload LCP) — élimine FOUT et le bordel des URLs Google qui changent
- Mesure finale Lighthouse + comparaison historique

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

## État Git (au moment de la pause 2026-05-11, mi-Phase 2)

**Branche active : `chore/perf-foundations`** (partie de `main` à HEAD `b532ec3`).

**Dernier commit poussé** : `1e0c568` (CLAUDE.md eager FX). Le commit local `57ed488` (chore CLAUDE.md - pause session mystère v1.5.0) n'a pas été poussé — juste de la doc.

**Working tree (NON committé)** — Phase 2 implémentée cette session :
```
M  .clinerules                                                       (laissé par user pré-existant)
M  CLAUDE.md                                                          (cette mise à jour Phase 2)
M  wp-content/themes/ocebo26/functions.php                            (bundle + critical inline + media=print swap, version 1.6.0)
M  wp-content/themes/ocebo26/package.json                             (build:css + build:critical scripts)
A  wp-content/themes/ocebo26/assets/css/critical.css                  (148 lignes, above-fold)
A  wp-content/themes/ocebo26/assets/css/bundle.min.css                (34.7 KB minifié)
A  wp-content/themes/ocebo26/build/build-css.js                       (concat + minif des 8 CSS source)
A  wp-content/themes/ocebo26/build/inject-critical-static.js          (injection idempotente dans index.html)
M  app/public/wp-content/themes/ocebo26/functions.php                 (sync miroir)
A  app/public/wp-content/themes/ocebo26/assets/css/critical.css       (sync miroir)
A  app/public/wp-content/themes/ocebo26/assets/css/bundle.min.css     (sync miroir)
M  app/public/wp-content/themes/ocebo26/package.json                  (sync miroir)
A  app/public/wp-content/themes/ocebo26/build/build-css.js            (sync miroir)
A  app/public/wp-content/themes/ocebo26/build/inject-critical-static.js (sync miroir)
M  index.html                                                          (critical inline + bundle.min.css media=print swap)
M  app/public/index.html                                               (sync miroir)
A  assets/css/critical.css                                             (sync miroir statique)
A  assets/css/bundle.min.css                                           (sync miroir statique)
A  app/public/assets/css/critical.css                                  (sync miroir Local)
A  app/public/assets/css/bundle.min.css                                (sync miroir Local)
```

**À NE PAS oublier au moment de commit** : 1 commit Phase 2 atomique. Suggestion message :
```
feat(perf): critical CSS inline + bundle CSS non-blocking — Phase 2 (v1.6.0)

- Extrait above-fold mobile + desktop dans assets/css/critical.css (~12 KB raw)
- Concatène les 8 CSS source en un bundle.min.css (34.7 KB) via build/build-css.js
- WP: inline critical via wp_head priority 1, bundle async via media=print swap (filtre style_loader_tag étendu, bypass admin)
- Statique: critical inliné entre sentinelles dans index.html par build/inject-critical-static.js (idempotent)
- Editor (Gutenberg) inchangé — charge toujours les 8 CSS individuels
- Bump 1.5.0 → 1.6.0
```

`main` reste propre. **Pas de PR ouverte** — Phase 2 à valider visuellement avant push + Lighthouse.

## Historique des chantiers

Format : *date · résumé 1 ligne · commits clés ou statut*. Les chantiers en cours restent en haut ; les terminés/abandonnés s'accumulent par ordre chrono inverse.

- **2026-05-11** · 🟡 Phase 2 implémentée — critical CSS inline (148 lignes) + bundle CSS WP (34.7 KB) non-blocking via media=print swap ; build/build-css.js + build/inject-critical-static.js ; v1.6.0 ; en attente test user local + Lighthouse mobile (cible : 81→95+)
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
