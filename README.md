# RAWDOG — RAdio White Dwarf catalOG

Catalog data version **1.0.0**; website revision **web r2** (figure products: **web r1**). Public version **1.0.0**, prepared **2026-09-28**. A literature-curated catalog of radio observations and reported radio emission from white-dwarf systems and related candidates: 58 systems, 96 observation rows, 7,183 provenance records and 667 references. Membership, classifications and radio evidence are qualified and nonexclusive; this is not a complete or uniformly surveyed population.

[Website](https://PSR-Jake.github.io/RAWDOG/) · [Release decisions](docs/RELEASE_NOTES.md) · [Data dictionary](docs/DATA_DICTIONARY.md) · [Methods](docs/PLOTTING_METHODS.md) · [Validation](docs/VALIDATION_REPORT.md)

## Explore and download

The static website provides search, sorting, overlapping-class/host/radio filters, every observation row, selected properties, all alternatives, source methods, uncertainty conventions, references and unresolved issues. Figures: dual equatorial/Galactic Mollweide sky distribution (58 systems) and observed unresolved Gaia CMD (56 systems; two documented exclusions), with a separate Gaia/SED comparison of two LPT systems. The main CMD retains geometric distances. Concise source overviews disclose full evidence on expansion. Versioned CSVs and source-keyed plot inputs are in `data/v1.0.0/`; Current PDF/SVG/350-dpi PNG exports are in `figures/v1.0.0-web-r1/`; comparison inputs are in `data/v1.0.0-web-r1/`. Original `figures/v1.0.0/`, data, archive and tag remain immutable. [CMD audit](docs/CMD_AUDIT_WEB_R1.md). The background is a retained density product, not hundreds of thousands of browser points.

## Reproduce

Python 3.12 or later; install `requirements.txt` in an isolated environment:

```sh
python -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
python scripts/build.py
python scripts/check.py
python scripts/lpt_comparison.py
python -m http.server 8000
```

The public snapshot and retained background density CSV suffice to regenerate figures and website evidence. The scientific check covers membership/joins, coordinates/wrapping/Galactic agreement, CMD formulas and reversed distance endpoints, exclusions, candidates/uncertainty conventions, rejected counterpart separation, exact ID strings, unrelated-field preservation and versioned products. The default builder reads the frozen v1.0.0 plot inputs and writes revised figures only; it does not overwrite published tables, original figures or source bundles. `scripts/lpt_comparison.py` checks the new comparison and writes its versioned inputs/figures/checksums. Do not rerun the original `scripts/package.py` for this website revision: the 1.0.0 archive is preserved. To import a reviewed RC3 directory into a separate unpublished staging copy, run `python scripts/prepare_snapshot.py <rc3-directory>` before building; never run a legacy physical-property builder. To regenerate the background from the original local Gaia TAP cache, run `python scripts/background.py <cache.csv>`. Its actual hash/cuts and unknown original selection are recorded in the background provenance JSON.

GitHub Pages serves repository root `main` with `.nojekyll`; all project assets are relative and work under `/RAWDOG/`. No JavaScript library or remote CDN is required. JavaScript enables exploration; static figure/data/document downloads remain available without it.

## Citation

RAWDOG catalog, version 1.0.0, prepared 2026-09-28, https://github.com/PSR-Jake/RAWDOG (include access date). No DOI, author list or license has been assigned. Primary-source references retain their own bibliographic metadata; no paper PDFs are redistributed.
