# Radio and X-ray evidence — website web r10

Catalog data remains **1.0.2**. This website revision exposes existing frozen observations and measurement evidence; it does not adopt new preferred luminosities, change membership or recalculate scientific values. Original data, archives, source bundles and figure products remain unchanged.

## Table conventions

The radio column previews the first observation row in release order. The X-ray column previews the first available luminosity record in ledger order. “First of N records” identifies a preview, not a preferred estimate or source average. Selecting a value opens the corresponding source section, containing all recorded observations or luminosities with references and expandable methods. A dash means no recorded value, never zero. Additional X-ray flux records are identified where no luminosity is available.

Radio values retain their reported bands and µJy units. Peak brightness is explicitly distinguished from point flux density and labeled µJy beam⁻¹, as recorded by ILT M04345 and J1912 M07166 (mJy beam⁻¹ in the original ledger; the observation summaries already express the numbers in µJy); limits and source-specific marginal qualifications remain visible. The 96 observation rows contain 85 point-flux values, eight upper limits, two peak-brightness summaries and one missing flux. Thus 57 of 58 systems have a reported radio value or limit; GLEAM-X J0704−37 has no selected radio flux in its observation summary. No flux is promoted from an alternative measurement or averaged across frequencies/epochs.

X-ray values retain their recorded energy bands (including bolometric results), components, states, absorption/model assumptions and distances. These distances can differ from the geometric-distance column. No common X-ray band, confidence level, contemporaneous radio/X-ray observation or luminosity at the current catalog distance is implied. The emission columns are not numerically sortable because the entries are heterogeneous observations, limits, scalings and model components.

Magnetic CVs are a subtype of CVs. The concise class display therefore shows **mCV**, omitting the redundant CV parent when both tags occur. Raw catalog classifications and filter membership remain intact. Independent labels such as LPT and a proposed mCV interpretation remain overlapping and qualified.

## X-ray extraction and display

`scripts/emission_inputs.py` reads the immutable 1.0.2 tables and joins by exact source-ID strings. It extracts member records whose parameter names contain both `xray` and `luminosity`, excluding one dimensionless luminosity ratio. There are **58 luminosity/status records**, including **52 available values, limits or distance scalings in 26 systems** and six status-only records. The other 32 systems have no available luminosity in this release. Five text-only value records are explicitly identified by measurement ID: M00772, M02093, M02188, M04373 and M04374. Status text is not mistaken for a measurement.

All original ledger columns remain verbatim in the supplementary CSV and JSON. Additional display columns identify units, bands, distance context and limit semantics. Only the existing `10^30 erg s-1` unit is normalized to erg s⁻¹, using decimal arithmetic for the value and any recorded errors/endpoints. No flux-to-luminosity conversion, distance rescaling, absorption correction or confidence conversion is performed. Logarithmic luminosities remain explicitly logarithmic; distance scalings retain their normalization rather than becoming ordinary scalar luminosities. Display rounding leaves exported numbers unchanged.

Bands are extracted only from explicit keV ranges in the record or an explicit bolometric label. Otherwise the display says “band unspecified in record”; it does not assert that the original paper omitted a band. Distance labels quote a recorded paper/normalization distance and do not create a new distance selection. Full text remains available to distinguish model, epoch and absorption conventions.

Representative checks:

| Evidence | Required interpretation |
|---|---|
| AE Aqr M03056/M03061 | 4.5/5.2 × 10³⁰ erg s⁻¹, observed 0.1–3.5 keV, original 80 pc distance; not rescaled to 91.34 pc. |
| GLEAM-X M04490/M04491 | Power-law/blackbody upper limits at the discovery distance of 1.5 kpc. |
| GLEAM-X M04492/M04493 | Existing derived upper limits at the model-dependent 380 pc SED distance. Their parameter names explicitly identify upper limits despite blank raw limit flags. The new display treats their numbers as bounds, rather than detections with symmetric errors; raw flags, propagated errors and methods are preserved. This is a documented presentation correction, not a new luminosity calculation. |
| ILT J1101+5521 M04373/M04374 | Preserve the text-only distance-scaled limits and the separate approximately 300 pc SED interpretation; no substitution into the main Gaia CMD. |
| J191213.72−441045.1 M07159 | A stored value of 1.4 in units of 10³⁰ erg s⁻¹ displays as 1.4 × 10³⁰ erg s⁻¹. |
| V341 Ara M06586 | The conditional blackbody component remains log₁₀[Lₓ/(erg s⁻¹)] = 32.9, not 32.9 erg s⁻¹. |
| V1007 Her M02358; SU UMa M06209/M06210 | Preserve the (d/100 pc)² and (d/260 pc)² normalizations. |
| ASKAP J144834−685644 | Flux/model records alone do not supply a catalog luminosity or justify adopting a distance or unspecified integration band. |

AR Sco's separate radio-region 42.7 ± 0.2 G (MCSE) and approximately 15 MG WD polar field are unaffected. No rejected-counterpart evidence enters the emission columns. This revision reuses the audited bibliographic/evidence records; it does not claim a fresh re-reading of every original paper or completeness of X-ray coverage.

## Versioned products and reproduction

- [Source-keyed emission evidence JSON](../data/v1.0.2-web-r10/emission_evidence.json): all 58 member joins, 96 original radio rows and the extracted X-ray records.
- [X-ray luminosity evidence CSV](../data/v1.0.2-web-r10/xray_luminosity_input.csv): original ledger fields plus explicit display metadata.
- [SHA-256 checksums](../data/v1.0.2-web-r10/SHA256SUMS.txt).

These supplementary website inputs are separate from the unchanged 1.0.2 data archive. The original radio-observation CSV remains its authoritative download. Run:

```sh
python scripts/emission_inputs.py          # regenerate supplementary inputs
python scripts/emission_inputs.py --check # validate joins, units, limits and exact files
node scripts/check_presentation.js        # every source, table and display edge case
python scripts/check.py                   # existing catalog and figure checks
```

The emission check requires only the Python standard library. It checks every original X-ray field against the frozen ledger, reference joins and decimal unit conversions, with assertions for the cases above. The presentation check verifies all 58 eleven-column rows, six numeric sorts, nonredundant class labels, consistent source sections, limits/logs/scalings and preservation of the original data.
