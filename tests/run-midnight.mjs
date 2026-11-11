import { build } from 'esbuild';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
const temporary = await mkdtemp(path.join(tmpdir(), 'ewig-midnight-tests-'));
try {
  const outfile = path.join(temporary, 'midnight.test.cjs');
  await build({ entryPoints: ['tests/midnight.test.tsx'], bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic', define: { 'import.meta.url': JSON.stringify(pathToFileURL(path.resolve('src/components/EternalRibbon/EternalRibbonIntro.tsx')).href) }, outfile, loader: { '.css': 'empty', '.webp': 'file', '.png': 'file' }, plugins: [{ name: 'source-assets', setup(build) {
    build.onResolve({ filter: /\.md\?raw$/ }, args => ({ path: path.resolve(args.resolveDir, args.path.slice(0,-4)), namespace: 'raw' }));
    build.onLoad({ filter: /.*/, namespace: 'raw' }, async args => ({ contents: `export default ${JSON.stringify(await readFile(args.path, 'utf8'))}`, loader: 'js' }));
  }}], logLevel: 'warning' });
  const result = spawnSync(process.execPath, ['--test', outfile], { stdio: 'inherit' });
  process.exitCode = result.status ?? 1;
} finally { if (!path.resolve(temporary).startsWith(path.resolve(tmpdir()) + path.sep)) throw new Error('Unexpected test directory'); await rm(temporary, { recursive: true, force: true }); }
