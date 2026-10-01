// Export reviewed references from the UI reference library (a public Creght
// site) into data/refs.json and data/vocab.json. No token needed: refs.list and
// refs.vocab are public read endpoints. Node 18+, no dependencies.
import { writeFile } from 'node:fs/promises'

const BASE = (process.env.UI_REFS_URL || 'https://p92jhkfr126a.site.creght.cn').replace(/\/$/, '')
const PAGE_SIZE = 200
const FIELDS = ['id', 'url', 'width', 'height', 'kind', 'platform', 'source', 'pageUrl', 'pageTitle',
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

const refs = []
for (let page = 1; ; page++) {
  const { list, total } = await call('list', { status: 'reviewed', size: PAGE_SIZE, page })
  refs.push(...list)
  if (list.length < PAGE_SIZE || refs.length >= total) break
}
refs.sort((a, b) => a.id.localeCompare(b.id))

const pick = (r) => Object.fromEntries(FIELDS.filter((k) => r[k] !== undefined && r[k] !== '').map((k) => [k, r[k]]))
// One reference per line keeps diffs readable.
await writeFile('data/refs.json', '[\n' + refs.map((r) => JSON.stringify(pick(r))).join(',\n') + '\n]\n')

const { industry, siteType, pageType, style, features } = await call('vocab', {})
await writeFile('data/vocab.json', JSON.stringify({ industry, siteType, pageType, style, features }, null, 2) + '\n')

console.log(`exported ${refs.length} references`)
