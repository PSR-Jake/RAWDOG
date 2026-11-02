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

## Coordinates / web r16 — 2026-11-02

- Adds RA, Dec, Gl and Gb from the existing released sky fields to Positions and All columns (18). No coordinate transform, propagation or source-data update is introduced.
- Presentation assertions compare all four displayed values for all 58 systems with the sky inputs; check both sort directions, negative coordinates, zero, missing values and sub-display precision. Original Gaia-string sorting, source renderers and CSV contracts still pass.
- `python scripts/check.py` passes the existing coordinate, Galactic-agreement, provenance and scientific-consistency checks.
- Browser: Positions has System, RA, Dec, Gl, Gb, Gaia DR3 ID and Class; Gl sorts numerically in both directions. Switching to Essentials retains the hidden Gl sort and its visible state. All columns contains 18 headers and retains the search result.
- ASKAP J144834−685644 shows its existing radio RA/Dec and qualified Gl/Gb while keeping the Gaia identifier blank. The origin label and expandable coordinate key retain the published-J2000/reference-epoch qualification and documented transformation approximation.
- Actual coordinate CSV download is byte-identical to `data/v1.0.2/sky_plot_input.csv`: all 58 rows and full-precision coordinate/provenance fields. The filtered systems CSV keeps its original 210-field source-summary schema.
- At 390 px, document clientWidth and scrollWidth are both 375 px; the 686 px Positions table scrolls inside its 343 px container. Desktop and mobile screenshots were inspected.
- Protected path set and SHA-256 values remain identical for all 157 files.

## Fixed catalog table / web r17 — 2026-11-02

Supersedes the column presets introduced in web r14/r16. One fixed table now contains System, Class, RA, Dec, Gl, Gb, Distance, Orbital period, WD spin, Radio recurrence and Radio observations. There is no column selector or hidden sort column.

Field selection: all 58 systems have the four released sky coordinates; selected central values cover 50 distances, 54 orbital periods, 12 WD spin periods and 3 radio recurrence periods. The distinct clocks stay in the main comparison despite incomplete coverage. Stellar temperatures (19 selected central values), WD masses (12) and companion spectral types (28) move to source details with their component/model context. Gaia identifiers and individual radio/X-ray values also live in source details; observation counts remain a direct route to the full radio table. No first-record flux or luminosity is shown as a source-level comparison value.

Passed:

- `node scripts/check_presentation.js`: all 58 systems have exactly the same 11 columns; coordinate values, full-precision sorting, zero/missing cases, original Gaia strings/links/search, CSV precision, every source measurement ID, references and asynchronous failure handling remain covered.
- Existing WD-mass and photospheric-temperature ranges/bounds without a central value appear in the source property overview with original notes, conventions and direct evidence links. All eight such source/property cases are checked; J1912's unselected preferred distance stays unselected.
- `python scripts/check.py`: 58 systems, 96 observation rows, 7,175 provenance records, 669 references, 58 sky systems and 56 CMD systems with 2 exclusions. Same runtime limitations as the earlier checks apply.
- In-app browser: all 11 columns fit the 1,163 px table container at a 1,280 px viewport. Gl sorts in both directions; combined search/class/host/radio filters retain the same column set; reset and zero-result feedback work.
- QS Vir: 9 matching rows highlighted, all 10 radio rows and 6 luminosity records retained. The actual downloaded one-row CSV matches every field of the released 210-field source summary. Empty-export headers pass the formatter assertion; a repeated empty-result browser download did not yield a new captured file in this session, so that end-to-end check is not claimed.
- AR Sco: mass range and historical temperature upper limit are visible in properties; the mass evidence action opens M06988. At 390 px, AP CrB's temperature range and source evidence remain accessible and the detail client/scroll widths both equal 375 px.
- At 390 px, document client/scroll widths both equal 375 px; the 1,057 px main table scrolls within its 343 px region, including access to the last column while source names stay visible. Desktop and mobile screenshots were inspected.
- Identical path sets and SHA-256 values for all 157 protected files under `data/`, `figures/`, `assets/sources/` and `assets/catalog.json`.

## Sexagesimal coordinates / web r18 — 2026-11-02

The fixed table now has nine columns: System, Class, RA, Dec, Gl, Gb, Distance, Orbital period and WD spin. Radio recurrence and observation counts remain in source details and the original downloads. RA displays hh:mm:ss.sss; Dec displays ±dd:mm:ss.ss. Both headers give ICRS and reference epoch J2016.0 for the 57 Gaia positions; repeated Gaia labels are removed from the rows. ASKAP J144834−685644 retains a published-J2000 marker in both cells and a visible table note. Its metadata does not support asserting a new ICRS J2016.0 position. No frame conversion, epoch propagation or data selection is introduced.

Passed:

- `node scripts/check_presentation.js`: all 58 systems render the same nine columns; removed fields remain in source evidence. New formatter checks cover RA hours, wrapping/rounding to 00h, carry across minutes/hours, signed sub-degree Dec, negative zero, poles and missing values. All displayed coordinate pairs round-trip within the stated display rounding; numeric sorting still uses stored degree values, including sub-display precision and missing-last behavior.
- Independent comparison of the actual JavaScript formatter output with Astropy `Angle.to_string`: exact agreement for all 58 RA/Dec pairs at 0.001 seconds of RA time and 0.01 arcseconds of Dec. This validates display conversion and rounding, not the literature astrometry.
- `python scripts/check.py`: existing scientific consistency checks pass (58 systems, 96 observation rows, 7,175 provenance records, 669 references; 58 sky systems and 56 CMD systems).
- Browser: nine headers; sexagesimal values and shared frame/epoch labels; both RA and Dec sort directions; positive and negative Dec; published-J2000 exception in both cells. GLEAM-X J0704−37's recurrence remains 10496.5522 ± 0.0008 s in the source property overview, with M04430 and its original radio row available.
- At a 1280 px viewport, all nine columns fit the 1163 px table region. At 390 px, document client/scroll widths both equal 375 px; the 884 px table scrolls inside its 343 px region. Desktop/mobile screenshots inspected; viewport override reset afterward.
- Protected path sets and SHA-256 values remain identical for all 157 data, figure, catalog-index and source-bundle files. Full-precision degree inputs and all 210 source-summary export fields are unchanged. No new export format or cross-browser certification is claimed.

## Scope and remaining release checks

These results concern the local implementation. No merge or production deployment was performed. External-reference reachability, a full screen-reader audit and complete WCAG certification were not established. The selected source and figure interactions above were checked in the in-app browser; no cross-browser certification is claimed.
