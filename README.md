# UI Refs

A curated library of well-designed real websites, EDMs, Amazon A+ modules, KVs
and product scene images, tagged by industry, site type, page type and style —
for AI agents (and people) to look at before deciding a new site's look.

由 [Creght](https://creght.cn) 团队采集、AI 打标、人工审核的 UI 参考库。这里是发布出口：
数据每天从审核平台自动导出，请不要直接改 `data/`。

## Use it

With the [Creght CLI](https://github.com/creght-dev/creght-cli) (no login needed):

```bash
npx creght-cli refs vocab
npx creght-cli refs search --industry="家居 / 家具 / 生活方式" --site_type=商城 --save=./refs
```

`--save` downloads the matching images (1200px wide) so agents that read local
files can open them. Results are shuffled and spread across styles.

Or read the files directly — clone the repo, or fetch single files:

- `data/refs.json` — every reviewed reference, one per line
- `data/vocab.json` — the tag vocabulary (`industry`, `siteType`, `pageType`, `style`, `features`)
- `images/<id>.jpg` — the image, 1200px wide

```json
{"id":"p96ncw0i93rm","image":"images/p96ncw0i93rm.jpg","width":1200,"height":750,
 "kind":"screenshot","source":"gubi.com","pageUrl":"https://gubi.com",
 "industry":["家居 / 家具 / 生活方式"],"siteType":"商城","pageType":"KV 主视觉",
 "style":["奢华","摄影主导"],"features":["大图首屏"],"colors":["#8a1020","#c8a878"],
 "summary":"整屏酒红丝绒沙发特写……"}
```

`refs.json` is about 200 KB — filter it instead of reading it whole, and pick
from several styles rather than the first matches:

```bash
curl -s https://raw.githubusercontent.com/creght-dev/ui-refs/main/data/refs.json \
  | jq -c '.[] | select(.industry | index("家居 / 家具 / 生活方式")) | select(.siteType == "商城")
               | {image, source, pageType, style, summary}'
# image: https://raw.githubusercontent.com/creght-dev/ui-refs/main/<image>
```

## License

- Code (`scripts/`, workflows): MIT.
- Tags and summaries in `data/`: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- **Images are not covered by either license.** Each one is a screenshot or
  copy of someone else's work — copyright stays with its owner, named in
  `source` / `pageUrl`. They are collected as design references only: borrow
  the direction, never copy their text, logos or photos.

Own one of these works and want it removed? Open an issue with its `id` or
URL and we will take it down.
