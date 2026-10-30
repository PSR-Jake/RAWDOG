# Website revision web r15 — 2026-10-30

Adds a named source dialog with a sticky source heading and local navigation, preserving the existing hash routes and section order. Radio and X-ray comparisons retain original row/measurement IDs, values, uncertainty conventions, bands, states, components, models and references. Narrow screens show the same records as labeled blocks without horizontal scrolling; metadata stays individually expandable with a collapse control.

Selected properties link directly to their measurement evidence, automatically opening the relevant disclosures. Recorded missing-selection reasons are accessible without inventing values. J1912's catalog preferred distance remains blank, with its existing geometric adoption explicitly labeled CMD-only. Existing period evidence-key variants are resolved without changing any clock or source data. Browser Back/Escape restore catalog context and focus; unknown routes and unavailable source bundles provide recovery guidance. Late request failures cannot overwrite a newer source view.

Catalog data remains 1.0.2; CMD inputs/exports remain web r13. All 157 protected files remain byte-identical to the reviewed baseline. [Checks and limitations](P0_VERIFICATION.md).

# Website revision web r14 — 2026-10-30

Adds Essentials (7), Physical properties (10), Radio/X-ray (7) and All columns (14) views, retaining all original table fields. Filter tokens, result counts and a visible sort summary preserve context when a sorted column is hidden. WD-host confidence remains in its independent filter and source detail. The compact header exposes version, download and citation links.

Radio evidence uses existing source-level label counts without a new confidence ranking. Radio filtering still matches any observation; first-record previews are unchanged. Matching-record actions highlight the corresponding source observations while retaining every row. Filtered systems CSV downloads preserve the complete 210-field summary schema, stored strings, current row order and exact Gaia IDs, including header-only empty exports.

Catalog data remains 1.0.2 and CMD figure/input revision remains web r13. All 157 protected data, figure, archive, catalog-index and source-bundle files are unchanged. [Implementation checks](P0_VERIFICATION.md).

# Website / CMD figure revision web r13 — 2026-10-18

Removes the permanent GLEAM-X source-name/prior-sensitivity annotation. At the author request, that source's CMD-only distance now uses M04418, 380±10 pc from the published spectrum/SED fit, reaffirmed in Rodriguez et al. (2026), Table 2. With unchanged observed Gaia photometry this gives M_G=12.885594 mag at BP−RP=1.851223. The recorded p16/p84 distance endpoints are transformed nonlinearly, with model dependence retained in inputs, hover and details. Other 57 input rows, membership and both exclusions are unchanged.

New CMD inputs/exports are under `data/v1.0.2-web-r13/` and `figures/v1.0.2-web-r13/`. The website uses those rows for CMD details; the catalog summary's geometric distance, original source bundles, all prior figures/tables and archives remain immutable. Catalog data remains 1.0.2. This explicitly supersedes the earlier Gaia-only plotting policy for GLEAM-X, not for other systems. [Evidence, methods and preserved alternatives](CMD_REVISION_WEB_R13.md).

# Website revision web r12 — 2026-10-18

Makes each recorded Gaia DR3 ID a link to the corresponding VizieR full-record view in I/355/gaiadr3, constrained by the exact Source identifier. Links open a new tab; missing counterparts remain unlinked dashes. Repairs the X-ray evidence CSV download path to its preserved web-r10 product, which had been inadvertently changed during the web-r11 revision. Catalog data remains 1.0.2; values, classifications, exports, source bundles and figures are unchanged.

# Website revision web r11 — 2026-10-15

Adds a sortable Gaia DR3 source-ID column beside each source name. All 57 recorded identifiers retain their full string precision; ASKAP J144834−685644 has no selected Gaia counterpart and displays a dash. Missing IDs sort last in both directions. Catalog data remains 1.0.2; scientific values, exports, evidence and figures are unchanged.

# Website revision web r10 — 2026-10-15

Adds radio flux density and recorded X-ray luminosity columns to the open parameter table, with bands, limits, peak-brightness labels and historical-distance context. Each value opens the corresponding source evidence; all sources now have a consistent X-ray section containing every available luminosity record and expandable methods. Previews are explicitly the first recorded entry, not an average or new preferred selection. The 52 available luminosity/limit/scaling records cover 26 systems; unsupported luminosities remain missing. No flux conversion, distance rescaling or scientific selection is introduced. Original ledger fields remain in supplementary versioned inputs under `data/v1.0.2-web-r10/`.

The display preserves logarithmic units, distance-normalized coefficients and limits. GLEAM-X M04492/M04493 are displayed as upper bounds because their parameter names explicitly identify upper limits despite blank raw limit flags; their raw values, errors and flags remain intact. Redundant CV parent labels are omitted when mCV is displayed, while raw classifications and filter membership remain unchanged. Catalog data stays 1.0.2; all original data, archives, source bundles and figures are preserved. [Methods and evidence details](EMISSION_COLUMNS_WEB_R10.md).

# Website revision web r9 — 2026-10-15

Tries a compact, full-length scientific parameter table: system, nonexclusive class, distance, orbital period, WD spin, radio recurrence, WD photospheric temperature, WD mass and companion spectral type. Long subclass/radio narratives and observation counts move out of the main table; they remain in source details, filters and unchanged exports. Existing WD-temperature/mass bounds and ranges are displayed without adopting central values or a common confidence level. Sorting uses raw selected scalars, keeping missing/range-only values last in both directions. Source names stay fixed during mobile horizontal scrolling. This is a website presentation revision; catalog 1.0.2, scientific selections, data archives and figures are unchanged.

# Website revision web r8 — 2026-10-09

Replaces large selected-property cards with compact quantity/value rows. Units and formatted errors remain visible, with brief approximate/model/interval/MCSE qualifications where applicable. Repeated component and explanatory metadata move to the closed “Property notes & uncertainty conventions” disclosure, including full methods, assumptions, measurement IDs and references. Source section order, radio observations and all existing evidence disclosures remain intact. Catalog data stays 1.0.2; scientific values, exports and figures are unchanged.

# Website revision web r7 — 2026-10-08

Standardizes all source detail views with the same five sections and labeled observation summaries. Available property cards follow a shared order, identify components and retain their recorded uncertainty conventions; missing selections are explicit. Aliases, full observation metadata, methods, alternatives, review history and complete references remain expandable, with measurement groups sorted by name. This is a presentation revision only: catalog data remains 1.0.2, with no changed scientific selections, source values, membership, exports or figure products.

# RAWDOG 1.0.2 — 2026-10-01 (web r6)

Withdraws CHIME/ILT J1634+44 from active catalogue membership at the author request because its nature and white-dwarf interpretation are unclear. Its one observation row, 117 evidence records, six review items and source-level rows are removed from current public tables, website search/details and plots. This is a membership decision, not a rejected-counterpart identification; historical releases and the 669-entry bibliographic manifest remain preserved.

Current counts: 58 systems, 96 observation rows, 7,175 evidence records (7,101 member and 74 rejected-counterpart records), 320 review items (312 open). All surviving source values and IDs are unchanged, including ASKAP J144834-685644 and accepted AR Sco fields. The sky uses 57 Gaia positions and one MeerKAT literature position. CMD coverage remains 56/58, with only the two ASKAP systems excluded. New versioned data, figures, checksums and archive supersede 1.0.1 without overwriting it.

# RAWDOG 1.0.1 — 2026-09-30 (web r5)

Adds ASKAP J144834-685644 from [Anumarlapudi et al. (2025)](https://arxiv.org/abs/2507.13453) and [Mo et al. (2026)](https://arxiv.org/abs/2609.35980): one system, one observation summary, 109 provenance records, two references and five open review issues. Totals: 59 systems, 97 observations, 7,292 provenance records (7,218 member and 74 rejected), 669 references, 318 open issues. Existing records, v1.0.0 data/archive and historical figures are preserved.

The optical evidence establishes a CV host; polar and period-bouncer interpretations remain qualified. The 98.6 +4.2/−4.1 min orbital posterior (68% credible interval) and 93.8513 ±0.0008 min radio recurrence remain distinct. No WD spin, distance, Gaia association, component mass/temperature or magnetic-field scalar is adopted from illustrative models. The 760 ±40 μJy discovery-image integrated continuum measurement is distinguished from 19 burst measurements. X-ray flux alternatives retain their absorption/model metadata without assigning an unspecified integration band.

Sky coverage is 59/59 using the new MeerKAT literature position; CMD coverage is 56/59 with an explicit new exclusion. New versioned CSVs, plot inputs, PDF/SVG/PNG figures, checksums and archive are provided. Scientific and presentation checks validate the addition and preservation of all previous catalogue rows.

# RAWDOG 1.0.0 public snapshot — 2026-09-28

Publication basis: reviewed 1.0.0-rc3. This is a separate public snapshot; audited root masters and historical release directories were preserved. Version 1.0.0 reflects acceptance of the specified presentation decisions and passing publication consistency checks, not resolution of all scientific review questions. No DOI, author list or license is assigned.

Membership: 58 systems; 96 observation rows; 7,183 provenance records (7,109 member and 74 rejected counterpart records); 667 references. Rejected MM Hya / PG 0911-066 remains outside membership with its identity-audit index and ledger records.

## Accepted policies

- CHIME/ILT J1634+44 remains a candidate member with unresolved host identity, no Gaia counterpart and no assumed preferred WD properties. Conditional published model scenarios remain alternatives, not established component properties.
- Marginal radio labels retain the source wording. No harmonized significance threshold is introduced.
- ASKAP J174508.9-505149 keeps overlapping long-period-transient and proposed magnetic-CV tags with inferred/proposed host confidence and qualified subclass status.
- AR Sco: select **42.7±0.2 G**, M07011, Barrett & Gurwell (2025), Table 2 fast-cooling synchrotron-region field. The error is **MCMC standard error (MCSE)**, not a physical confidence interval. Select the separately inferred **approximately 15 MG WD polar field**, M07014, with no invented uncertainty. Do not populate a mean photospheric field. Keep the slow-cooling 20 G alternative (M07012), original abstract “43 MG” wording/value (M07013), and competing WD models intact. The abstract unit typo is a stated inference from the consistent Table 2/body/conclusions, not an author-confirmed correction. [Primary paper](https://arxiv.org/html/2505.06468v1).

Only AR Sco summary component-field selection/metadata changes are made to scientific catalog fields (20 changed cells). Exact old/new values and evidence IDs are in `data/v1.0.0/summary_changes.json`. Radio-region selected coverage changes from 21 to 22 / 58; WD polar-field coverage changes from 2 to 3 / 58. Other selected coverages remain unchanged, including 50 catalog preferred distances. The six additional CMD geometric adoptions are plot-specific and do not alter catalog summaries.

## Public-reference sanitization

Paper PDFs, personal paths and private local evidence artifacts are not distributed. Reference `local_path`, `original_local_path`, `local_path_candidates` and `filename` values are blanked. Embedded local absolute paths and local audit artifact paths are replaced by `[local artifact withheld]`, including original URL fields only where they contained a local artifact. Public citation URLs, reference keys, locations identifying paper sections/tables, original DOI/URL claims and all numeric scientific values are preserved. The sanitization log lists file, row and field without reproducing private strings. The measurement location may identify withheld local query evidence; its preserved reference key, parameter, method and value remain available.

`rc3_sanitized_baseline.json` records row hashes of the sanitized RC3 tables before AR Sco changes. The scientific check reverses only documented AR Sco changes and requires exact equality to this baseline for every unrelated field. It also verifies exact Gaia ID strings. Original RC3 validation, decisions, dictionary, presentation and change documentation are retained with `RC3_` prefixes as historical records; the current public documentation supersedes their old unselected AR Sco policy and local-path description.

## Remaining limitations

313 open RC3 review issues remain disclosed; model and counterpart disagreements are not all resolved. Heterogeneous radio states, bands and uncertainty conventions prevent a common detection threshold. Unresolved, uncorrected Gaia mean photometry cannot be interpreted as component photometry. Background cache historical query/selection was not recovered. One literature-coordinate fallback has only a published J2000 designation, requiring an explicit coarse ICRS-alignment approximation. Some reference URLs restrict automated access; dated RC3 checks are retained, not presented as fresh reachability checks. No persistent archive DOI exists; cite the repository and version with access date.

## Website/figure revision web r1 — 2026-09-29

Catalog data version remains 1.0.0. Adds the exact name expansion, concise source overviews with full evidence disclosures, larger full-width sky maps, and a separately labeled Gaia/SED LPT comparison. Main CMD distances, photometry and eligibility stay unchanged (56/58); sky stays 58/58. Original versioned data/figures, archive and v1.0.0 tag remain preserved. Original-paper analysis text clarifies the SED p16/p84 convention in new comparison provenance while retaining unchanged ledger wording. See CMD_AUDIT_WEB_R1.md. This website revision makes no new catalog preferred-distance selections.

## Website revision web r2 — 2026-09-29

Removes the supplementary LPT comparison from the main-page figure stack at the author’s request; all versioned formats, inputs and audit remain available in a named download disclosure. Renames the ambiguous “Rows” column to “Radio observations”, with a tooltip and catalog-reading explanation: counts include detection, marginal-signal and upper-limit observation records, not just detections. No data, figures, scientific selections or eligibility changes.

## Website revision web r3 — 2026-09-30

Adds a compact dog-and-white-dwarf SVG logo to the header and favicon; removes the redundant header subtitle. Removes the main-table WD-host column while retaining confidence in source details, the filter and unchanged downloads. Numeric property and measurement summaries use consistent symmetric ± or stacked asymmetric offsets, preserving interval/confidence conventions and component distinctions. Display precision follows recorded uncertainties; full evidence and exported values are unchanged. Scientific catalog version remains 1.0.0, with 58 sky systems and 56 CMD systems.

## Website revision web r4 — 2026-09-30

Rounds main-table orbital periods and distances to two decimal places for display; source precision, sorting inputs and downloads are unchanged. Reduces the default download area to system summary, radio observations, complete data archive, data dictionary and plotting methods. Additional evidence tables and audit documentation remain available in a closed native disclosure, alongside existing supplementary/historical downloads. No scientific data or figure changes.
