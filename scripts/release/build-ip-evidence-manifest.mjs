import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const OUTPUT_DIR = process.env.BIZON_IP_EVIDENCE_DIR || 'artifacts/ip-evidence';
const GENERATED_AT = new Date().toISOString();

const runGit = args => {
  const result = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr || `git ${args.join(' ')} failed`);
  return String(result.stdout || '').trim();
};

const COMMIT_SHA = process.env.GITHUB_SHA || runGit(['rev-parse', 'HEAD']);
const COMMIT_DATE = runGit(['show', '-s', '--format=%cI', COMMIT_SHA]);
const REPOSITORY = process.env.GITHUB_REPOSITORY || 'thuyhuongctu/BizOn';

const thirdPartyPrefixes = [
  'assets/fonts/',
  'node_modules/',
];
const thirdPartyExact = new Set([
  'css/tw.css',
]);
const excludedPrefixes = [
  '.git/',
  'artifacts/',
  'android/.gradle/',
  'android/app/build/',
  'dist/',
  'build/',
];
const secretPatterns = [
  /(^|\/)\.env($|\.)/i,
  /secret/i,
  /credential/i,
  /private[-_]?key/i,
  /keystore/i,
  /\.jks$/i,
  /\.keystore$/i,
];

const tracked = runGit(['ls-files', '-z'])
  .split('\0')
  .map(value => value.trim())
  .filter(Boolean)
  .filter(file => !excludedPrefixes.some(prefix => file.startsWith(prefix)))
  .filter(file => !secretPatterns.some(pattern => pattern.test(file)));

function classify(file) {
  const ext = path.extname(file).toLowerCase();
  if (thirdPartyExact.has(file) || thirdPartyPrefixes.some(prefix => file.startsWith(prefix))) return 'third-party-component';
  if (/^(assets\/(icons|brand|logos)|.*logo.*)/i.test(file)) return 'brand-identity';
  if (/^assets\/(character|characters|illustrations|art|images)\//i.test(file) || ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'].includes(ext)) return 'visual-art-and-applied-design';
  if (/^(audio|music|assets\/audio|assets\/music)\//i.test(file) || ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac'].includes(ext)) return 'music-audio-or-voice';
  if (/^supabase\/migrations\//i.test(file) || ext === '.sql') return 'database-schema-and-governance-code';
  if (['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.html', '.css', '.json', '.yml', '.yaml', '.xml', '.kt', '.java', '.gradle'].includes(ext)) return 'software-source-code';
  if (/^(docs|legal|research|curriculum)\//i.test(file) || ['.md', '.txt', '.csv', '.pdf', '.docx', '.pptx'].includes(ext)) return 'documentation-and-educational-work';
  return 'other-project-material';
}

function statusFor(category) {
  if (category === 'third-party-component') return 'excluded-from-authorship-claim';
  if (category === 'other-project-material') return 'manual-review-required';
  return 'candidate-original-work-review-required';
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

const records = [];
for (const file of tracked) {
  const absolute = path.join(ROOT, file);
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) continue;
  const buffer = fs.readFileSync(absolute);
  const category = classify(file);
  records.push({
    path: file,
    bytes: buffer.length,
    sha256: sha256(buffer),
    category,
    claim_status: statusFor(category),
  });
}

records.sort((a, b) => a.category.localeCompare(b.category) || a.path.localeCompare(b.path));
const totals = records.reduce((acc, item) => {
  const entry = acc[item.category] || { files: 0, bytes: 0 };
  entry.files += 1;
  entry.bytes += item.bytes;
  acc[item.category] = entry;
  return acc;
}, {});

const manifest = {
  schema: 'bizon.ip-evidence-manifest.v1',
  repository: REPOSITORY,
  commit_sha: COMMIT_SHA,
  commit_date: COMMIT_DATE,
  generated_at: GENERATED_AT,
  purpose: 'Reproducible technical evidence inventory for copyright, trademark and chain-of-title preparation. Not a legal determination of ownership.',
  safeguards: {
    tracked_files_only: true,
    secret_like_paths_excluded: true,
    third_party_components_separated: true,
    content_hash: 'SHA-256',
  },
  totals,
  files: records,
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUTPUT_DIR, 'bizon-ip-evidence-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

const csvEscape = value => {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
const csvRows = [
  ['path', 'bytes', 'sha256', 'category', 'claim_status'],
  ...records.map(item => [item.path, item.bytes, item.sha256, item.category, item.claim_status]),
];
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'bizon-ip-evidence-manifest.csv'),
  `${csvRows.map(row => row.map(csvEscape).join(',')).join('\n')}\n`,
  'utf8',
);

const summary = [
  '# BizOn IP Evidence Snapshot',
  '',
  `- Repository: \`${REPOSITORY}\``,
  `- Commit: \`${COMMIT_SHA}\``,
  `- Commit date: ${COMMIT_DATE}`,
  `- Generated: ${GENERATED_AT}`,
  `- Tracked evidence files: ${records.length}`,
  '',
  '## Category totals',
  '',
  '| Category | Files | Bytes |',
  '|---|---:|---:|',
  ...Object.entries(totals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, value]) => `| ${category} | ${value.files} | ${value.bytes} |`),
  '',
  '## Interpretation limits',
  '',
  '- A SHA-256 value proves the content captured in this snapshot, not legal authorship by itself.',
  '- Third-party components are separated and must not be claimed as original BizOn authorship.',
  '- Human authorship, employment/commission ownership, AI-assisted creation and co-author shares require documentary review.',
  '- This artifact contains no intentionally included credentials, private keys or environment files.',
  '',
].join('\n');
fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), summary, 'utf8');

process.stdout.write(`BizOn IP evidence manifest created for ${records.length} tracked files at ${COMMIT_SHA}.\n`);
