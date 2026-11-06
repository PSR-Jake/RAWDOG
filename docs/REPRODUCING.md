# Reproduce RAWDOG

Run the following commands from the repository root.

Python 3.12 or later; install `requirements.txt` in an isolated environment:

```sh
python -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
python scripts/build.py --version 1.0.2
python scripts/check.py
python scripts/cmd_revision.py --check
python scripts/package.py --version 1.0.2
python -m http.server 8000
```

Regenerate only the current CMD inputs/exports with `python scripts/cmd_revision.py`; the original 1.0.2 tables, figures and source bundles remain unchanged.

For the presentation check (Node.js, no dependencies), run `node scripts/check_presentation.js`. Regenerate supplementary emission inputs with `python scripts/emission_inputs.py`; validate their frozen evidence joins and exact products with `python scripts/emission_inputs.py --check` (standard library only).

The public snapshot and retained background density CSV suffice to regenerate figures and website evidence. The scientific check covers membership/joins, coordinates/wrapping/Galactic agreement, CMD formulas and reversed distance endpoints, exclusions, candidates/uncertainty conventions, rejected counterpart separation, exact ID strings, unrelated-field preservation and versioned products. The versioned builder reads frozen plot inputs and writes figures only; it does not overwrite published tables, original figures or source bundles. The earlier LPT comparison and 1.0.0 archive remain preserved. Use the explicit `--version 1.0.2` option when packaging this withdrawal. To import a reviewed RC3 directory into a separate unpublished staging copy, run `python scripts/prepare_snapshot.py <rc3-directory>` before building; never run a legacy physical-property builder. To regenerate the background from the original local Gaia TAP cache, run `python scripts/background.py <cache.csv>`. Its actual hash/cuts and unknown original selection are recorded in the background provenance JSON.

GitHub Pages serves repository root `main` with `.nojekyll`; all project assets are relative and work under `/RAWDOG/`. No JavaScript library or remote CDN is required. JavaScript enables exploration; static figure/data/document downloads remain available without it.

[Project guide](../PROJECT_GUIDE.md) · [README](../README.md)
