/* ============================================================
   SITE MODEL — project.js
   Per-project page entry. Reads this project's manifest.json,
   applies its theme, dispatches to a template (representation
   mode), mounts shared chrome, and runs any sandboxed override.
   Project pages live at /projects/<slug>/, so the site root is
   two levels up ("../../").
   ============================================================ */

import {
  loadProjects, initReveals, initCommandPalette, initTopbar, reducedMotion,
} from "../../assets/js/kernel.js";

const BASE = "../../";

async function boot() {
  const manifest = await (await fetch("manifest.json", { cache: "no-cache" })).json();

  // theme: expose tokens as CSS custom properties on <body>
  const b = document.body;
  b.classList.add("world");
  b.dataset.template = manifest.template;
  const set = (k, v) => v && b.style.setProperty(k, v);
  set("--paper", manifest.paper);
  set("--ink", manifest.ink);
  set("--accent", manifest.accent);
  set("--muted", manifest.muted);
  document.title = `${manifest.title} — Frank Schreiber`;

  const root = document.getElementById("world");

  // dispatch on representation mode
  const templates = {
    model: () => import("../../assets/js/templates/model.js"),
    section: () => import("../../assets/js/templates/section.js"),
  };
  const loader = templates[manifest.template] || templates.section;
  try {
    const mod = await loader();
    await mod.render(root, manifest, BASE);
  } catch (err) {
    console.error("[project] template failed:", err);
    root.innerHTML = `<div class="world__intro"><p>Could not render this world.</p></div>`;
  }

  // shared chrome
  const data = await loadProjects(BASE);
  const palette = initCommandPalette(data.projects, BASE);
  initTopbar(data.projects, manifest.slug, BASE, palette);
  initReveals();

  // Tier-3 sandboxed override: optional custom.js for this project only.
  // If it throws, the template default already rendered — the site is safe.
  if (manifest.hasCustomJs) {
    try {
      const custom = await import("./custom.js");
      await custom.enhance?.(root, manifest, { reducedMotion });
    } catch (err) {
      console.warn("[project] custom.js override skipped (fell back to template):", err);
    }
  }
}

boot();
