/* ============================================================
   SITE MODEL — kernel.js
   The ~tiny shared contract every page inherits:
   reduced-motion, lazy reveal, command palette, breadcrumb.
   No build step — plain ES module, import from any page.
   ============================================================ */

export const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Fetch the single source of truth. `base` is the relative path
   prefix to the site root from the current page ("" for hub,
   "../../" for a project page). */
export async function loadProjects(base = "") {
  const res = await fetch(`${base}data/projects.json`, { cache: "no-cache" });
  if (!res.ok) throw new Error("projects.json failed to load");
  return res.json();
}

/* Reveal [data-reveal] elements as they enter the viewport. */
export function initReveals() {
  const els = document.querySelectorAll("[data-reveal]");
  if (reducedMotion() || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
  );
  els.forEach((el) => io.observe(el));
}

/* "/" command palette listing every project. Works on every page. */
export function initCommandPalette(projects, base = "") {
  const overlay = document.createElement("div");
  overlay.className = "palette";
  overlay.innerHTML = `
    <div class="palette__box" role="dialog" aria-modal="true" aria-label="Jump to a project">
      <input class="palette__input" type="text" placeholder="Type to find a project…  (Esc to close)" aria-label="Search projects" />
      <ul class="palette__list"></ul>
    </div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector(".palette__input");
  const list = overlay.querySelector(".palette__list");
  let active = 0;

  const items = [
    { title: "The Table — Home", meta: "Hub", href: `${base}index.html` },
    ...projects.map((p) => ({
      title: p.title,
      meta: p.type || "",
      href: `${base}projects/${p.slug}/index.html`,
    })),
  ];

  function render(filter = "") {
    const f = filter.trim().toLowerCase();
    const matches = items.filter((i) => i.title.toLowerCase().includes(f));
    active = 0;
    list.innerHTML = matches
      .map(
        (i, idx) =>
          `<li class="palette__item ${idx === 0 ? "is-active" : ""}" data-href="${i.href}">
             <span>${i.title}</span><small>${i.meta}</small>
           </li>`
      )
      .join("");
  }

  function open() {
    overlay.classList.add("is-open");
    render("");
    input.value = "";
    input.focus();
  }
  function close() {
    overlay.classList.remove("is-open");
  }
  function go() {
    const el = list.children[active];
    if (el) window.location.href = el.dataset.href;
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !overlay.classList.contains("is-open") &&
        !/^(input|textarea)$/i.test(document.activeElement?.tagName)) {
      e.preventDefault();
      open();
    } else if (overlay.classList.contains("is-open")) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowDown") { e.preventDefault(); active = Math.min(active + 1, list.children.length - 1); paint(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); active = Math.max(active - 1, 0); paint(); }
      else if (e.key === "Enter") { e.preventDefault(); go(); }
    }
  });
  function paint() {
    [...list.children].forEach((c, i) => c.classList.toggle("is-active", i === active));
  }
  input?.addEventListener("input", () => render(input.value));
  list.addEventListener("click", (e) => {
    const li = e.target.closest(".palette__item");
    if (li) window.location.href = li.dataset.href;
  });
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

  return { open, close };
}

/* Top bar with breadcrumb + prev/next arrows, for project pages. */
export function initTopbar(projects, currentSlug, base = "", palette) {
  const idx = projects.findIndex((p) => p.slug === currentSlug);
  const prev = projects[idx - 1];
  const next = projects[idx + 1];

  const bar = document.createElement("header");
  bar.className = "topbar";
  bar.innerHTML = `
    <div class="topbar__crumb">
      <a href="${base}index.html">The Table</a>
      <span class="sep">/</span>
      <span>${projects[idx]?.title ?? ""}</span>
    </div>
    <nav class="topbar__nav">
      <button class="arrow" data-go="prev" ${prev ? "" : "disabled"} aria-label="Previous project">←</button>
      <button class="arrow" data-go="next" ${next ? "" : "disabled"} aria-label="Next project">→</button>
      <button class="index-btn" data-palette>Index</button>
    </nav>`;
  document.body.appendChild(bar);

  bar.querySelector('[data-go="prev"]')?.addEventListener("click", () => {
    if (prev) window.location.href = `${base}projects/${prev.slug}/index.html`;
  });
  bar.querySelector('[data-go="next"]')?.addEventListener("click", () => {
    if (next) window.location.href = `${base}projects/${next.slug}/index.html`;
  });
  bar.querySelector("[data-palette]")?.addEventListener("click", () => palette?.open());

  document.addEventListener("keydown", (e) => {
    if (/^(input|textarea)$/i.test(document.activeElement?.tagName)) return;
    if (e.key === "ArrowLeft" && prev) window.location.href = `${base}projects/${prev.slug}/index.html`;
    if (e.key === "ArrowRight" && next) window.location.href = `${base}projects/${next.slug}/index.html`;
  });
}
