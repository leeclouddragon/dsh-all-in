#!/usr/bin/env node
import { build } from 'esbuild'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'lib')
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))

await rm(out, { recursive: true, force: true })
await mkdir(out, { recursive: true })

await build({
  entryPoints: [join(root, 'src/host/index.ts')],
  outfile: join(out, 'index.js'),
  format: 'esm',
  platform: 'node',
  target: 'es2022',
  bundle: true,
  external: ['@deepseek-ai/cordis'],
})

await build({
  entryPoints: [join(root, 'src/client/engine.ts')],
  outfile: join(out, 'engine.js'),
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  bundle: true,
})

const temporaryClient = join(out, '_client.js')
await build({
  entryPoints: [join(root, 'src/client/index.cts')],
  outfile: temporaryClient,
  format: 'cjs',
  platform: 'browser',
  target: 'es2020',
  bundle: true,
  external: ['react'],
  jsx: 'transform',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
})

const source = await readFile(temporaryClient, 'utf8')
await rm(temporaryClient)
const clientBundle = [
  '/* dsh-all-in client bundle — generated from src/client */',
  'window.__ModuleLoader__.load({',
  `  id: ${JSON.stringify(pkg.name)},`,
  '  factory: (require) => {',
  '    var module = { exports: {} };',
  '    var exports = module.exports;',
  source.replace(/\s+$/, ''),
  '    return module.exports;',
  '  },',
  '});',
  '',
].join('\n')
await writeFile(join(out, 'client.js'), clientBundle)

new Function(clientBundle)
const host = await import(pathToFileURL(join(out, 'index.js')).href)
if (host.name !== pkg.name || typeof host.apply !== 'function') throw new Error('invalid host plugin export')

console.log(`Built ${pkg.name}: host, client, and engine artifacts are ready.`)
