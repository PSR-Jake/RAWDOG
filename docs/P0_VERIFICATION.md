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

## Scope and remaining release checks

These results concern the local implementation. No merge or production deployment was performed. External-reference reachability, a full screen-reader audit and complete WCAG certification were not established. Source-detail layout/navigation verification is recorded separately when that step is completed.
