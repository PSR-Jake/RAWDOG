# RAWDOG scientific catalog

Public version **1.0.0**, prepared **2026-09-28**. A literature-curated catalog of radio observations and reported radio emission from white-dwarf systems and related candidates: 58 systems, 96 observation rows, 7,183 provenance records and 667 references. Membership, classifications and radio evidence are qualified and nonexclusive; this is not a complete or uniformly surveyed population.

[Website](https://PSR-Jake.github.io/RAWDOG/) · [Release decisions](docs/RELEASE_NOTES.md) · [Data dictionary](docs/DATA_DICTIONARY.md) · [Methods](docs/PLOTTING_METHODS.md) · [Validation](docs/VALIDATION_REPORT.md)

## Explore and download

The static website provides search, sorting, overlapping-class/host/radio filters, every observation row, selected properties, all alternatives, source methods, uncertainty conventions, references and unresolved issues. Figures: dual equatorial/Galactic Mollweide sky distribution (58 systems) and observed unresolved Gaia CMD (56 systems; two documented exclusions). Versioned CSVs and source-keyed plot inputs are in `data/v1.0.0/`; PDF/SVG/350-dpi PNG exports are in `figures/v1.0.0/`. The background is a retained density product, not hundreds of thousands of browser points.

## Reproduce

Python 3.12 or later; install `requirements.txt` in an isolated environment:

```sh
python -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
python scripts/build.py
python scripts/check.py
python scripts/package.py
python -m http.server 8000
```

The public snapshot and retained background density CSV suffice to regenerate figures and website evidence. The scientific check covers membership/joins, coordinates/wrapping/Galactic agreement, CMD formulas and reversed distance endpoints, exclusions, candidates/uncertainty conventions, rejected counterpart separation, exact ID strings, unrelated-field preservation and versioned products. To import a reviewed RC3 directory separately, run `python scripts/prepare_snapshot.py <rc3-directory>` before building; never run a legacy physical-property builder. To regenerate the background from the original local Gaia TAP cache, run `python scripts/background.py <cache.csv>`. Its actual hash/cuts and unknown original selection are recorded in the background provenance JSON.

GitHub Pages serves repository root `main` with `.nojekyll`; all project assets are relative and work under `/RAWDOG/`. No JavaScript library or remote CDN is required. JavaScript enables exploration; static figure/data/document downloads remain available without it.

## Citation

RAWDOG catalog, version 1.0.0, prepared 2026-09-28, https://github.com/PSR-Jake/RAWDOG (include access date). No DOI, author list or license has been assigned. Primary-source references retain their own bibliographic metadata; no paper PDFs are redistributed.
