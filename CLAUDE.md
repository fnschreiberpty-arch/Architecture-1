# CLAUDE.md — working guide for this repository

Project context and conventions for Claude Code (and any AI/dev) working in this repo.
For current status and next steps, see **HANDOFF.md**. For author-facing instructions, see **README.md**.

## What this is

**SITE MODEL** — a virtual architecture portfolio for **Frank Schreiber** where *every project
is its own world*. The homepage is a 3D "crit review table" (Three.js); each project sits on it
as a massing model and you "step into" a self-contained world built around a **representation
mode** (how that project is best communicated).

- **Live:** https://fnschreiberpty-arch.github.io/Architecture-1/
- **Repo:** https://github.com/fnschreiberpty-arch/Architecture-1 (GitHub Pages, `main` branch, root)

## Hard constraints (do not break these)

- **No build step.** Plain HTML/CSS/ES-module JS served as static files. The author has **no
  Node/npm**, so do NOT introduce a build toolchain without explicit agreement. Libraries load
  from CDN (Three.js, `<model-viewer>`, GSAP). Three.js is used **only** in the hub (`hub.js`).
- **Progressive enhancement.** The site must work with JS/WebGL off: the hub falls back to the
  flat site-plan in `index.html`; project pages have a `<noscript>` block. Honor
  `prefers-reduced-motion` everywhere (handled in `kernel.js`).
- **Relative paths only** (the site is served from the `/Architecture-1/` subpath, not domain
  root). Project pages live two levels deep, so they reference shared assets via `../../`.
- **GitHub's 100 MB per-file limit.** Never commit raw design sources. `.gitignore` excludes
  `*.dae/*.skp/*.obj/*.mtl/*.fbx/*.dwg` and `*.pdf` (except `*-web.pdf`). Commit only web
  derivatives: `.glb`, `.jpg`/`.png`, and `*-web.pdf`.

## Structure

```
index.html                     hub: flat site-plan (no-JS) + 3D table layered over it
404.html                       branded not-found
data/projects.json             SINGLE SOURCE OF TRUTH for the hub/index/palette
assets/css/base.css            entire design system (tokens + hub + worlds + components)
assets/js/
  kernel.js                    reducedMotion, loadProjects, initReveals, initCommandPalette, initTopbar
  hub.js                       Three.js crit table (raw Three.js ONLY here)
  project.js                   per-project page entry: theme + dispatch + chrome + sandboxed override
  templates/   parts.js        intro(), footer(), fullPlate()  (shared world parts)
  templates/   model.js        "model" world (orbitable 3D gallery)
  templates/   section.js      "section" world (scroll down through floors)
  components/  modelblock.js   <model-viewer> block (graceful "drop .glb here" empty state)
  components/  lighttable.js   image grid + lightbox + loupe; exports openLightbox()
  components/  planroom.js     inline PDF viewer + download button (empty state if no pdf)
  placeholders/*.svg           architectural placeholder drawings
projects/<slug>/index.html     tiny shell (identical except <title>/<meta>) — loads project.js
projects/<slug>/manifest.json  the project's content + theme (this is what you edit)
projects/<slug>/media/         per-project assets (.glb, .jpg, *-web.pdf); raw sources gitignored
projects/_template-project/    copy this to add a project
```

## How to add or edit a project

1. Copy `projects/_template-project/` → `projects/<slug>/` (slug = lowercase-dashes, matches folder).
2. Edit `projects/<slug>/manifest.json` (NOT index.html).
3. Add an entry to `data/projects.json` so it appears on the hub table + Index + `/` palette.

### manifest.json fields

`slug, title, plateNo, template, motionProfile, subtitle, year, program, location, studio,
accent, paper, ink, muted, statement`, plus content:
- `model`: `{ src, poster, alt }` — `src:""` shows the drop-in placeholder.
- `boards`: `[{ src, caption }]` — full-bleed, click-to-zoom plates (presentation boards).
- `plates`: `[{ src, caption }]` — light-table grid (smaller detail images).
- `floors` (section template): `[{ level, name, text, img }]`.
- `pdf`: `{ src, label }` or `null` (omit the key to hide the plan-room entirely).
- `hasCustomJs`: `true` to load a sandboxed `custom.js` (must export `enhance(root, manifest, ctx)`).

### data/projects.json (hub entry)

`{ slug, title, year, type, template, accent, blurb, silhouette:{kind}, x }`.
`silhouette.kind` (`library` | `rowhouse`) selects a generated massing primitive in `hub.js`;
`x` is its position on the table. (TODO: support `silhouette.glb` to use a real model on the table.)

### Representation modes (`template`)

Implemented: `model`, `section`. Planned: `plan`, `axon`, `diagram`, `process`
(add as new files in `assets/js/templates/` and register in `project.js`'s `templates` map).

## Asset pipeline (author's current Windows machine)

Tools installed this session (paths are machine-specific):
- **Blender 4.5 LTS** — `C:\Program Files\Blender Foundation\Blender 4.5\blender.exe`
- **Conversion script** — `C:\Users\frank\dae2glb.py` (imports `.dae/.obj/.fbx`, exports `.glb`)
- **mutool (MuPDF)** — under `…\WinGet\Packages\ArtifexSoftware.mutool_…\mupdf-1.23.0-windows\mutool.exe`

Recipes:
- **SketchUp `.dae`/`.obj` → `.glb`:**
  `& blender.exe --background --factory-startup --python dae2glb.py -- <in> <out.glb>`
  (Drop the SketchUp **textures folder** next to the `.dae` or textures are lost — material colors only.)
- **PDF board → web image:** `mutool draw -o out.png -w 2200 <in.pdf>`, then re-encode PNG→JPG
  with .NET `System.Drawing` in PowerShell (quality ~82). No ImageMagick/Ghostscript/Python available.
- **JPGs → compact downloadable PDF:** `mutool convert -o <name>-web.pdf img1.jpg img2.jpg`.

Note: avoid wildcard `Remove-Item *.ext` (a safety guard blocks it) — delete by explicit path.

## Deploy & verify

```
git -C <repo> add -A; git -C <repo> commit -m "…"; git -C <repo> push
```
Pages rebuilds in ~1 min. Verify: `gh api repos/fnschreiberpty-arch/Architecture-1/pages/builds/latest`
(status `built`) and probe the live URLs for HTTP 200. Local preview needs a web server
(modules + fetch fail on `file://`) — VS Code Live Preview, or just push.
