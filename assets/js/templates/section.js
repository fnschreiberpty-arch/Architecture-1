/* SECTION world — you scroll DOWN through the building floor by floor.
   Best for vertically-organized projects (rowhouses, towers). */
import { intro, footer } from "./parts.js";
import { mountLightTable } from "../components/lighttable.js";
import { mountPlanroom } from "../components/planroom.js";
import { mountModel } from "../components/modelblock.js";

export async function render(root, manifest, base) {
  root.appendChild(intro(manifest));

  if (manifest.floors?.length) {
    const wrap = document.createElement("section");
    wrap.className = "floors";
    manifest.floors.forEach((fl) => {
      const el = document.createElement("article");
      el.className = "floor";
      el.dataset.reveal = "";
      el.innerHTML = `
        <div class="floor__media"><img src="${fl.img}" alt="${fl.name || ""}" loading="lazy"></div>
        <div class="floor__body">
          <div class="floor__level">${fl.level || ""}</div>
          <h2 class="floor__name">${fl.name || ""}</h2>
          <p class="floor__text">${fl.text || ""}</p>
        </div>`;
      wrap.appendChild(el);
    });
    root.appendChild(wrap);
  }

  if (manifest.plates?.length) root.appendChild(mountLightTable(manifest.plates));
  if ("pdf" in manifest) root.appendChild(mountPlanroom(manifest.pdf));
  if (manifest.model) root.appendChild(mountModel(manifest.model));

  root.appendChild(footer(base));
}
