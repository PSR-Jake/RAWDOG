# RAWDOG 1.0.1 publication validation

Prepared 2026-09-30. The runnable check is `python scripts/check.py`; its current result is recorded in `scientific_check.json`. The addition-specific assertions cover the 109 evidence records, references, established CV host, candidate polar, distinct orbital and radio clocks, posterior uncertainty convention, integrated continuum versus burst flux, missing model-derived scalar selections, radio position, five open issues and source-bundle joins. All pre-existing catalogue rows retain their documented RC3/public values.

Sky coverage: 59/59 (57 native Gaia and two literature radio positions). CMD coverage: 56/59; ASKAP J144834-685644 joins the two existing documented exclusions because no secure Gaia counterpart, complete Gaia photometry or adopted distance is available. Radio-region and WD-polar selected coverage remain 22 and 3 respectively. Both newly supplied paper links returned HTTP 200 on 2026-09-30; historical checks retain their original dates. Private paths are sanitized and paper PDFs are not redistributed.

This validates public data consistency, not population completeness or the unresolved scientific interpretations. Historical validation below applies to the original 1.0.0 release only; the temporary 1.0.1 research exporter was used to obtain addition rows and does not establish a new RC3 validation result.

# RAWDOG 1.0.0 publication validation

Status: **PASS**. Prepared 2026-09-28.

The RC3 exporter was rerun to a temporary output directory against the audited root masters, with the retained dated reference checks; every RC3 CSV reproduced byte-for-byte and the full structural validation passed. The original RC3 regression check passed, including observation/error associations, epoch/band metadata, period separation, intervals and candidate policies. Original RC3 expects AR Sco fields blank; this historical assertion applies only to RC3. The public scientific check instead verifies accepted M07011/M07014 selections and exact reversibility of their documented summary changes.

Public check: `python scripts/check.py`. Membership, unique keys, observation/source joins, all 74 excluded-counterpart records, exact Gaia identifier strings, unchanged radio evidence distribution, candidate/overlap preservation, AR Sco MCSE and field-component separation, and all unrelated sanitized RC3 fields passed. Available audited Galactic comparisons passed; see `scientific_check.json` for counts and maximum residual. Coordinate ranges, seam/direction tests, source-keyed CMD formulas, finite values, reversed distance endpoints, supported distance evidence and explicit exclusions passed.

58 / 58 sky systems (57 native Gaia positions and one literature fallback), no exclusions. 56 / 58 CMD systems; CHIME/ILT J1634+44 and ASKAP J174508.9-505149 excluded with source-specific reasons. Selected radio-region-field coverage is 22 / 58, increased from 21 by AR Sco; selected WD-polar coverage is 3 / 58, increased from 2. Preferred catalog distances remain 50 / 58; six plot-specific geometric posterior adoptions give 56 CMD inputs. No old coverage count is forced onto this release.

Reference reachability results retain their original dated checks; no blanket claim of newly tested external links. Private paths were sanitized with a per-field log, and paper PDFs/private proposal material are absent. Scientific checks cannot establish completeness, settle all model disputes or recover an unknown historical Gaia cache query. Review issues remain documented, not silently resolved. Browser/deployment verification is recorded separately in VERIFICATION.md.


## Web r1 audit

The 2026-09-29 revision changes presentation and adds an evidence-linked LPT method comparison; it makes no catalog-data selection changes. The original check, RC3 regression and temporary RC3 export/validation passed again. The comparison check independently audits all 56 main-CMD photometry/distance joins, checks four source/method rows, exact Gaia strings, retained ILT alternatives, nonlinear distance endpoints and interactive SVG joins. See CMD_AUDIT_WEB_R1.md and VERIFICATION.md. Original v1.0.0 products and tag are retained.
