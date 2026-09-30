# RAWDOG 1.0.1 public data dictionary

All files are UTF-8 CSV. Blank fields mean no selected or reported value in that field; they do not mean zero. Text from audited source records may still contain strings such as “not reported” or “NA”. The summary cleans explicit NA-like Gaia-ID sentinels to blank while preserving accepted Gaia IDs as exact decimal strings.

## Table relationships

| Table | Rows | Key and relationship |
|---|---:|---|
| rawdog_source_summary.csv | 59 | One row per member; primary key source_id. |
| rawdog_radio_observations.csv | 97 | Primary key observation_id; source_id joins to the summary. |
| rawdog_measurements.csv | 7,292 | Version-scoped measurement_id; source_id joins member rows to the summary. Includes 7,218 members and 74 excluded MM Hya counterpart records. |
| rawdog_references.csv | 669 | Preserves existing reference key and manifest ID. Other tables join through reference keys; reference_ids are manifest IDs. |
| rawdog_physical_properties.csv | 59 | Audited compatibility fields plus source_id. |
| rawdog_gaia_counterparts.csv | 59 | Audited counterpart fields plus source_id. Gaia source IDs are text. |
| rawdog_source_references.csv | 59 | Source-level reference lists plus source_id. |
| rawdog_review_issues.csv | 326 | issue_id identifies the review row; optional source_id joins to a member or excluded counterpart. |
| rawdog_excluded_counterparts.csv | 1 | Identity-audit index; its measurement_ids join to the measurement ledger. |
| rawdog_reference_link_checks.csv | Generated | One row per unique URL checked on the stated date. |

source_id is `gaia-dr3:<decimal Gaia DR3 source ID>` for accepted Gaia matches and `name:<lowercase-hyphenated name>` when no secure Gaia identifier is assigned. Do not convert Gaia IDs to numbers; some exceed exact floating-point precision. observation_id follows the source catalog row order. measurement_id follows the audited measurement-ledger row order for this release build. These row-generated IDs are stable within this version but are not promised across releases; source_id and existing reference keys are the durable joins.

## Classification and membership

- **catalog_class_code** preserves the audited legacy bin.
- **observational_class** is a broad readable class. Both magnetic and non-magnetic CV codes display as “Cataclysmic variable”; the magnetic distinction is separate.
- **classification_labels** is a semicolon-separated set of machine-readable tags and can overlap. A magnetic-CV tag follows the audited class bin; it does not by itself mean that the magnetic subclass is secure. ASKAP J174508.9-505149 carries both long-period-transient and magnetic-CV tags because both interpretations are in the audit.
- **magnetic_subclass_or_status** and **published_subclass_labels** preserve the audited subclass wording, including “candidate”, “disputed”, or “unconfirmed”.
- **proposed_or_disputed_interpretation** exposes the qualified interpretation text where it matters.
- **white_dwarf_host_confidence** is established, inferred_or_proposed, or unresolved. The adjacent evidence field explains its basis. It describes host identity, not radio-detection confidence.
- In the measurement ledger, **source_membership** is Member, Excluded rejected counterpart; identity audit only, or Nonmember record. MM Hya is not a member summary row.

The catalog contains literature-selected detections, marginal signals, and explicit upper-limit observations for audited systems and related candidates. It is not an exhaustive or statistically complete sample. CVs, white-dwarf pulsars, and long-period transients are not asserted to form one sequence.

## Radio observations

- **radio_band_ghz_as_reported** retains the source catalog band value. Exact sub-bands and frequencies remain in linked measurement rows.
- **reported_flux_text** preserves the original summary string. **flux_quantity_kind** identifies point flux density, peak brightness, a range, an upper envelope, an upper limit, missing text, or an ambiguous compound statement. Parsed **flux_density_uJy**, **error_minus_uJy**, and **error_plus_uJy** are in microjanskys; symmetric and asymmetric errors are non-negative magnitudes.
- **upper_limit_uJy** is separate from flux density. **is_upper_limit** is a lowercase true/false flag. **reported_range_lower_uJy** and **reported_range_upper_uJy** preserve true intervals; peak-brightness values and ranges use their own columns. **numeric_value_withheld_reason** explains why any numeric value was not promoted. A marginal measurement is not an upper limit.
- **flux_uncertainty_convention** carries the linked source convention or a catalog-note convention when the displayed value uses a stated compilation floor. If the value matches but a reported error differs from the linked source record, **measurement_link_basis** qualifies that association and the applicable convention is retained. If no convention is specified, the field says so; never assume an unspecified error is 1σ. The detailed ledger retains the raw uncertainty_convention text.
- **flux_method_and_state** carries the linked observable's method and observing state, including Stokes-I and peak-brightness records when applicable. Band and established observing-epoch clauses are scoped to the displayed observation; unspecified exact dates or states remain explicitly unspecified.
- **radio_evidence_label** is Secure reported detection, Marginal reported signal, Upper limit, Reported detection; significance not harmonized, or Reported flux; significance not harmonized. These labels follow source wording and evidence; they do not impose a uniform significance threshold.
- **circular_polarization_as_reported** preserves the catalog value/string without forcing a phase-dependent or epoch-dependent measurement into one normalized statistic. Stokes I, V, linear polarization, and their limits remain separate measurement rows.
- **radio_reference_keys**, **radio_reference_ids**, **measurement_reference_keys**, and **measurement_ids** provide the evidence joins. **measurement_link_basis** states whether the displayed observable, value, uncertainties, and available descriptors match the cited record, or whether the evidence supports only a qualified source/reference link.
- In the summary, **radio_detection_labels** is a semicolon-separated filter field; **radio_detection_status** gives readable counts by label across the system’s observation rows.
- **epoch_band_state_and_other_notes** preserves the audited observation notes.

The observation table represents 96 source-catalog rows, not every integration or time bin. Additional epochs, bands, Stokes products, polarization limits, variability, and state information appear as distinct rows in the measurement ledger.

Observation epochs are taken from structured epoch/state fields or text that identifies an observing date, MJD, or semester. Semester years, ISO dates, and MJDs are normalized before matching; an MJD unit may carry through an associated list of observing epochs. Audit, research, publication, compilation, astrometric reference, and explicitly conflicting prose dates do not constrain observation matching. Unknown epochs remain unknown.

## Measurements and provenance

rawdog_measurements.csv preserves the audited ledger columns and adds release IDs, membership tags, readable evidence/limit/uncertainty labels, reference IDs, and unresolved-reference keys. The main numeric fields are **value_numeric**, **error_minus**, **error_plus**, **lower_bound**, and **upper_bound**. Numeric uncertainties and bounds use the row’s **unit**. Error values are magnitudes; the **uncertainty_convention** field states what the source means. Blank means unspecified, not Gaussian and not 1σ. Bounds require **limit_type**; **public_limit_label** renders upper/lower bounds and intervals plainly.

Direct measurements, paper-reported model estimates, adopted assumptions, derived quantities, and searched-but-not-found values are distinguished by **method**, **assumption**, **is_derived**, **derived_from**, **adoption_reason**, **verification_status**, **location**, and **value_text**. The **evidence_label** is a human-readable summary, not a replacement for those fields. No ledger value is automatically a preferred value.

Temperatures are identified by their parameter/component and method: WD photosphere, hot spot/accretion region, X-ray plasma, unresolved source, or Gaia single-star pipeline values must not be interchanged. Magnetic fields remain labeled by photosphere, pole, accretion region, or radio-emitting plasma. A radio-plasma field is not a WD surface field.

Flux and luminosity have distinct parameter names and units. Preserve the stated energy band, frequency, absorption convention, conversion model, epoch, and source state in the measurement fields and notes. An approximate converted flux is not a source-specific spectral fit. Observed photometry is not extinction-corrected unless the measurement says so; Gaia DR3 mean magnitudes in the summary are unresolved system light.

## Summary values

Fields beginning **preferred_** are populated only when the audited interpretation and evidence support a scalar and the release builder can link it to a measurement ID. Competing results remain in the ledger. A blank preferred field has an adjacent **status** and **note** explaining why no value was selected.

- **preferred_distance_pc** uses a uniquely adopted geometric posterior row from the ledger. Its asymmetric errors and uncertainty convention remain separate; it is not inverse parallax.
- **preferred_orbital_period_h**, **preferred_wd_spin_period_s**, **preferred_ip_beat_period_s**, and **preferred_radio_recurrence_period_s** are separate clocks. The builder matches the audited value, reference, and reported precision across supported units; any conversion scales recorded errors by the same factor and documents the input and method. Unmatched or ambiguous compatibility scalars are withheld.
- A radio-recurrence scalar is selected only when one direct, non-candidate record is unique; candidate and pulse-modulation records stay in the measurement ledger.
- WD temperatures and magnetic fields are selected property by property. Separate summary fields identify WD photospheric temperature, mean photospheric field, polar field, local emission-region field, and radio-emission-region field. Values retain component, method, uncertainty or bounds, references, and measurement IDs; model-dependent selections are qualified. Summary **limit_type** labels identify reported, allowed, model, or confidence ranges when the source establishes that meaning. A range is not treated as a censored value or assigned a Gaussian/1σ convention. A best-fit scalar may remain beside its separately supported range. Unresolved conflicts remain blank with a source-specific reason.
- **preferred_wd_mass_msun**, **preferred_companion_spectral_type**, **preferred_companion_mass_msun**, and **preferred_companion_teff_k** expose supported component properties with their methods and qualifications. Alternatives and non-unique model examples remain in the measurement ledger.
- **source_reference_keys** joins to the preserved reference keys. **radio_observation_ids** and **measurement_ids_for_detail** link the system to its detailed records.

## Gaia coordinates and photometry

Gaia DR3 identifiers are exact decimal strings. Summary RA and Dec are degrees in ICRS at the Gaia DR3 reference epoch J2016.0. Propagated ICRS epoch-2000 coordinates in the source tables are a different product and are not FK5. The three summary Gaia magnitudes are observed mean system photometry, unresolved and not extinction-corrected; magnitude uncertainties are preserved separately. Missing or disputed matches have no numeric Gaia ID.

## References and paths

Public snapshot policy: local filesystem fields are blanked and embedded private artifact paths are redacted. The historical RC3 description below applies only to the original research release; local files are not included. Public sanitization records and summary changes are versioned alongside the CSVs.


Existing **key** values are preserved. **public_reference_url** selects a reachable stable link, DOI, or download URL, preferring that order; restricted links are retained with a note. **public_reference_link_status** and **public_reference_link_role** state the check result and chosen link type. **release_link_repair_note** explains any release-copy DOI or stable-link correction; **original_doi**, **original_stable_link**, and **original_download_url** preserve the supplied values. **local_path** is a corrected project-relative path when a verified local file or directory exists. **original_local_path**, **local_path_status**, and **local_path_candidates** preserve the path audit trail; local files are not copied into this release directory. A restricted automated URL check does not establish that a citation is dead.

## Review issues

**issue_state** is Open or Resolved. **public_status** describes the next action in plain language, without exposing the internal audit-status vocabulary. Open issues do not imply that a source audit is incomplete. They mark evidence, interpretation, access, or user-judgment questions that remain documented.

## Publication plot inputs and AR Sco selection

`sky_plot_input.csv` and `cmd_plot_input.csv` join through exact source_id strings; every member has an inclusion flag and exclusion reason. The CMD table records uncorrected mean photometry, exact evidence IDs, adopted geometric distance, nonlinear magnitude bounds, approximate color uncertainty, method and qualifications. See PLOTTING_METHODS.md.

AR Sco preferred radio-emission-region field is 42.7 ± 0.2 G (MCSE; not a physical confidence interval), distinct from the approximately 15 MG inferred WD polar field. Both are model-derived selections. Original abstract 43 MG and alternative model results remain in the measurement ledger. See RELEASE_NOTES.md and summary_changes.json.
