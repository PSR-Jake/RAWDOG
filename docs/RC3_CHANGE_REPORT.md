# RC2 to RC3 change report

RC3 is a separate release directory. RC1 and RC2 remain unchanged reviewed snapshots. The audited root files remain the editing authority; this pass changes the shared exporter, generated tables, documentation, and checks.

## Export corrections

- Observation epochs are normalized across semester notation, ISO dates, and MJD lists. Audit, research, publication, compilation, Gaia reference, and explicitly conflicting prose dates do not constrain an observation match. This restores QS Vir's Table 2 dates and prevents J1955+0045's 2026-09-24 catalog audit date from excluding its Semester 18A measurement.
- Observation links now require the matching cited reference, observable/Stokes component, band, available established epoch, value, and reported errors, with unit and printed-precision conversions. J1955+0045 R0038 now links to Barrett+20 M02798 (79±5 μJy); Ridder+23 M02802 (79±8 μJy) remains available in the measurement ledger as a compilation alternative. Point-flux rows may link to Stokes-I image-peak records when that is the underlying product; the point/peak label remains explicitly qualified.
- Radio method, observing state, and uncertainty conventions are selected from the linked observable, including Stokes-I and applicable image-peak records. Metadata is scoped by band and established epoch. VV Pup R0009 and R0011 link to M05358 and M05365 with their VLA method, Semester 13B, unspecified exact date/state, and unspecified confidence convention retained. All 84 point-flux rows now carry available method/state metadata; no Stokes-V, RR/LL, unrelated-band, or compilation-alternative metadata is borrowed.
- Ten two-sided summary bounds now have source-derived interval labels, IDs, references, and stated meaning. Tau 4 retains 7250 K beside its separately supported 7000–7750 K allowed range; HU Aqr and FL Cet retain model ranges. The 143 two-sided detailed-ledger intervals remain labeled and unchanged.
- SS Cyg R0075 links its 810 μJy value to the matching MJD 55308.47 record M06866. The exported 81 μJy uncertainty is the catalog's stated Ridder+23 minimum 10% floor, while M06866 retains Russell+16's 30 μJy statistical error. The link is qualified, the two uncertainties are not called an exact match, and the catalog-note convention remains in the observation export.
- Two evidence-label counts shift because the previously unmatched, unit-normalized Stokes-I records expose source wording that calls EQ Cet and SU UMa detections. No flux, uncertainty, summary scalar, or detailed-ledger numeric value changed.

## Preserved output and verification

- Membership, observations, quantities, and exclusions remain 58 systems, 96 observations, 83 ordinary flux/error pairs, 84 point-flux exports, the same special peak/range/envelope/missing products, 7,183 ledger rows, and 74 rejected-counterpart records outside the member summary.
- A row-keyed comparison found no changed numeric cells or uncertainties across 19,441 numeric fields in the summary, observation, and measurement exports. The ten audited input hashes match the RC2 build report. RC2 URL-check results were reused because no URLs changed.
- All 50 builder validation checks pass. The runnable regression check passes the audit-date, R0038, VV Pup metadata, QS Vir epoch/band, summary-interval, and existing parser/selection cases. The same targeted assertions fail against RC2's generated tables for the demonstrated R0038 association, missing VV Pup metadata, and eight unlabeled two-sided summary bounds.
- The four author presentation defaults remain documented in RELEASE_DECISIONS.md: CHIME/ILT J1634+44 membership; Hya 1 and other marginal-report wording; ASKAP's overlapping transient and magnetic-CV labels; and AR Sco's field-unit discrepancy.

The remaining release review work is those four author decisions and the already-disclosed open evidence/access issues. The SS Cyg error-convention difference is explicitly sourced and qualified; no unqualified exporter defect remains in this pass.
