#!/usr/bin/env node
/**
 * build-css.js — Bundle + minify CSS du thème
 *
 * Concatène les 8 fichiers CSS dans l'ordre du cascade WP
 * (cf. functions.php : tokens → reset → layout → components →
 * sections → animations → utilities → theme), applique une
 * minification basique (commentaires + whitespaces), écrit
 * assets/css/bundle.min.css.
 *
 * Le bundle est ensuite enqueued en place des 8 fichiers et chargé
 * non-bloquant via media=print swap, tandis que critical.css est
 * inliné en <head>.
 *
 * Usage : npm run build:css
 */

const fs = require('fs');
const path = require('path');

const CSS_DIR = path.join(__dirname, '..', 'assets', 'css');
const ORDER = [
  'fonts.css',
  'tokens.css',
  'reset.css',
  'layout.css',
  'components.css',
  'sections.css',
  'animations.css',
  'utilities.css',
  'theme.css',
];
const OUTPUT = path.join(CSS_DIR, 'bundle.min.css');

/**
 * Minification CSS basique :
 * - retire commentaires /* ... *\/
 * - collapse les espaces autour de { } : ; , > ~
 * - préserve les espaces autour de + et - (obligatoires dans calc() ET
 *   dans :nth-child(2n+1) etc — CSS spec : "+ and - operators must be
 *   surrounded by whitespace" inside math functions)
 * - retire les espaces redondants et lignes vides
 */
function minify(css) {
  // Retire les commentaires /* ... */
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  // Collapse whitespace (espaces, tabs, newlines) en un seul espace
  css = css.replace(/\s+/g, ' ');
  // Retire espaces autour des symboles structurels (PAS + ni -, cf. calc())
  css = css.replace(/\s*([{}:;,>~])\s*/g, '$1');
  // Retire le ; final avant }
  css = css.replace(/;}/g, '}');
  // Trim global
  return css.trim();
}

function main() {
  const parts = [];
  let totalRaw = 0;

  for (const file of ORDER) {
    const fullPath = path.join(CSS_DIR, file);
    if (!fs.existsSync(fullPath)) {
      console.error(`[build-css] MANQUANT : ${file}`);
      process.exit(1);
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    totalRaw += Buffer.byteLength(content, 'utf8');
    parts.push(`/* --- ${file} --- */\n${content}`);
  }

  const concatenated = parts.join('\n\n');
  const minified = minify(concatenated);

  fs.writeFileSync(OUTPUT, minified, 'utf8');

  const sizeMin = Buffer.byteLength(minified, 'utf8');
  const ratio = ((sizeMin / totalRaw) * 100).toFixed(1);
  console.log(
    `[build-css] OK → ${path.relative(process.cwd(), OUTPUT)} ` +
    `(${ORDER.length} fichiers, ${totalRaw} → ${sizeMin} bytes, ${ratio}%)`
  );
}

main();
