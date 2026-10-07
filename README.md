# UI Refs

A curated library of well-designed real websites and KVs,
tagged by industry, site type, page type and style — for AI agents (and people)
to look at before deciding a new site's look. Full-page screenshots are cut into
sections at their block boundaries, and every section is named, so you can see
how a page is put together, not just its first screen.

**Browse it: <https://creght-dev.github.io/ui-refs/>**

由 [Creght](https://creght.cn) 团队采集、AI 打标、人工审核的 UI 参考库。这里是发布出口：
数据由审核平台导出，请不要直接改 `data/` 和 `images/`。

## Use it

Clone the repo, or fetch single files:

- `data/refs.json` — every reviewed reference, one per line
- `data/vocab.json` — the tag vocabulary (`industry`, `siteType`, `pageType`, `style`, `features`, `sections`)
- `images/<source>-<page type>-<id tail>.jpg` — the first section (or the whole image), 1200px wide;
  further sections of the same page are `…-2.jpg`, `…-3.jpg` (paths in each entry's `parts`)
- `thumbs/` — 480px thumbnails of the first section, for the gallery

`sections` is the page skeleton, top to bottom; `parts` lists every section image with the
blocks it shows (`parts[0]` is `image`). Single images such as KVs have neither.

```json
{"id":"p96ncw0i93rm","image":"images/gubi-com-kv-0i93rm.jpg","width":1200,"height":750,
 "kind":"screenshot","source":"gubi.com","pageUrl":"https://gubi.com",
 "industry":["家居 / 家具 / 生活方式"],"siteType":"商城","pageType":"KV 主视觉",
 "style":["奢华","摄影主导"],"features":["大图首屏"],"colors":["#8a1020","#c8a878"],
 "summary":"整屏酒红丝绒沙发特写……"}

{"id":"p92n130kmavm","image":"images/stripe-com-home-0kmavm.jpg", …,
 "sections":["首屏","客户 Logo 墙","Bento 卡片","CTA", …,"页脚"],
 "parts":[{"image":"images/stripe-com-home-0kmavm.jpg","width":1200,"height":2008,"sections":["首屏","客户 Logo 墙","Bento 卡片"]},
          {"image":"images/stripe-com-home-0kmavm-2.jpg","width":1200,"height":1690,"sections":["Bento 卡片","CTA","数据指标"]}, …]}
```

`refs.json` is about 300 KB — filter it instead of reading it whole, and pick
from several styles rather than the first matches:

```bash
curl -s https://raw.githubusercontent.com/creght-dev/ui-refs/main/data/refs.json \
  | jq -c '.[] | select(.industry | index("家居 / 家具 / 生活方式")) | select(.siteType == "商城")
               | {image, source, pageType, style, summary}'
# image: https://raw.githubusercontent.com/creght-dev/ui-refs/main/<image>
```

## For agents

[`skills/ui-refs/SKILL.md`](skills/ui-refs/SKILL.md) teaches an agent to use this library:
map the brief to the vocabulary, shortlist by tags and summaries, pick 2–3 in different styles,
look at the right sections, and borrow the direction.

Install it with [`skills`](https://github.com/vercel-labs/skills) — it fetches this one file,
not the whole repository, and asks which agents (Claude Code, Cursor, Codex …) to install to:

```bash
npx skills add https://raw.githubusercontent.com/creght-dev/ui-refs/main/skills/ui-refs/SKILL.md
```

Or ask your agent to run it for you (add `-g -y` to install globally without prompts).

For other agents, paste the body of `SKILL.md` into their instructions (system prompt, `AGENTS.md`).

## License

- Tags and summaries in `data/`: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- **Images are not covered by this license.** Each one is a screenshot or
  copy of someone else's work — copyright stays with its owner, named in
  `source` / `pageUrl`. They are collected as design references only: borrow
  the direction, never copy their text, logos or photos.

Own one of these works and want it removed? Open an issue with its `id` or
URL and we will take it down.
