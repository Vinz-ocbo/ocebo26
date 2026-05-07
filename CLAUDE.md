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

## Chantier en cours — Performance "bases solides" (in progress, démarré 2026-05-07)

Plan complet validé par user 2026-05-07 sur branche `chore/perf-foundations`.

### Cibles ambitieuses
| Métrique | Cible |
|---|---|
| LCP mobile | ≤ 1,5s |
| INP | ≤ 100ms |
| TBT (Lighthouse) | ≤ 100ms |
| CLS | ≤ 0,05 |
| Lighthouse mobile | ≥ 95 |
| Poids total above-fold | ≤ 250 KB |

### Baseline 2026-05-07

**Lighthouse desktop sur Vercel : 53 / SI 4,3s / TBT 2 220 ms / bfcache cancelled** (URL et mobile à confirmer par user).

**Inventaire assets (gzipped, Brotli sera plus petit) :**
| Asset | Raw | Gzip | Bloquant ? |
|---|---|---|---|
| `index.html` | 35 KB | 6,7 KB | — |
| `accueil.html` | 31 KB | 6,0 KB | — |
| `assets/css/bundle.css` | 37 KB | 6,8 KB | ✅ render-blocking |
| `slider-simple/style.css` | 4 KB | 1,6 KB | ✅ render-blocking |
| `assets/js/main.min.js` | 16,8 KB | 5,6 KB | deferred |
| `slider-simple/view.js` | 10,2 KB | 3,0 KB | deferred |
| **CSS render-blocking total** | 41 KB | **8,4 KB** | sous budget critical 14 KB ✓ |
| **JS total** | 27 KB | **8,6 KB** | très bas ✓ |

**Images slider :** `barreau_lyon3.jpeg` 114 KB, `invest2.jpeg` 131 KB, `guiti3-1.jpg` 143 KB. Lazy-loaded mais pas WebP/AVIF, pas de srcset.

**DOM :** 527 nodes (`index.html`), 470 (`accueil.html`). Slider contient ses slides ×3 (clones).

**Conclusion baseline :** poids OK, problème = **CPU/render** : DotMesh 32K dots → TBT, fonts async + bundle bloquant → SI dégradé.

### Données baseline manquantes (à fournir par user)
- Lighthouse **mobile** sur `/` et `/accueil` (cible `.clinerules` est mobile, score 53 connu = desktop seulement)
- Confirmation de l'URL Vercel testée (`/` ou `/accueil`)
- WebPageTest filmstrip + waterfall sur `/` mobile (idéalement profil "Moto G4 — 4G — Cable" ou équivalent)

### Plan révisé — Option Excellence (validé 2026-05-07)

**Constat baseline mobile** : 92/100 déjà, dépasse cible `.clinerules`. Le 9-phase plan initial était surdimensionné. Scope réduit aux 3 phases à plus haut ROI :

0. Baseline ✅ (terminé)
1. **Code-split JS** (DotMesh/ScrollLace/Parallax → main-fx.js lazy) — débloque desktop (53 → ~80-85)
2. **Critical CSS automatisé** (Penthouse) — pousse FCP mobile 2,7s → ~1,2s, score → 96+
4. **Fonts solides** (self-host Cabin/Kanit, preload LCP) — pousse encore FCP/LCP

**Mesure finale** : Lighthouse desktop+mobile, doc résultats dans historique.

**Phases écartées** (déprioritaires given baseline) :
- Phase 3 CSS purge — bundle.css 6,8 KB gzip déjà sous budget critical
- Phase 5 Images — toutes lazy, pas dans LCP (LCP = texte)
- Phase 6 bfcache — déjà score 1 sur mobile
- Phase 7 Refacto `/inc/` — pertinent pour `.clinerules`-compliance, à traiter en chantier qualité séparé hors-perf
- Phase 8 Tests/monitoring — recommandé mais hors-scope perf
- Phase 9 Itérations — à voir après mesure finale

Cibles révisées : **Mobile ≥ 96 / Desktop ≥ 90**.

### Diagnostic posé
**Cause primaire TBT** : `initDotMesh()` dans `wp-content/themes/ocebo26/assets/js/main.js:737` génère ~32 000 dots (SPACING=8 sur 1920×1080) animés via canvas 2D. Différé via `requestIdleCallback({ timeout: 5000 })` mais Vercel sert la page si vite que `idle` arrive **dans** la fenêtre TBT de Lighthouse → l'init se mesure.

**Speed Index 4,3s** : polices async (Cabin/Kanit/Bookmania `media=print/onload`) + `bundle.css` (37 KB) render-blocking.

**bfcache** : aucun `unload`/`beforeunload`/`pagehide` listener trouvé en grep. Cause probable côté headers Vercel — faible gain de score, traiter après.

### Plan retenu
**Option retenue (effort S, ~30-60min)** — combinaison de 3 sub-fixes pour passer ~53 → ~80 :

1. **Tie DotMesh à la première interaction** : remplacer `requestIdleCallback` par déclenchement sur `scroll` ou `pointermove` (premier des deux), avec `setTimeout(3500)` en filet. Sortir DotMesh de la fenêtre TBT garantie.
2. **Réduire densité** : `SPACING=8 → 16` (4× moins de dots, 8K au lieu de 32K). Tester rendu visuel — si trop différent, retomber sur `SPACING=12`.
3. **Skip DotMesh sur CPU faible** : `navigator.hardwareConcurrency < 4` ou `navigator.deviceMemory < 4`.

Si après ces 3 fixes on est ≥ 75 et l'utilisateur vise ≥ 90 → enchaîner sur **Option B** : critical CSS inline ≤ 14 KB + `bundle.css` non-blocking. Plus risqué (FOUC).

### Questions ouvertes (à poser au user au reboot)
- Tu testes Lighthouse sur **`/`** ou **`/accueil`** côté Vercel ? (deux pages différentes)
- Tu valides toujours l'option retenue (3 sub-fixes), ou tu veux d'abord remesurer ?

### Fichiers à toucher pour Option retenue
- `wp-content/themes/ocebo26/assets/js/main.js` lignes ~737 (DotMesh) et ~1351 (init)
- Build : `npm run build:js` depuis `wp-content/themes/ocebo26/` régénère `main.min.js`
- Sync miroirs : copier `main.js` + `main.min.js` vers `assets/js/`, `app/public/assets/js/`, `app/public/wp-content/themes/ocebo26/assets/js/`

## État Git (en cours)

- Branche active : **`chore/perf-foundations`** (partie de `main` à HEAD `b532ec3`)
- Commits sur la branche (non pushés) :
  - `5fab0e2` chore: corrige description thème (pas FSE, juste theme.json + blocs dynamiques)
  - `fd21e9b` chore: add CLAUDE.md project memory (living history)
  - `f586f80` chore(perf): document Phase 0 baseline (assets inventory + targets)
  - `4311e18` feat(perf): code-split JS — main-fx.js lazy-loaded on first interaction
  - `d2d1be5` chore: ignore Lighthouse/WebPageTest reports + update CLAUDE.md history
  - `fa04cf2` fix(perf): DotMesh resize freeze + dot deformation (v1.4.1)
- **Working tree** : `.clinerules` modifié par user, laissé pour commit user
- `main` reste propre, à `b532ec3` (synchro `origin/main`)
- Stratégie : tout le chantier perf reste sur `chore/perf-foundations`, merge vers `main` quand stable et validé par mesure

## Historique des chantiers

Format : *date · résumé 1 ligne · commits clés ou statut*. Les chantiers en cours restent en haut ; les terminés/abandonnés s'accumulent par ordre chrono inverse.

- **2026-05-07** · Bascule chargement eager main-fx.js (priorité user : halo immédiat) ; main.js -15% sans loader ; init reste chunké pour éviter long task ; trade-off score Lighthouse 98→~90 attendu ; commit `b1d9234` ; v1.5.0
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
