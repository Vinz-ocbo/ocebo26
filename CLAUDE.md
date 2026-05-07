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

## Chantier en cours — Performance (paused 2026-05-07)

### État
Lighthouse **desktop sur Vercel : 53** / SI 4,3s / **TBT 2 220 ms** / bfcache cancelled.
Cible `.clinerules` : Lighthouse mobile ≥ 90.

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

## État Git (au moment de la pause)

- Branche : `main`, à jour avec `origin/main`
- 3 commits récents poussés : gitignore, 3 nouveaux blocs + admin defer guard, checklist/pourquoi tweaks
- **Working tree non commité** :
  - `.clinerules` (modifs user, à lui de commiter)
  - `wp-content/themes/ocebo26/style.css` + miroir `app/public/...` (chantier "Option B archi" — description thème corrigée, plus FSE)
- Suggestion de message si user veut commiter ces 2 derniers : `chore: corrige description thème (pas FSE, juste theme.json + blocs dynamiques)`

## Historique des chantiers

Format : *date · résumé 1 ligne · commits clés ou statut*. Les chantiers en cours restent en haut ; les terminés/abandonnés s'accumulent par ordre chrono inverse.

- **2026-05-07** · Pause perf · Diagnostic posé (DotMesh → TBT 2,2s), plan retenu, en attente reprise — voir "Chantier en cours" ci-dessus
- **2026-05-07** · Architecture clarifiée · style.css ne revendique plus FSE, archi "PHP classique + theme.json + blocs dynamiques" actée comme déviation assumée à `.clinerules` (working tree, non commité)
- **2026-05-07** · 3 nouveaux blocs · `hero-inner`, `chronologie`, `bloc-2-colonnes` ajoutés et intégrés (commit `7058179`) ; v1.3.4
- **2026-05-07** · Hygiène Git · `.gitignore` étendu (.tmp/, debug.log) (commit `852b087`) ; checklist/pourquoi tweaks isolés (commit `b532ec3`)
- **2026-04-29** · Perf pass v1 · Lighthouse 66 sur Local Sites HTTP/1.1 ; minif main.js, defer auto, dequeue wp-emoji/embed/jquery-migrate/block-library, .htaccess cache headers, fonts async (sauf typekit) (commits `c3ba13a`, `062364c`, `e1e3c87`) — voir `project_perf_status.md` en mémoire
