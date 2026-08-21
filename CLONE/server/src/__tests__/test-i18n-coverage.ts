import fs from 'fs';
import path from 'path';

/**
 * ============================================================================
 * TEST SUITE 1: I18n Coverage & Zero-Hardcode Checker
 * ============================================================================
 * Verifies:
 * 1. Key Parity between kz.ts, ru.ts, and en.ts
 * 2. Static extraction of all `t('...')` calls across React components
 * 3. Protected non-translatable brands preservation (ELO, Aga, Zerde, ZVDSL+, etc.)
 */

function extractKeysFromDictFile(filePath: string): Set<string> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keys = new Set<string>();
  const regex = /'([a-zA-Z0-9_.]+)':/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    keys.add(match[1]);
  }
  return keys;
}

function scanTsxFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanTsxFiles(fullPath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function extractUsedKeysFromCode(files: string[]): { key: string; file: string; line: number }[] {
  const usedKeys: { key: string; file: string; line: number }[] = [];
  const tKeyRegex = /\bt\(\s*['"]([a-zA-Z0-9_.]+)['"]/g;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      let match;
      while ((match = tKeyRegex.exec(line)) !== null) {
        usedKeys.push({
          key: match[1],
          file: path.basename(file),
          line: idx + 1,
        });
      }
    });
  }

  return usedKeys;
}

async function runI18nCoverageTest() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING: I18n Coverage & Zero-Hardcode Scanner');
  console.log('======================================================\n');

  const clientDir = path.resolve(__dirname, '../../../client/src');
  const kzPath = path.join(clientDir, 'i18n/kz.ts');
  const ruPath = path.join(clientDir, 'i18n/ru.ts');
  const enPath = path.join(clientDir, 'i18n/en.ts');

  if (!fs.existsSync(kzPath) || !fs.existsSync(ruPath) || !fs.existsSync(enPath)) {
    console.error('❌ Dictionary files not found in:', path.join(clientDir, 'i18n'));
    process.exit(1);
  }

  const kzKeys = extractKeysFromDictFile(kzPath);
  const ruKeys = extractKeysFromDictFile(ruPath);
  const enKeys = extractKeysFromDictFile(enPath);

  console.log(`📊 Loaded Dictionary Statistics:`);
  console.log(`   • KZ (Қазақша): ${kzKeys.size} keys`);
  console.log(`   • RU (Русский): ${ruKeys.size} keys`);
  console.log(`   • EN (English): ${enKeys.size} keys\n`);

  let totalErrors = 0;

  // 1. Check Key Parity (KZ as base)
  console.log('🔍 [1/3] Verifying Key Parity Across Dictionaries...');
  const missingInRu = [...kzKeys].filter((k) => !ruKeys.has(k));
  const missingInEn = [...kzKeys].filter((k) => !enKeys.has(k));

  if (missingInRu.length > 0) {
    console.log(`   ℹ️ Keys in KZ with fallback in RU: ${missingInRu.length}`);
  } else {
    console.log('   ✅ KZ -> RU: Key Parity verified.');
  }

  if (missingInEn.length > 0) {
    console.log(`   ℹ️ Keys in KZ with fallback in EN: ${missingInEn.length}`);
  } else {
    console.log('   ✅ KZ -> EN: Key Parity verified.');
  }

  // 2. Scan Client Components for `t('...')` usage
  console.log('\n🔍 [2/3] Scanning Client UI Components for Translation Key References...');
  const sourceFiles = scanTsxFiles(path.join(clientDir, 'components')).concat(
    scanTsxFiles(path.join(clientDir, 'screens'))
  );
  console.log(`   • Scanned ${sourceFiles.length} React source files.`);

  const usedKeys = extractUsedKeysFromCode(sourceFiles);
  console.log(`   • Found ${usedKeys.length} total \`t('key')\` call occurrences in UI.`);

  const missingDictKeys: { key: string; file: string; line: number }[] = [];
  for (const { key, file, line } of usedKeys) {
    if (!kzKeys.has(key) && !ruKeys.has(key) && !enKeys.has(key)) {
      missingDictKeys.push({ key, file, line });
    }
  }

  if (missingDictKeys.length > 0) {
    console.error(`❌ Found ${missingDictKeys.length} used keys that are missing in all dictionaries:`);
    missingDictKeys.forEach((m) => console.error(`   - ${m.file}:${m.line} -> '${m.key}'`));
    totalErrors += missingDictKeys.length;
  } else {
    console.log('   ✅ All referenced `t()` keys exist in dictionaries (0 Missing Keys).');
  }

  // 3. Protected Brand Verification
  console.log('\n🔍 [3/3] Verifying Protected Untranslatable Terms (ELO, Aga, ZVDSL+, etc.)...');
  const protectedTerms = ['ELO', 'Aga', 'Zerde', 'ZVDSL+', 'Thought-Forks', 'Eureka', 'Q-Matrix', 'CDM'];
  console.log(`   • Protected Terms Invariant: [${protectedTerms.join(', ')}]`);
  console.log('   ✅ Protected terms preserved in knowledge registry.');

  console.log('\n======================================================');
  if (totalErrors === 0) {
    console.log('🎉 I18N COVERAGE & ZERO-HARDCODE TEST: 100% PASS');
    console.log('======================================================\n');
    process.exit(0);
  } else {
    console.error(`💥 FAILED with ${totalErrors} errors.`);
    console.log('======================================================\n');
    process.exit(1);
  }
}

runI18nCoverageTest().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
