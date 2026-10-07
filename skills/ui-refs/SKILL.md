---
name: ui-refs
description: Real-website design references to borrow from before deciding a look. Use when designing or restyling a website, landing page or KV (key visual), or when choosing a visual direction for one.
---

# UI Refs

A curated library of real designs, tagged by industry, site type, page type and style:
<https://github.com/creght-dev/ui-refs>. Full pages are cut into sections at block boundaries,
and each section lists the blocks it shows.

Every path below is relative to `https://raw.githubusercontent.com/creght-dev/ui-refs/main/`
(`<base>`). In a local clone, read the files directly.

## Steps

1. **Map the brief to the vocabulary.** Fetch `<base>data/vocab.json` and pick one `industry`,
   one `siteType` and one `pageType`. Tags are Chinese; use the exact strings from the vocabulary.
   Done when you hold three exact vocabulary strings.

2. **Shortlist by tags and summaries.** `data/refs.json` is about 300 KB — filter it, read only what you need:

   ```bash
   curl -s <base>data/refs.json | jq -c '.[]
     | select(.industry | index("<industry>"))
     | select(.siteType == "<siteType>")
     | {id, source, pageType, style, sections, summary}'
   ```

   Under 5 hits: drop `siteType`, then try a neighbouring `industry`. Over 20: add `pageType`.
   Done when you have 5–20 candidates.

3. **Pick 2–3 that differ in `style`.** Spread across styles, and choose by how well the
   `summary` and `sections` fit the brief rather than by list order. Done when each pick has
   a one-line reason.

4. **Look at the images.** Download each image and view it.
   - `image` is the first section, 1200px wide.
   - To see further down a page, open the `parts` entries whose `sections` hold the blocks you
     need — pricing, footer, product grid — and leave the rest.

5. **Take the direction.** Write down what you are borrowing from each pick — layout, rhythm,
   type scale, colours (`colors`), how blocks are composed — then design. Write your own text
   and use your own images and marks: the screenshots are other people's work, kept as
   references only.

## Fields

`id`, `image`, `width`, `height`, `kind` (`screenshot` | `image`), `platform`, `source`, `pageUrl`, `pageTitle`,
`industry[]`, `siteType`, `pageType`, `style[]`, `features[]`, `colors[]`, `summary`,
`sections[]` (page skeleton, top to bottom), `parts[]` (`{image, width, height, sections}`;
`parts[0]` is `image`). Single images such as KVs have no `sections` or `parts`.
