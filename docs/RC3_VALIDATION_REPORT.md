# RAWDOG release validation

Status: **PASS**  
Package: **1.0.0-rc3**  
Date: **2026-09-28**

## Checks

- PASS — 58 unique member systems and source IDs
- PASS — summary membership exactly matches the audited checklist
- PASS — 96 unique radio-observation rows
- PASS — 84 point fluxes and the peak, range, upper-envelope, missing, and upper-limit products remain distinct
- PASS — radio observations use readable evidence labels with no unclassified rows
- PASS — abstract-only or inaccessible original sources never receive an unqualified original-text label
- PASS — two-sided bounds retain range or interval labels
- PASS — 7,183 unique measurement/provenance records
- PASS — 667 unique reference keys and IDs
- PASS — 321 review records, including 313 open issues
- PASS — public review table uses plain-language status fields
- PASS — 74 rejected MM Hya records remain outside the member summary
- PASS — review issue source IDs join to members or the excluded counterpart
- PASS — rejected counterpart absent from member table
- PASS — all observations join to the matching summary source name and ID
- PASS — AE Aqr WD spin is selected from its timing record, not its thesis-only radio-recurrence candidate
- PASS — summary observation counts and IDs match the observation table
- PASS — measurement membership flags separate members and rejected counterpart
- PASS — member and excluded measurement source IDs join to the correct population
- PASS — every observation links to at least one measurement record
- PASS — all observation measurement IDs resolve
- PASS — selected observation values match; uncertainties agree or a qualified difference and its convention are disclosed
- PASS — catalog audit dates do not exclude matching records with established Semester 18A observing epochs
- PASS — VV Pup X and K evidence stays attached to the matching band-specific observation
- PASS — Stokes-I method, semester, date/state qualification, and uncertainty convention survive band-scoped export
- PASS — observation limit flags, point values, and withheld thresholds agree
- PASS — radio values are finite and uncertainty magnitudes are non-negative
- PASS — all 83 unambiguous reported flux/error pairs and other parsed radio values match audited catalog inputs
- PASS — every withheld radio numeric value has an explicit reason
- PASS — measurement reference keys resolve to the reference manifest
- PASS — summary and observation reference keys resolve
- PASS — all repaired local reference paths resolve inside the project
- PASS — every active public reference URL has a link-check record
- PASS — measurement uncertainties without a source convention remain explicitly unspecified
- PASS — numeric value, uncertainty, and limit columns parse as numbers
- PASS — measurement error magnitudes are non-negative and two-sided bounds are ordered
- PASS — numeric measurement records have units
- PASS — numeric measurement records have a recorded method
- PASS — numeric measurement records have a reference key
- PASS — all measurement bounds have an explicit limit_type
- PASS — Gaia DR3 identifiers remain exact decimal strings
- PASS — summary Gaia IDs exactly match the audited master strings
- PASS — physical-property, Gaia, and source-reference tables join to all 58 members
- PASS — numeric summary values are finite and parse as numbers
- PASS — selected summary numbers match the linked source, component, unit, and reference records
- PASS — selected summary intervals match linked source text or bounds, component, unit, and references
- PASS — summary bounds retain source-derived interval labels, supporting IDs, references, and stated meaning
- PASS — selected companion spectral types match component-specific measurements and references
- PASS — selected summary values link to supporting measurement IDs
- PASS — every unselected summary scalar has a documented status and reason
- INFO — numeric measurements: 4897; derived numeric records: 427
- INFO — uncertainty magnitudes: 2811; conventions unspecified: 1000
- INFO — bounded records: 397
- INFO — radio parsed quantity types: {'Point flux density': 84, 'Upper limit': 8, 'Peak-brightness upper envelope': 1, 'Peak-brightness range': 1, 'Missing': 1, 'Peak brightness': 1}
- INFO — radio evidence labels: {'Reported detection; significance not harmonized': 63, 'Marginal reported signal': 5, 'Reported flux; significance not harmonized': 17, 'Secure reported detection': 3, 'Upper limit': 8}
- INFO — selected summary coverage: geometric distance 50/58; orbital period 53/58; WD spin period 12/58; IP beat period 4/58; radio recurrence period 2/58; WD photospheric temperature 19/58; WD mean photospheric field 6/58; WD polar field 2/58; WD local emission-region field 9/58; WD mass 12/58; companion spectral type 28/58; companion mass 18/58; companion temperature 10/58; radio-emission-region field 21/58
- INFO — reference-path repair states: {'local path verified': 483, 'repaired to existing file': 8, 'no local path supplied': 171, 'no usable local file: external temporary path omitted': 1, 'no usable local file: removed mismatched local file': 1, 'no usable local file: description, no local file': 3}
- INFO — selected public-reference link states: {'Automated access restricted': 137, 'Reachable in automated check': 522, 'Not verified; connection error': 3, 'No HTTP citation URL in manifest': 5}
- INFO — external URL reachability: {'restricted_to_automated_check': 277, 'reachable': 572, 'connection_error': 17, 'not_found': 8, 'http_error': 2, 'server_error': 1}
- INFO — summary values are evidence-linked source results; period-unit conversions scale recorded errors and record their input and factor.
- INFO — RC2 URL-check results were reused because no reference URL changed in this pass.
- INFO — audited master SHA-256: rawdog_catalog.csv=16290d10d70dadc1eb1d95e8c3f0bb4b0b66710229676d46408fbd7c98cc3440; rawdog_measurements.csv=153f802c592c63729c8a981fdef2876875b8b6012edb071f3c976fe8ae9272cc; rawdog_physical_properties.csv=9c57f202cdc8e14c3329e3d6761194d67b50de1bb7d6efc0d0142d3fde700fa4; rawdog_gaia_counterparts.csv=9393db53976ec0e5afd98db891c5717d96c150999dcce95b0a268525111ad9f3; rawdog_source_references.csv=764ceeb73622693b9d2f488623fe51c0f11a5dd42789d9e1d3880952eb360dcf; rawdog_reference_manifest.csv=40dcd809ce35ba12519477064aa5669f213b47ef598ce9607019cd8da736c58d; rawdog_review_queue.csv=5b7677e28803c9b93b71207b40c2b9a083e2c45afbcfe32912f92db17d68bfef; rawdog_source_audit_checklist.csv=3e3c038498e9d1194c0c9b2150afcdf6dc006d7e24ceba62c7b3b59c86ee948a; rawdog_data_dictionary.md=32a772d94a3f7d9456da22c3da4afd8033c5afd9808c6d0fe53baf93931494e0; rawdog_source_audit_notes.md=5354f8e2b42806ea3034d14607fb0af9e2361f17a81af3c7c5e1f63155c70e2e
- INFO — all 58 checklist sources are complete with unresolved review items disclosed.

## Interpretation

These checks validate radio parsing and observation links, measurement-label semantics, summary-to-measurement support, table structure, numeric parsing, joins, units, limit flags, reference resolution, exact Gaia ID strings, and rejected-counterpart separation. They do not resolve the author presentation choices listed in RELEASE_DECISIONS.md. A link blocked to automated requests is not counted as a confirmed dead citation.
