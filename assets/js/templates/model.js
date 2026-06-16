/* MODEL world — a dark gallery built around a single orbitable 3D
   model as the centerpiece. Best for projects where the object /
   spatial form is the argument (pavilions, civic buildings). */
import { intro, footer } from "./parts.js";
import { mountModel } from "../components/modelblock.js";
import { mountLightTable } from "../components/lighttable.js";
import { mountPlanroom } from "../components/planroom.js";

export async function render(root, manifest, base) {
  root.appendChild(intro(manifest));
  if (manifest.model) root.appendChild(mountModel(manifest.model));
  if (manifest.plates?.length) root.appendChild(mountLightTable(manifest.plates));
  if ("pdf" in manifest) root.appendChild(mountPlanroom(manifest.pdf));
  root.appendChild(footer(base));
}
