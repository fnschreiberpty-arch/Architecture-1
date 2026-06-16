/* model block — orbitable 3D via <model-viewer>, with a graceful
   "drop your .glb here" state until a real model exists. */
export function mountModel(model) {
  const sec = document.createElement("section");
  sec.className = "modelblock";
  sec.dataset.reveal = "";
  const hasGlb = model && model.src;
  sec.innerHTML = hasGlb
    ? `<div class="modelblock__stage">
         <model-viewer src="${model.src}" poster="${model.poster || ""}"
           alt="${model.alt || "3D model"}" camera-controls auto-rotate ar
           shadow-intensity="1" exposure="1.05" loading="lazy" reveal="interaction"></model-viewer>
       </div>`
    : `<div class="modelblock__stage">
         ${model && model.poster ? `<img class="modelblock__poster" src="${model.poster}" alt="${model.alt || ""}">` : ""}
         <div class="modelblock__note">3D model goes here — export your SketchUp model to <b>.glb</b>,
           drop it in this project's <b>media/</b> folder, then set <b>"model.src"</b> in manifest.json.</div>
       </div>`;
  return sec;
}
