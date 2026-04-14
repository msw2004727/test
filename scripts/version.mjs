/**
 * 版號管理腳本
 *
 * 用法：
 *   node scripts/version.mjs patch   → 1.0.0 → 1.0.1
 *   node scripts/version.mjs minor   → 1.0.0 → 1.1.0
 *   node scripts/version.mjs major   → 1.0.0 → 2.0.0
 *   node scripts/version.mjs         → 不遞增，僅更新 buildDate + buildHash
 */
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const FILE = 'version.json';
const data = JSON.parse(readFileSync(FILE, 'utf-8'));
const [major, minor, patch] = data.version.split('.').map(Number);
const type = process.argv[2];

if (type === 'major') data.version = `${major + 1}.0.0`;
else if (type === 'minor') data.version = `${major}.${minor + 1}.0`;
else if (type === 'patch') data.version = `${major}.${minor}.${patch + 1}`;

data.buildDate = new Date().toISOString();

// 嘗試從 git 取得 short hash，失敗時用隨機值
try {
  data.buildHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
} catch {
  data.buildHash = Math.random().toString(36).slice(2, 9);
}

// 格式驗證（防止注入攻擊）
if (!/^\d+\.\d+\.\d+$/.test(data.version)) {
  console.error(`Invalid version format: ${data.version}`); process.exit(1);
}
if (!/^[a-z0-9]{4,12}$/.test(data.buildHash)) {
  console.error(`Invalid hash format: ${data.buildHash}`); process.exit(1);
}

writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n');

console.log(`v${data.version}  hash:${data.buildHash}  date:${data.buildDate}`);
