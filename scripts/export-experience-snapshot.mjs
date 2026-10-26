import { createHash } from 'node:crypto';
import { open, mkdir } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseSnapshotImport, snapshotImportLimit } from '../src/snapshot-import.js';

// This reads one explicitly selected scope. It never opens a writer lease or runs maintain().
export async function readSnapshotFile(input) {
  const handle = await open(input, 'r');
  try {
    if ((await handle.stat()).size > snapshotImportLimit) throw new Error('Input exceeds the 5 MiB Console limit.');
    const buffer = Buffer.alloc(snapshotImportLimit + 1);
    let count = 0;
    while (count < buffer.length) {
      const { bytesRead } = await handle.read(buffer, count, buffer.length - count, null);
      if (!bytesRead) break;
      count += bytesRead;
    }
    if (count > snapshotImportLimit) throw new Error('Input exceeds the 5 MiB Console limit.');
    return buffer.subarray(0, count).toString('utf8');
  } finally { await handle.close(); }
}

export async function saveSnapshot(snapshot, { scope, output }) {
  if (typeof scope !== 'string' || !scope.trim()) throw new Error('An explicit non-empty scope is required.');
  if (typeof output !== 'string' || !output.trim()) throw new Error('An explicit output path is required.');
  const text = JSON.stringify(snapshot, null, 2) + '\n';
  const checked = parseSnapshotImport(text);
  if (checked.snapshot.scope !== scope) throw new Error('Requested scope does not match the snapshot.');
  const target = resolve(output);
  await mkdir(dirname(target), { recursive: true });
  // Never replace source files or an existing export. The caller chooses a new path.
  const handle = await open(target, 'wx', 0o600);
  try { await handle.writeFile(text, 'utf8'); await handle.sync(); }
  finally { await handle.close(); }
  return {
    output: target,
    sha256: createHash('sha256').update(text).digest('hex'),
    counts: Object.fromEntries(['episodes','skills','revisions','feedback'].map(k => [k, checked.snapshot[k].length])),
    warnings: checked.warnings,
    sourceVerification: 'not-verified-by-console',
  };
}

// Call inside an initialized, authorized host; the adapter does not create or seed a store.
export async function exportFromExperienceMemory(memory, options) {
  if (!memory || typeof memory.snapshot !== 'function') throw new Error('An initialized experience memory service is required.');
  if (typeof options?.scope !== 'string' || !options.scope.trim()) throw new Error('An explicit scope is required.');
  return saveSnapshot(await memory.snapshot(options.scope), options);
}

export async function exportFromFile({ input, store, scope, output }) {
  if (!scope?.trim()) throw new Error('An explicit scope is required.');
  if (Boolean(input) === Boolean(store)) throw new Error('Specify exactly one of --input or --store.');
  // FileExperienceStore, upstream f840e1c, uses sha256(scope).json, atomically replaced.
  // This path is NOT the DSH storage-domain layout.
  const source = input ? resolve(input) : join(resolve(store), createHash('sha256').update(scope).digest('hex') + '.json');
  const { snapshot } = parseSnapshotImport(await readSnapshotFile(source));
  return saveSnapshot(snapshot, { scope, output });
}

const help = `Export a selected ExperienceSnapshot v1 for the Memory Console (read only).

  node scripts/export-experience-snapshot.mjs --store <FileExperienceStore-dir> --scope <exact-scope> --output <new.json>
  node scripts/export-experience-snapshot.mjs --input <snapshot.json> --scope <exact-scope> --output <new.json>

The --store form supports the standalone FileExperienceStore only, not DSH storage-domain.
For DSH use exportFromExperienceMemory(ctx.experience.memory, {scope, output}) inside the authorized host.
Output is a complete scope snapshot, including raw text; review it locally before sharing.
No data is uploaded. No source is modified. No missing data is synthesized.
Keep exports outside Git or in .local/. Existing output files are never overwritten.
Console structural validation does not verify provenance or upstream semantics.
`;

export async function main(args) {
  if (args.includes('--help') || args.includes('-h')) { console.log(help); return; }
  const options = {};
  for (let i=0; i<args.length; i+=2) {
    const key = args[i].replace(/^--/, '');
    if (!args[i].startsWith('--') || !['input','store','scope','output'].includes(key) || !args[i+1] || args[i+1].startsWith('--') || key in options) throw new Error('Invalid or duplicate arguments. Use --help.');
    options[key] = args[i+1];
  }
  if (!options.output) throw new Error('Specify --output with a new local filename.');
  console.log(JSON.stringify(await exportFromFile(options), null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch(error => { console.error('Export failed:', error.message); process.exitCode = 1; });
}
