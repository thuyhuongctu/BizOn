import fs from 'node:fs';

const TEMPLATE = 'config/supabase-staging.env.example';
const PRODUCTION_PROJECT_REF = 'ceytblfelodpnudomccn';
const REQUIRED_KEYS = [
  'SUPABASE_STAGING_PROJECT_REF',
  'SUPABASE_STAGING_URL',
  'SUPABASE_STAGING_DATABASE_URL',
  'SUPABASE_STAGING_ANON_KEY',
  'SUPABASE_STAGING_INSTRUCTOR_KEY',
  'CONFIRM_PROJECT_REF',
  'APPLY_MIGRATION',
  'RUN_RETENTION_PURGE'
];

const content = fs.readFileSync(TEMPLATE, 'utf8');
const values = new Map();

for (const line of content.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const index = trimmed.indexOf('=');
  if (index < 1) throw new Error(`Invalid template line: ${trimmed}`);
  values.set(trimmed.slice(0, index), trimmed.slice(index + 1));
}

for (const key of REQUIRED_KEYS) {
  if (!values.has(key)) throw new Error(`Missing staging template key: ${key}`);
}

if (content.includes(PRODUCTION_PROJECT_REF)) {
  throw new Error('Staging template must not contain the production project ref.');
}

const projectRef = values.get('SUPABASE_STAGING_PROJECT_REF');
const confirmedRef = values.get('CONFIRM_PROJECT_REF');
const stagingUrl = values.get('SUPABASE_STAGING_URL');

if (projectRef !== 'replace-with-staging-project-ref') {
  throw new Error('Committed template must keep the non-secret project-ref placeholder.');
}
if (confirmedRef !== projectRef) {
  throw new Error('Template confirmation ref must match its project-ref placeholder.');
}
if (stagingUrl !== `https://${projectRef}.supabase.co`) {
  throw new Error('Template staging URL must be derived from the project-ref placeholder.');
}
if (!/REPLACE_/i.test(values.get('SUPABASE_STAGING_DATABASE_URL'))) {
  throw new Error('Database URL template must contain explicit replacement markers.');
}
if (!/^REPLACE_WITH_/.test(values.get('SUPABASE_STAGING_ANON_KEY'))) {
  throw new Error('Anon key template must remain a replacement marker.');
}
if (!/^REPLACE_WITH_/.test(values.get('SUPABASE_STAGING_INSTRUCTOR_KEY'))) {
  throw new Error('Instructor key template must remain a replacement marker.');
}
if (values.get('APPLY_MIGRATION') !== 'false') {
  throw new Error('Template must default APPLY_MIGRATION to false.');
}
if (values.get('RUN_RETENTION_PURGE') !== 'true') {
  throw new Error('Template must default RUN_RETENTION_PURGE to true.');
}

console.log('Supabase staging environment template passed.');
