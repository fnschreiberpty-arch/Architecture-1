/* shared world parts — intro plate + footer, used by every template
   so all worlds keep PLATE-grade caption/plate-number rigor. */
import { openLightbox } from "../components/lighttable.js";

export function intro(manifest) {
  const sec = document.createElement("section");
  sec.className = "world__intro";
  sec.innerHTML = `
    <div class="world__plate-no">Plate ${manifest.plateNo || "01"}</div>
    <h1 class="world__title">${manifest.title}</h1>
    ${manifest.subtitle ? `<p class="world__subtitle">${manifest.subtitle}</p>` : ""}
    <div class="world__meta">
      ${manifest.year ? `<span>Year <b>${manifest.year}</b></span>` : ""}
      ${manifest.program ? `<span>Program <b>${manifest.program}</b></span>` : ""}
      ${manifest.location ? `<span>Location <b>${manifest.location}</b></span>` : ""}
      ${manifest.studio ? `<span>Studio <b>${manifest.studio}</b></span>` : ""}
    </div>
    ${manifest.statement ? `<p class="world__statement" data-reveal>${manifest.statement}</p>` : ""}`;
  return sec;
}

export function footer(base) {
  const f = document.createElement("footer");
  f.className = "world__footer";
  f.innerHTML = `<span>Frank Schreiber — Selected Works</span>
    <span><a href="${base}index.html">← Back to the table</a></span>`;
  return f;
}

/* full-bleed numbered plate (presentation boards / hero drawings),
   click to inspect in the lightbox with a magnifier loupe. */
export function fullPlate(item, i) {
  const sec = document.createElement("section");
  sec.className = "plate";
  sec.dataset.reveal = "";
  sec.innerHTML = `<figure>
    <img src="${item.src}" alt="${item.caption || ""}" loading="lazy">
    <figcaption><span class="n">${String(i).padStart(2, "0")}</span><span>${item.caption || ""}</span></figcaption>
  </figure>`;
  const img = sec.querySelector("img");
  img.style.cursor = "zoom-in";
  img.addEventListener("click", () => openLightbox(item.src, item.caption));
  return sec;
}
