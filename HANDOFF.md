# HANDOFF — SITE MODEL portfolio

**Last updated:** 2026-06-16 · **Author:** Frank Schreiber
**Live:** https://fnschreiberpty-arch.github.io/Architecture-1/ · **Repo:** https://github.com/fnschreiberpty-arch/Architecture-1

A continuation snapshot. For conventions/how-to, read **CLAUDE.md**; for author instructions, **README.md**.

## The idea (design direction)

Chosen from a multi-concept design study: **"SITE MODEL."** The homepage is a 3D *crit review
table* — each project is a massing model you orbit and "step into." The hub is deliberately
restrained (charcoal fog, one accent) so each project world can be loud and divergent. Each
project's world is organized by a **representation mode** (`model`, `section`, …) — the way
architects actually communicate — so "every project is its own experience" is grounded in the
discipline, not arbitrary theming.

## Current state

| Area | Status |
|---|---|
| Hub (3D crit table + flat fallback) | ✅ live; uses **generated massing primitives** per project |
| Shared engine (kernel, templates, components) | ✅ done — `model` + `section` modes implemented |
| Accessibility (no-JS fallback, reduced-motion, Index, `/` palette) | ✅ in place |
| **Georgetown Library** (`model` world) | ✅ **real assets**: `library.glb` (4.2 MB) + 2 board JPGs + downloadable `library-boards-web.pdf` |
| **Georgetown RowHouse** (`section` world) | ⛔ still on **placeholder** drawings — no real assets yet |
| Deploy | ✅ GitHub Pages, `main` root; pushes auto-rebuild |

## Done so far

- Installed toolchain from scratch: git, GitHub CLI (auth as `fnschreiberpty-arch`), Blender 4.5, mutool.
- Built the whole static site (no build step) and deployed to GitHub Pages.
- Converted Georgetown Library's SketchUp COLLADA → `library.glb` (Blender, headless).
- Rasterized two 300–377 MB presentation-board PDFs → web JPGs + a 1.7 MB downloadable PDF.
- `.gitignore` keeps the ~670 MB of raw sources out of the repo; only web derivatives are committed.

## Known issues / to verify

- **Library model orientation/scale not visually verified** — SketchUp→glTF flips axes; confirm it
  sits upright and frames well when orbiting. Adjust in `dae2glb.py` (export flags) or via a
  `<model-viewer>` `camera-orbit`/`orientation` if needed.
- **Library model has no textures** — the `.dae` was dropped without its texture folder, so it
  renders material colors only. Re-convert with the textures folder to add them.
- **Floor-plan board** ("…Floor P need fixes") is a known-WIP export from the author — replace later.
- Hub still shows a **generated block** for each project, not the real model silhouette
  (TODO: support `silhouette.glb` in `data/projects.json` + `hub.js`).

## Suggested next steps

1. **Verify/refine Georgetown Library** — orientation, textures, swap the floor-plan board, tune colors/lighting.
2. **Build Georgetown RowHouse** — author exports model + boards; run the same pipeline (CLAUDE.md → Asset pipeline) and fill `projects/georgetown-rowhouse/manifest.json` (it's a `section` world).
3. **Use real silhouettes on the hub table** — load each project's `.glb` in `hub.js` instead of the primitive.
4. **Optional polish** — About/contact section, custom domain (CNAME), more representation modes.

## Environment notes

- Windows 11, working dir `C:\Users\frank`, repo at `C:\Users\frank\Architecture-1`.
- No Node/npm (keep the site build-free). No ImageMagick/Ghostscript/real-Python — image work uses
  mutool + .NET `System.Drawing`. Tool paths and recipes are in **CLAUDE.md**.
