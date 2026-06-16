/* plan-room — view a drawing set inline (native PDF) with a
   prominent, always-available download. Shows a clear drop-in
   prompt until a real PDF exists. */
export function mountPlanroom(pdf) {
  const sec = document.createElement("section");
  sec.className = "planroom";
  sec.dataset.reveal = "";
  const has = pdf && pdf.src;
  const label = (pdf && pdf.label) || "Drawing set";
  sec.innerHTML = `
    <div class="planroom__bar">
      <span>${label} · PDF</span>
      ${has ? `<a class="planroom__dl" href="${pdf.src}" download>↓ Download sheet (PDF)</a>` : ""}
    </div>
    <div class="planroom__frame">
      ${has
        ? `<iframe src="${pdf.src}#view=FitH" title="${label}" loading="lazy"></iframe>`
        : `<div class="planroom__empty">Drawing set goes here — export your AutoCAD layouts to one
             <b>PDF</b>, drop it in this project's <b>media/</b> folder, then set <b>"pdf.src"</b> in manifest.json.</div>`}
    </div>`;
  return sec;
}
