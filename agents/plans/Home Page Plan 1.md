# Search Landing Improvements

## Summary
- Create branch `search-landing-improvements` from current `habsa`.
- Rework the home page into the main search landing surface: search input, `بحث`, active filter chips, and filters visible by default.
- Remove the home radio buttons, filter icon, and the feature-card buttons under the search input.
- Keep results page filters available but collapsed by default, and make filter changes search only when `بحث` is pressed.

## Key Changes
- Introduce a shared filter UI/state path for `HomePage` and `SearchPage` so the same filters, saved-filter controls, tag chips, and qaree selector are reused instead of duplicated.
- Move the sura dropdown into the filter area as the first filter. Add one exact Aya numeric input next to it, disabled until a sura is selected. Skip page filtering for now.
- Add `الكلمات الفرشية فقط` / temporary English label `Farsh words only`; unchecked by default; when checked it adds the verified `farsh` tag to included tags.
- Add `جميع القراء` checked by default. When unchecked, show the existing qaree chip UI. Rechecking clears selected qarees.
- Keep `الوسوم`, `استثناء ما وافق حفصاً`, and `كلمة كاملة`, but group the checkboxes into a cleaner row.
- Show active selected filters directly under the search input as removable chips for sura, aya, farsh, whole word, Hafs exclusion, qarees, include tags, and exclude tags.

## Interfaces / Behavior
- Use URL params as the applied search contract: `q`, hidden/default `type=text`, `sora`, `aya`, `includeTags`, `excludeTags`, `qarees`, `wholeWord=1`, `excludeHafsa=1`.
- Add exact `aya?: number` support to `SearchOptions` / saved filters while leaving old range fields untouched only for compatibility.
- `HomePage` submits to `/search` with the selected filters.
- `SearchPage` parses URL params as applied search state, keeps a separate editable draft state, and fetches results only after submit updates the URL.
- Saved filters shown on home and search load into draft filter controls; sidebar saved-filter apply remains an explicit navigation/search action.

## Test Plan
- Run `npm run lint`.
- Start the Vite dev server and inspect `/` and `/search` in the in-app browser.
- Verify: home filters render by default, removed controls are gone, selected filters appear under the input, `farsh` adds/removes the tag, qaree selector only appears when `جميع القراء` is unchecked, filter clicks do not refresh results, and `بحث` applies them.
- Check RTL layout on desktop and narrow mobile width, especially the search row, filter chips, saved filters, and qaree chips.

## Assumptions
- Search mode selection is intentionally removed from visible UI; new home searches default to text search.
- If `جميع القراء` is unchecked but no qaree is selected, no qaree restriction is applied until the user selects at least one.
- Page filters are intentionally omitted in this pass to avoid the mushaf column ambiguity.
