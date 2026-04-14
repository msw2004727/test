/**
 * i18n Key 同步檢查腳本
 *
 * 用法：node scripts/i18n-sync.mjs
 *
 * 以 zh-TW.json 為主檔，比對所有其他語系檔案：
 * - 報告缺少的 key（其他語系有但 zh-TW 沒有）
 * - 報告多餘的 key（zh-TW 有但其他語系沒有）
 * - 報告空值（翻譯為空字串）
 * - 報告仍含 __NEEDS_TRANSLATION__ 標記的項目
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const I18N_DIR = join(import.meta.dirname, '..', 'i18n');
const MASTER = 'zh-TW.json';

const masterData = JSON.parse(readFileSync(join(I18N_DIR, MASTER), 'utf-8'));
const masterKeys = new Set(Object.keys(masterData));
const files = readdirSync(I18N_DIR).filter(f => f.endsWith('.json') && f !== MASTER);

let hasError = false;

for (const file of files) {
  const data = JSON.parse(readFileSync(join(I18N_DIR, file), 'utf-8'));
  const keys = new Set(Object.keys(data));
  const missing = [...masterKeys].filter(k => !keys.has(k));
  const extra = [...keys].filter(k => !masterKeys.has(k));
  const empty = [...keys].filter(k => keys.has(k) && data[k] === '');
  const needsTranslation = [...keys].filter(k => String(data[k]).includes('__NEEDS_TRANSLATION__'));

  console.log(`\n=== ${file} ===`);

  if (missing.length) {
    hasError = true;
    console.log(`  MISSING (${missing.length}):`);
    missing.forEach(k => console.log(`    - ${k}`));
  }
  if (extra.length) {
    hasError = true;
    console.log(`  EXTRA (${extra.length}):`);
    extra.forEach(k => console.log(`    + ${k}`));
  }
  if (empty.length) {
    console.log(`  EMPTY (${empty.length}):`);
    empty.forEach(k => console.log(`    ? ${k}`));
  }
  if (needsTranslation.length) {
    console.log(`  NEEDS TRANSLATION (${needsTranslation.length}):`);
    needsTranslation.forEach(k => console.log(`    * ${k}`));
  }
  if (!missing.length && !extra.length && !empty.length && !needsTranslation.length) {
    console.log('  OK - all keys match');
  }
}

console.log(`\n--- Master (${MASTER}): ${masterKeys.size} keys ---`);
console.log(`--- Checked ${files.length} language files ---`);

if (hasError) {
  console.log('\n[WARN] Key mismatches found. Run translations to fix.\n');
  process.exit(1);
} else {
  console.log('\n[OK] All language files are in sync.\n');
}
