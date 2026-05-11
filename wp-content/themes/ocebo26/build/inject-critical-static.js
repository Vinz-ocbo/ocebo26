#!/usr/bin/env node
/**
 * inject-critical-static.js — Inline critical.css dans les index.html statiques
 *
 * Le pendant statique du `wp_head` PHP qui inline critical.css côté WP.
 * Côté Vercel (HTML statique), pas de PHP → on inline mécaniquement le contenu
 * de critical.css à l'emplacement marqué dans index.html.
 *
 * Idempotent : peut être lancé plusieurs fois, il remplace toujours le bloc
 * existant entre les sentinelles <!-- CRITICAL:BEGIN --> et <!-- CRITICAL:END -->.
 * Si les sentinelles n'existent pas (premier run), il les crée à la place du
 * vieux `<link href="assets/css/bundle.css">`.
 *
 * Cibles : `index.html` (racine repo) + `app/public/index.html` (miroir Local).
 *
 * Usage : npm run build:critical (ou inclus dans `npm run build`).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const CRITICAL_SRC = path.join(__dirname, '..', 'assets', 'css', 'critical.css');
const TARGETS = [
  path.join(ROOT, 'index.html'),
  path.join(ROOT, 'app', 'public', 'index.html'),
];

const BEGIN = '<!-- CRITICAL:BEGIN — auto-injecté par build/inject-critical-static.js, ne pas éditer à la main -->';
const END = '<!-- CRITICAL:END -->';

function buildBlock(criticalCss) {
  return [
    BEGIN,
    '<style id="critical-css">',
    criticalCss.trim(),
    '</style>',
    '',
    '<!-- Bundle CSS complet (non-blocking via media=print swap) -->',
    '<link rel="stylesheet" href="assets/css/bundle.min.css" media="print" onload="this.media=\'all\'">',
    '<link rel="stylesheet" href="wp-content/themes/ocebo26/blocks/slider-simple/style.css" media="print" onload="this.media=\'all\'">',
    '<noscript>',
    '  <link rel="stylesheet" href="assets/css/bundle.min.css">',
    '  <link rel="stylesheet" href="wp-content/themes/ocebo26/blocks/slider-simple/style.css">',
    '</noscript>',
    END,
  ].join('\n  ');
}

function inject(filePath, block) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[inject-critical] SKIP (absent) : ${filePath}`);
    return false;
  }
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Run subséquent : remplace le bloc existant entre sentinelles
  const sentinelRe = new RegExp(
    `${escapeRe(BEGIN)}[\\s\\S]*?${escapeRe(END)}`,
    'm'
  );
  if (sentinelRe.test(html)) {
    html = html.replace(sentinelRe, block);
    fs.writeFileSync(filePath, html);
    console.log(`[inject-critical] UPDATED : ${path.relative(ROOT, filePath)}`);
    return true;
  }

  // 2. Premier run : remplace le vieux bloc bundle.css + slider style
  const legacyRe =
    /<!-- Bundle CSS \(1 request instead of 7\) -->\s*<link rel="stylesheet" href="assets\/css\/bundle\.css">\s*<link rel="stylesheet" href="wp-content\/themes\/ocebo26\/blocks\/slider-simple\/style\.css">/;
  if (legacyRe.test(html)) {
    html = html.replace(legacyRe, block);
    fs.writeFileSync(filePath, html);
    console.log(`[inject-critical] FIRST-RUN INJECTED : ${path.relative(ROOT, filePath)}`);
    return true;
  }

  console.warn(
    `[inject-critical] ATTENTION : ni sentinelle ni bloc legacy trouvé dans ${path.relative(ROOT, filePath)}`
  );
  return false;
}

function escapeRe(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function main() {
  if (!fs.existsSync(CRITICAL_SRC)) {
    console.error(`[inject-critical] MANQUANT : ${CRITICAL_SRC}`);
    process.exit(1);
  }
  const criticalCss = fs.readFileSync(CRITICAL_SRC, 'utf8');
  const block = buildBlock(criticalCss);

  let ok = 0;
  for (const target of TARGETS) {
    if (inject(target, block)) ok++;
  }
  console.log(`[inject-critical] ${ok}/${TARGETS.length} fichiers traités`);
}

main();
