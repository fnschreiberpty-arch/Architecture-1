# SITE MODEL — Frank Schreiber, Selected Works

A virtual architecture portfolio where **every project is its own world**.
The homepage is a 3D "crit review table": each project sits on it as a massing
model, and you cross a project's threshold to step into a self-contained world
built around the way that project is best communicated (a *representation mode*).

- **Live site:** https://fnschreiberpty-arch.github.io/Architecture-1/
- **No build step.** Plain HTML/CSS/JS — GitHub Pages serves these files directly.
- **Everything degrades:** with JavaScript or WebGL off, the hub becomes a flat,
  crawlable site-plan and each project a plain captioned document.

---

## Add a project in 3 steps

1. **Copy** `projects/_template-project/` and rename the copy to your project's
   *slug* (lowercase, dashes), e.g. `projects/georgetown-chapel/`.
2. **Edit** that folder's `manifest.json` — set `slug` (must match the folder
   name), `title`, `template`, theme colors, text, and point the media at your
   files. You do **not** edit `index.html`.
3. **Register** it: add one entry to `data/projects.json` so a model appears on
   the table and it shows up in the Index + `/` command palette.

That's it — no other files change.

## Representation modes (the `template` field)

Each project picks the mode that fits how it's best shown. Built so far:

| `template` | The world | Best for |
|---|---|---|
| `model`   | Dark gallery around one orbitable 3D model | object/form-driven projects |
| `section` | Scroll **down** through the building, floor by floor | vertically-organized projects |

*(More modes — `plan`, `axon`, `diagram`, `process` — can be added later as new
files in `assets/js/templates/`.)*

## Three customization tiers

- **Tier 1 — no code:** fill in `manifest.json`, pick a `template`. Done.
- **Tier 2 — theme:** tweak `accent` / `paper` / `ink` / `muted` colors + `motionProfile`.
- **Tier 3 — bespoke:** drop a `custom.js` in the project folder and set
  `"hasCustomJs": true`. Export an `enhance(root, manifest, ctx)` function. It is
  **sandboxed** — if it throws, the project safely falls back to its template.

---

## Adding your real files (replacing the placeholders)

Put real assets in each project's `media/` folder and point `manifest.json` at them.

- **3D models (SketchUp):** export to **glTF Binary (`.glb`)**. In SketchUp use
  *File → Export → 3D Model → glTF* (or the free *glTF Export* extension). Keep
  models light (decimate / hide interiors). Set `"model": { "src": "media/your.glb" }`.
  The same `.glb` can also be used on the hub table — see `silhouette.glb` (todo).
- **Drawings (AutoCAD):** plot your layouts to a single **PDF** and drop it in
  `media/`. Set `"pdf": { "src": "media/drawings.pdf", "label": "Drawing set" }`.
  It becomes an inline, downloadable plan-room.
- **Images / renders:** export **JPG/PNG/WebP** (long edge ~2000px is plenty).
  Add to the `plates` array with a caption, or use as `floors[].img`.

## Running it locally

Because the site loads modules and JSON via `fetch`, double-clicking
`index.html` (a `file://` URL) won't work — you need a tiny local web server:

- **Easiest:** in VS Code, install the **Live Preview** (or *Live Server*)
  extension and click "Go Live".
- **If you have Python:** run `python -m http.server` in this folder, then open
  `http://localhost:8000/`.
- **Or just push to GitHub** and view the live URL above.

## Optional upgrade (later)

If you ever install Node, a small `build/generate.mjs` can pre-render per-page
`<meta>`/Open Graph tags and generate optimized WebP/AVIF images. Not required.

---

*Built with Three.js (hub only), `<model-viewer>` (project 3D), GSAP, and PDF in
the browser. Design direction: **SITE MODEL**.*
