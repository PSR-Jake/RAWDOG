# P0 presentation verification — 2026-10-30

Reviewed scientific baseline: `0d53553544a6f36522273a563605089f57049455` (catalog 1.0.2, website web r13). No scientific values or selections are revised by P0.

## Catalog / web r14

Passed:

- `node scripts/check_presentation.js`: all 58 systems in the four 7/10/7/14-column presets; raw sorting, missing/range handling, exact Gaia strings/links, emission semantics, source evidence and non-mutation checks retained.
- `python scripts/check.py`: 58 systems, 96 observation rows, 7,175 provenance records, 669 references, 58 sky systems and 56 CMD systems with 2 exclusions.
- `python scripts/cmd_revision.py --check`: unchanged web-r13 inputs/exports and source-specific CMD adoption.
- `python scripts/emission_inputs.py --check`: unchanged 96 radio rows and 52 available luminosity records in 26 systems.
- SHA-256 manifest comparison: identical path sets and bytes for all 157 files under `data/`, `figures/`, `assets/sources/` and `assets/catalog.json`.
- In-app browser at the local `/RAWDOG/` path: all four presets; hidden WD-mass sort retained with an accurate visible notice; combined search/class/host/radio filters; reset; source-close return state; zero-result feedback.
- QS Vir filtered by reported flux: 9 matching rows highlighted, all 10 retained, first preview still 970 ±160 µJy; original category qualifications retained.
- Actual browser-downloaded CSVs: 58-row sorted sample, 1-row QS Vir selection in two different presets, and a zero-row selection. All 210 header fields and every stored field match the released CSV; sort/missing order checked. The two QS Vir files are byte-identical; zero matches preserve headers.
- Desktop and 390 px screenshots inspected. All seven Essentials columns fit the tested desktop table. Narrow Catalog scrolling remains inside the table; document clientWidth and scrollWidth both 375 CSS px at the 390 px browser width.

Scientific checks used the available Python 3.13.9 runtime with NumPy 2.4.3, Matplotlib 3.10.8 and Astropy 7.2.0; presentation checks used Node 25.9.0. The exact requirements.txt environment was not recreated, and publication figures were not regenerated. The checks validate stored-product consistency, not the correctness of every literature result.

## Source details / web r15

Passed:

- The presentation check renders all 58 source bundles: original six-section order, 96 independent radio rows, all 52 available luminosity records, every measurement ID and reference, all supplied uncertainty conventions, complete source JSON and non-mutation checks. Each displayed selected property has a resolving evidence link; observation IDs/order are compared with the original bundles.
- Explicit regressions retain AR Sco's 42.7±0.2 G synchrotron field with MCSE qualification and separate approximately 15 MG polar field; J1912's blank preferred distance, recorded reason and exact Gaia ID; GLEAM-X's separate geometric/catalog and web-r13 SED/CMD contexts; ASKAP clocks, missing counterpart and exclusions. Existing scientific checks also cover overlapping classifications and nonmember separation.
- Browser: QS Vir's ten radio and six X-ray records; individual metadata expansion/collapse; direct parameter-to-measurement navigation that opens all required disclosures; source name and section controls remain visible. Heading positions were checked against the actual sticky-toolbar bottom.
- 390 px source detail: all ten original radio rows retained; dialog clientWidth equals scrollWidth (375 px), radio table clientWidth equals scrollWidth (343 px). No horizontal scrolling is needed for the observation blocks. Escape closes the view and restores focus; the tested reverse/forward Tab cycle stays inside the modal.
- J1912: exact Gaia-string search, no distance in selected properties, recorded missing-distance explanation, explicit CMD-only adoption. Browser Back restores the original search and invoking source control.
- Figure filtering: an AR Sco catalog selection gives 1/58 sky and 1/56 CMD foreground systems with two scientific CMD exclusions retained; selecting the actual sky symbol opens AR Sco and preserves the catalog selection.
- Unknown source route: named error view and Close recovery. An isolated local failure server supplied malformed source JSON and a missing sky SVG without changing protected files: the source view displays an evidence-CSV recovery link; the static sky PNG loads as the SVG fallback.
- A request-ownership regression exercises the actual asynchronous source-opening function: a delayed old failure cannot replace a newer successful source; malformed JSON and unknown IDs produce safe recovery states.
- Palette checks: primary text/page 14.85:1, secondary text/white 6.03:1, link/focus color/white 6.73:1, control border/wash 5.41:1. Dark-header controls use white focus outlines. These spot checks do not establish complete accessibility compliance.
- Scientific, CMD, emission and presentation commands passed after the source renderer changes; final protected path/hash comparison again finds all 157 files unchanged.

## Scope and remaining release checks

These results concern the local implementation. No merge or production deployment was performed. External-reference reachability, a full screen-reader audit and complete WCAG certification were not established. The selected source and figure interactions above were checked in the in-app browser; no cross-browser certification is claimed.
