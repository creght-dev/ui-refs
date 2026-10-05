// Export reviewed references from the UI reference library (a public Creght
// site) into data/refs.json, data/vocab.json and images/*.jpg.
// No token needed: refs.list and refs.vocab are public read endpoints.
// Node 18+, no dependencies.
import { mkdir, readdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'

const BASE = (process.env.UI_REFS_URL || 'https://p92jhkfr126a.site.creght.cn').replace(/\/$/, '')
const PAGE_SIZE = 200
const IMAGE_WIDTH = 1200
// Third-party design work (portfolio pieces, not public web pages) stays out of
// the public repo; the library keeps them for internal use.
const EXCLUDE_SOURCES = ['behance.net']
const FIELDS = ['kind', 'platform', 'source', 'pageUrl', 'pageTitle',
  'industry', 'siteType', 'pageType', 'style', 'features', 'colors', 'summary', 'updatedAt']

const PAGE_TYPE_SLUGS = {
  '首页': 'home', '落地页': 'landing', '产品详情': 'product', '列表页': 'list', '定价页': 'pricing',
  '关于我们': 'about', '联系我们': 'contact', '博客文章': 'blog-post', '博客列表': 'blog', '作品集': 'portfolio',
  '案例详情': 'case-study', '登录注册': 'auth', '仪表盘': 'dashboard', '设置页': 'settings',
  '结账购物车': 'checkout', '空状态': 'empty-state', '404': '404', '组件细节': 'component',
  'A+ 详情模块': 'a-plus', 'EDM 邮件': 'edm', 'KV 主视觉': 'kv', '产品场景图': 'scene', 'Campaign 活动页': 'campaign',
}

// Readable, stable file name: <source>-<page type>-<id tail>.jpg, e.g. gubi-com-kv-0i93rm.jpg.
// The id tail keeps names unique (16 EDMs share source and page type).
function imagePath(r) {
  const source = (r.source || 'site').replace(/^www\./, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const type = PAGE_TYPE_SLUGS[r.pageType] || 'page'
  return `images/${source}-${type}-${r.id.slice(-6)}.jpg`
}

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

// The previous export tells which images changed (hash) and where they were (image).
const previous = {}
try {
  for (const r of JSON.parse(await readFile('data/refs.json', 'utf8'))) previous[r.id] = r
} catch {}

await mkdir('images', { recursive: true })
const have = new Set((await readdir('images')).filter((f) => f.endsWith('.jpg')).map((f) => `images/${f}`))
// Same image under a new name (source or page type retagged): rename instead of downloading again.
for (const r of refs) {
  const before = previous[r.id]
  const path = imagePath(r)
  if (before && before.hash === r.hash && before.image !== path && have.has(before.image) && !have.has(path)) {
    await rename(before.image, path)
    have.delete(before.image)
    have.add(path)
  }
}
const queue = refs.filter((r) => !have.has(imagePath(r)) || previous[r.id]?.hash !== r.hash)
const toDownload = queue.length
await Promise.all(Array.from({ length: 6 }, async () => {
  for (let r; (r = queue.shift()); ) {
    const res = await fetch(`${r.url}${r.url.includes('?') ? '&' : '?'}w=${IMAGE_WIDTH}&fmt=jpg`)
    if (!res.ok) throw new Error(`${r.id}: image ${res.status}`)
    await writeFile(imagePath(r), Buffer.from(await res.arrayBuffer()))
  }
}))

const keep = new Set(refs.map(imagePath))
let removed = 0
for (const f of have) {
  if (!keep.has(f)) {
    await unlink(f)
    removed++
  }
}

const out = refs.map((r) => {
  const scale = r.width > IMAGE_WIDTH ? IMAGE_WIDTH / r.width : 1
  return {
    id: r.id,
    image: imagePath(r),
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
