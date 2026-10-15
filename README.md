# RAWDOG — RAdio White Dwarf catalOG

Catalog data version **1.0.2**; website revision **web r11**. Public version **1.0.2**, prepared **2026-10-01**. A literature-curated catalog of radio observations and reported radio emission from white-dwarf systems and related candidates: 58 systems, 96 observation rows, 7,175 provenance records and 669 references. CHIME/ILT J1634+44 was withdrawn from active membership because its nature and white-dwarf interpretation are unclear; previous snapshots are retained. Membership, classifications and radio evidence are qualified and nonexclusive; this is not a complete or uniformly surveyed population.

[Website](https://PSR-Jake.github.io/RAWDOG/) · [Release decisions](docs/RELEASE_NOTES.md) · [Data dictionary](docs/DATA_DICTIONARY.md) · [Methods](docs/PLOTTING_METHODS.md) · [Validation](docs/VALIDATION_REPORT.md)

## Explore and download

The static website provides search, sorting, overlapping-class/host/radio filters, every observation row, selected properties, all alternatives, source methods, uncertainty conventions, references and unresolved issues. Figures: dual equatorial/Galactic Mollweide sky distribution (58 systems) and observed unresolved Gaia CMD (56 systems; two documented exclusions), with a separate Gaia/SED comparison of two LPT systems. The main CMD retains geometric distances. Concise source overviews disclose full evidence on expansion. Versioned CSVs and source-keyed plot inputs are in `data/v1.0.2/`; Current PDF/SVG/350-dpi PNG exports are in `figures/v1.0.2/`; comparison inputs are in `data/v1.0.0-web-r1/`. Original `figures/v1.0.0/`, data, archive and tag remain immutable. [CMD audit](docs/CMD_AUDIT_WEB_R1.md). The background is a retained density product, not hundreds of thousands of browser points.

The compact dog-and-white-dwarf [SVG logo](assets/logo.svg) is used in the header and favicon. Main-table periods and distances display two decimal places; sorting, source evidence and exports retain stored precision. Common downloads stay visible; additional tables and audit documentation are collapsed. Host confidence remains in each source detail and the host filter; the main table omits its separate column.

The open system-parameter table shows all matching systems without pagination: exact Gaia DR3 IDs, compact nonexclusive classifications, distance, distinct orbital/spin/radio-recurrence periods, radio flux density, X-ray luminosity, WD photospheric temperature, WD mass and companion spectral type. The concise class display uses mCV without its redundant CV parent; original tags and filter membership remain unchanged. Existing range-only and bound-only constraints remain explicit rather than becoming invented central values. Parameter columns sort using raw values, with missing/range-only entries last in either direction. Mobile readers can scroll horizontally while source names stay visible; filtered CSV exports retain the complete unrounded summaries.

The emission columns preview the first recorded observation or available luminosity, with band and distance context and direct links to all source evidence. They are not source averages or newly preferred luminosities, and are not numerically sortable across heterogeneous bands, epochs, models and limits. The frozen ledger supplies 52 available luminosity/limit/scaling records in 26 systems; other entries remain missing or flux-only. No luminosities are calculated or rescaled to catalog distances. [Emission methods and qualifications](docs/EMISSION_COLUMNS_WEB_R10.md); supplementary source-keyed inputs and checksums are in `data/v1.0.2-web-r10/`.

Every source detail follows the same order: source overview, selected properties and periods, CMD placement, radio observations, X-ray luminosity, then evidence and references. Selected properties use compact quantity/value rows with units and brief qualifications; full components, uncertainty conventions, methods, assumptions and evidence IDs are under “Property notes & uncertainty conventions.” Observations share labeled band, flux/limit, observable, radio-evidence, uncertainty and reference rows. X-ray records retain distinct models, components, states, limits, historical distances and logarithmic/scaled units, with full methods expandable. Missing selections are explicit without empty property rows; all detailed evidence remains available.

## Reproduce

Python 3.12 or later; install `requirements.txt` in an isolated environment:

```sh
python -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
python scripts/build.py --version 1.0.2
python scripts/check.py
python scripts/package.py --version 1.0.2
python -m http.server 8000
```

For the presentation check (Node.js, no dependencies), run `node scripts/check_presentation.js`. Regenerate supplementary emission inputs with `python scripts/emission_inputs.py`; validate their frozen evidence joins and exact products with `python scripts/emission_inputs.py --check` (standard library only).

The public snapshot and retained background density CSV suffice to regenerate figures and website evidence. The scientific check covers membership/joins, coordinates/wrapping/Galactic agreement, CMD formulas and reversed distance endpoints, exclusions, candidates/uncertainty conventions, rejected counterpart separation, exact ID strings, unrelated-field preservation and versioned products. The versioned builder reads frozen plot inputs and writes figures only; it does not overwrite published tables, original figures or source bundles. The earlier LPT comparison and 1.0.0 archive remain preserved. Use the explicit `--version 1.0.2` option when packaging this withdrawal. To import a reviewed RC3 directory into a separate unpublished staging copy, run `python scripts/prepare_snapshot.py <rc3-directory>` before building; never run a legacy physical-property builder. To regenerate the background from the original local Gaia TAP cache, run `python scripts/background.py <cache.csv>`. Its actual hash/cuts and unknown original selection are recorded in the background provenance JSON.

GitHub Pages serves repository root `main` with `.nojekyll`; all project assets are relative and work under `/RAWDOG/`. No JavaScript library or remote CDN is required. JavaScript enables exploration; static figure/data/document downloads remain available without it.

## Citation

RAWDOG catalog, version 1.0.2, prepared 2026-10-01, https://github.com/PSR-Jake/RAWDOG (include access date). No DOI, author list or license has been assigned. Primary-source references retain their own bibliographic metadata; no paper PDFs are redistributed.
