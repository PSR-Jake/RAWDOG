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
