#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ASSET_ROOTS = ['assets'];
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg']);
const EXCLUDED_PATTERNS = [/food[-_ ]?truck/i, /generated/i, /imagegen/i];
const OUTPUT = path.join(ROOT, 'docs/design/existing-assets.manifest.json');

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(absolute));
    } else if (entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(absolute);
    }
  }

  return files;
}

function classify(relativePath) {
  const lower = relativePath.toLowerCase();
  if (lower.includes('lumina')) return 'lumina';
  if (lower.includes('anh-tu') || lower.includes('phan-anh-tu') || lower.includes('tu-phan')) return 'tu-phan';
  if (lower.includes('character') || lower.includes('cast') || lower.includes('nhan-vat')) return 'character-library';
  if (lower.includes('vietnam') || lower.includes('viet-nam') || lower.includes('mekong')) return 'vietnam-map';
  if (lower.includes('music') || lower.includes('am-nhac') || lower.includes('giai-dieu')) return 'music';
  if (lower.includes('brand') || lower.includes('passport') || lower.includes('ho-chieu')) return 'brand-passport';
  if (lower.includes('aibis') || lower.includes('global') || lower.includes('market')) return 'aibis';
  if (lower.includes('game') || lower.includes('arena') || lower.includes('round')) return 'game';
  if (lower.includes('icon') || lower.includes('logo') || lower.includes('brand')) return 'brand';
  return 'illustration';
}

function statusFor(relativePath) {
  if (EXCLUDED_PATTERNS.some((pattern) => pattern.test(relativePath))) return 'exclude';
  return 'preserve';
}

async function dimensionsFor(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension !== '.svg') return null;

  const content = await fs.readFile(filePath, 'utf8');
  const viewBox = content.match(/viewBox=["']([^"']+)["']/i)?.[1] ?? null;
  const width = content.match(/\bwidth=["']([^"']+)["']/i)?.[1] ?? null;
  const height = content.match(/\bheight=["']([^"']+)["']/i)?.[1] ?? null;
  return { width, height, viewBox };
}

const files = [];
for (const root of ASSET_ROOTS) {
  const absoluteRoot = path.join(ROOT, root);
  try {
    files.push(...await walk(absoluteRoot));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

const records = [];
for (const absolutePath of files.sort()) {
  const buffer = await fs.readFile(absolutePath);
  const relativePath = path.relative(ROOT, absolutePath).split(path.sep).join('/');
  const stats = await fs.stat(absolutePath);

  records.push({
    path: relativePath,
    filename: path.basename(relativePath),
    extension: path.extname(relativePath).toLowerCase(),
    bytes: stats.size,
    sha256: createHash('sha256').update(buffer).digest('hex'),
    classification: classify(relativePath),
    status: statusFor(relativePath),
    source: 'existing-repository-asset',
    dimensions: await dimensionsFor(absolutePath),
    vi_alt: '',
    en_alt: '',
    approved_pages: []
  });
}

const hashGroups = new Map();
for (const record of records) {
  const group = hashGroups.get(record.sha256) ?? [];
  group.push(record.path);
  hashGroups.set(record.sha256, group);
}

const duplicates = [...hashGroups.entries()]
  .filter(([, paths]) => paths.length > 1)
  .map(([sha256, paths]) => ({ sha256, paths }));

const manifest = {
  schema: 'bizon-existing-assets-manifest-v1',
  generated_at: new Date().toISOString(),
  source_policy: 'Existing BizOn assets only; originals preserved.',
  totals: {
    images: records.length,
    preserved: records.filter((record) => record.status === 'preserve').length,
    excluded: records.filter((record) => record.status === 'exclude').length,
    duplicate_groups: duplicates.length
  },
  exclusions: ['Food Truck artifacts', 'newly generated replacement characters', 'unverified third-party social images'],
  duplicate_groups: duplicates,
  assets: records
};

await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
await fs.writeFile(OUTPUT, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Wrote ${path.relative(ROOT, OUTPUT)} with ${records.length} image assets.`);
