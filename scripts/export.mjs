// Export reviewed references from the UI reference library (a public Creght
// site) into data/refs.json, data/vocab.json and images/<id>.jpg.
// No token needed: refs.list and refs.vocab are public read endpoints.
// Node 18+, no dependencies.
import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises'

const BASE = (process.env.UI_REFS_URL || 'https://p92jhkfr126a.site.creght.cn').replace(/\/$/, '')
const PAGE_SIZE = 200
const IMAGE_WIDTH = 1200
// Third-party design work (portfolio pieces, not public web pages) stays out of
// the public repo; the library keeps them for internal use.
const EXCLUDE_SOURCES = ['behance.net']
const FIELDS = ['kind', 'platform', 'source', 'pageUrl', 'pageTitle',
  'industry', 'siteType', 'pageType', 'style', 'features', 'colors', 'summary', 'updatedAt']

async function call(method, input) {
  const res = await fetch(`${BASE}/func/refs.${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = await res.json()
  if (body.error || !body.result) throw new Error(`refs.${method}: ${res.status} ${body.error ?? ''}`)
  return body.result
}

const all = []
for (let page = 1; ; page++) {
  const { list, total } = await call('list', { status: 'reviewed', size: PAGE_SIZE, page })
  all.push(...list)
  if (list.length < PAGE_SIZE || all.length >= total) break
}
const refs = all.filter((r) => !EXCLUDE_SOURCES.includes(r.source)).sort((a, b) => a.id.localeCompare(b.id))

// The image hash recorded by the previous export tells which images changed.
const previous = {}
try {
  for (const r of JSON.parse(await readFile('data/refs.json', 'utf8'))) previous[r.id] = r.hash
} catch {}

await mkdir('images', { recursive: true })
const have = new Set((await readdir('images')).filter((f) => f.endsWith('.jpg')))
const queue = refs.filter((r) => !have.has(`${r.id}.jpg`) || previous[r.id] !== r.hash)
const toDownload = queue.length
await Promise.all(Array.from({ length: 6 }, async () => {
  for (let r; (r = queue.shift()); ) {
    const res = await fetch(`${r.url}${r.url.includes('?') ? '&' : '?'}w=${IMAGE_WIDTH}&fmt=jpg`)
    if (!res.ok) throw new Error(`${r.id}: image ${res.status}`)
    await writeFile(`images/${r.id}.jpg`, Buffer.from(await res.arrayBuffer()))
  }
}))

const keep = new Set(refs.map((r) => `${r.id}.jpg`))
let removed = 0
for (const f of have) {
  if (!keep.has(f)) {
    await unlink(`images/${f}`)
    removed++
  }
}

const out = refs.map((r) => {
  const scale = r.width > IMAGE_WIDTH ? IMAGE_WIDTH / r.width : 1
  return {
    id: r.id,
    image: `images/${r.id}.jpg`,
    width: Math.round(r.width * scale),
    height: Math.round(r.height * scale),
    ...Object.fromEntries(FIELDS.filter((k) => r[k] !== undefined && r[k] !== '').map((k) => [k, r[k]])),
    hash: r.hash,
  }
})
// One reference per line keeps diffs readable.
await writeFile('data/refs.json', '[\n' + out.map((r) => JSON.stringify(r)).join(',\n') + '\n]\n')

const { industry, siteType, pageType, style, features } = await call('vocab', {})
await writeFile('data/vocab.json', JSON.stringify({ industry, siteType, pageType, style, features }, null, 2) + '\n')

console.log(`exported ${out.length} references, downloaded ${toDownload} images, removed ${removed}`)
