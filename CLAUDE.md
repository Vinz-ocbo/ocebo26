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
- **Production alias** : `https://ocebo26-testdesign.vercel.app/`
- **Preview branch** : `https://ocebo26-testdesign-26q0y6k8o-vbaliva-2335s-projects.vercel.app/` (a une auth Vercel — 401 si requested sans cookie)

### Statut Phase 1 (code-split JS) — fonctionnel sur Lighthouse, **PAS satisfaisant côté UX user**

**Lighthouse Phase 1 (v1.4.0)** : Desktop 53 → 98, Mobile 92 → 93, TBT desktop 2 220ms → 0ms. Tous les scores au vert.

**Mais le user signale UX dégradée** :
1. ❌ Halo apparaît trop tard ("rendu pas convaincant")
2. ❌ Page perçue comme freezée pendant le chargement
3. ❌ Dots déformés + freeze pendant le drag de fenêtre

**Tentatives de fix successives** (ordre chrono, du plus ancien au plus récent) :
- v1.4.1 (`fa04cf2`) — DotMesh resize : clear immédiat + SPACING adaptatif (cap dotCount ~30K)
- v1.4.2 (`29f4c17`) — Init FX chunké via rIC + rAF avant 1er paint canvas + retrait `pointermove`
- (`c42e1da`) — Retrait des `<link rel="preload">` Google Fonts qui 404'aient
- v1.4.3 (`7f4bbe6`) — Halo plus rapide : ré-introduit pointermove + setTimeout 4000→1500ms + chunks rIC accélérés (200/800/1500→30/50/100)
- v1.5.0 (`b1d9234`) — **Bascule chargement eager** : main-fx.js chargé en parallèle de main.js via `<script defer>` séparé, plus de loader d'engagement. Init reste chunké pour éviter long task.

### 🔴 Pause 2026-05-07 — Mystère à résoudre prochaine session

**Le user dit "je ne vois pas de différence" entre v1.4.3 et v1.5.0**, alors qu'on a fait basculer le mode de chargement de lazy-on-interaction → eager-parallèle. Le code change est réel et déployé. Soit :
- Le user teste un déploiement caché (vérifier la chaîne complète : commit local → push → Vercel deploy → CDN edge → cache navigateur)
- Le bottleneck n'est PAS le timing du JS mais ailleurs (CSS render-blocking, fonts, animations `.reveal`)
- Le user ne voit pas la différence parce que objectivement il y en a très peu (le browser cache la deuxième visite, etc.)
- Sa perception du "halo tout de suite" est sous le plancher physique (HTML+CSS render-blocking = ~500-1000ms minimum incompressible sans critical CSS)

### À investiguer en priorité au reboot

1. **VÉRIFIER la chaîne de déploiement** :
   - Commits poussés : `git log origin/chore/perf-foundations -5`
   - Quel commit Vercel a effectivement build (dashboard Vercel > Deployments)
   - Quelle URL exacte le user teste (préférer l'alias branche `git-chore-perf-foundations` qui pointe sur le dernier commit)
   - Hard reload + Network tab > main-fx.min.js : taille reçue, headers Cache-Control, age

2. **MESURER au lieu de se baser sur la perception** :
   - Demander un Performance trace Chrome (record reload, 5s)
   - Identifier précisément quand le canvas DotMesh fait son 1er paint (rechercher "Paint" dans la timeline)
   - Comparer baseline vs courant — si vraiment "pas de différence" sur cette métrique, alors le mode chargement n'est pas le bottleneck

3. **Questionner les hypothèses** :
   - Le "halo" qu'il décrit, est-ce bien le DotMesh canvas ? (Faire confirmer visuellement — il y a aussi le pulse halo sur les CTA, le glow magenta des laces, etc.)
   - Le perçu "freeze" est-il la fenêtre `.reveal` qui anime opacity 0→1 et donne l'illusion d'un chargement progressif ?
   - Les fonts qui swappent (FOUT) après le CSS ?

4. **Si après mesure on confirme que le timing JS n'est pas le levier** :
   - **Phase 2 (critical CSS) devient le vrai prochain pas** — c'est ce qui peut compresser le ~500-1000ms incompressible HTML+CSS
   - Option Excellence reste valide, juste qu'on a passé du temps sur Phase 1 sans gagner ce qu'on espérait côté ressenti

### Phases restantes du plan
- **Phase 2 — Critical CSS automatisé** (Penthouse) — pousse FCP mobile 2,7s → ~1,2s, score → 96+. C'est probablement LE levier pour le ressenti "page chargée immédiatement"
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

## État Git (au moment de la pause 2026-05-07)

**Branche active : `chore/perf-foundations`** (partie de `main` à HEAD `b532ec3`, **pushée sur `origin`**)

**14 commits sur la branche** :
```
1e0c568 chore: CLAUDE.md historique - eager FX (v1.5.0)
b1d9234 feat(perf): chargement eager main-fx.js — halo visible immédiatement (v1.5.0)
60efb34 chore: CLAUDE.md historique - fix halo tardif (v1.4.3)
7f4bbe6 fix(perf): halo apparaît plus vite — pointermove + setTimeout 1500ms (v1.4.3)
c42e1da fix(perf): retire preload des fonts Google obsolètes (404)
d8b523b chore: CLAUDE.md historique - fix unfreeze UX (v1.4.2)
29f4c17 fix(perf): unfreeze page during FX init — chunked + drop pointermove (v1.4.2)
adee35e chore: CLAUDE.md historique enrichi (Phase 1 résultats + fix resize)
fa04cf2 fix(perf): DotMesh resize freeze + dot deformation (v1.4.1)
d2d1be5 chore: ignore Lighthouse/WebPageTest reports + update CLAUDE.md history
4311e18 feat(perf): code-split JS — main-fx.js lazy-loaded on first interaction
f586f80 chore(perf): document Phase 0 baseline (assets inventory + targets)
fd21e9b chore: add CLAUDE.md project memory (living history)
5fab0e2 chore: corrige description thème (pas FSE, juste theme.json + blocs dynamiques)
```

**Working tree** : `.clinerules` modifié par user (laissé pour commit user). Tout le reste committed + pushed.

`main` reste propre, à `b532ec3` (synchro `origin/main`). **Pas de PR ouverte** — la branche stagne tant que le ressenti UX user n'est pas validé.

**Stratégie** : tout le chantier perf reste sur `chore/perf-foundations`, merge vers `main` quand user valide visuellement ET les Lighthouse sont aux cibles. Si Phase 2/4 résolvent le ressenti, on poursuit ; sinon on documente la limite et on merge ce qui est gagné quand même.

## Historique des chantiers

Format : *date · résumé 1 ligne · commits clés ou statut*. Les chantiers en cours restent en haut ; les terminés/abandonnés s'accumulent par ordre chrono inverse.

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
