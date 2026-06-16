/* light table — a contact-sheet grid; clicking lifts an image into
   a backlit lightbox with a magnifier loupe for inspecting detail. */
let lb;
function ensureLightbox() {
  if (lb) return lb;
  lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML = `
    <button class="lightbox__close" aria-label="Close">Close ✕</button>
    <img class="lightbox__img" alt="">
    <div class="lightbox__loupe" aria-hidden="true"></div>`;
  document.body.appendChild(lb);

  const img = lb.querySelector(".lightbox__img");
  const loupe = lb.querySelector(".lightbox__loupe");
  const close = () => { lb.classList.remove("is-open"); loupe.style.display = "none"; };

  lb.querySelector(".lightbox__close").addEventListener("click", close);
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  img.addEventListener("mousemove", (e) => {
    const r = img.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) { loupe.style.display = "none"; return; }
    const zoom = 2.4;
    const lw = loupe.offsetWidth / 2, lh = loupe.offsetHeight / 2;
    loupe.style.display = "block";
    loupe.style.backgroundImage = `url("${img.src}")`;
    loupe.style.backgroundSize = `${r.width * zoom}px ${r.height * zoom}px`;
    loupe.style.left = `${e.clientX - lw}px`;
    loupe.style.top = `${e.clientY - lh}px`;
    loupe.style.backgroundPosition = `${-(x * r.width * zoom - lw)}px ${-(y * r.height * zoom - lh)}px`;
  });
  img.addEventListener("mouseleave", () => (loupe.style.display = "none"));

  lb.openImg = (src, alt) => { img.src = src; img.alt = alt || ""; lb.classList.add("is-open"); };
  return lb;
}

/* open the shared lightbox directly (used by full-width plates too) */
export function openLightbox(src, alt) { ensureLightbox().openImg(src, alt); }

export function mountLightTable(plates) {
  const sec = document.createElement("section");
  sec.className = "lighttable";
  sec.dataset.reveal = "";
  (plates || []).forEach((p, i) => {
    const fig = document.createElement("figure");
    fig.className = "lighttable__cell";
    fig.tabIndex = 0;
    fig.innerHTML = `<img src="${p.src}" alt="${p.caption || ""}" loading="lazy">
      <figcaption>${String(i + 1).padStart(2, "0")} · ${p.caption || ""}</figcaption>`;
    const open = () => ensureLightbox().openImg(p.src, p.caption);
    fig.addEventListener("click", open);
    fig.addEventListener("keydown", (e) => { if (e.key === "Enter") open(); });
    sec.appendChild(fig);
  });
  return sec;
}
