# CMD figure revision web r13 — 2026-10-18

The author requested removal of the persistent GLEAM-X J0704−37 annotation and use of the latest paper's distance for that source's CMD placement. This supersedes the earlier all-geometric CMD policy **for this one plot input**. Catalog data stays **1.0.2**; membership, summary selections, astrometry, radio/X-ray evidence and original products remain unchanged. The revised CMD still plots 56 of 58 systems.

## Adopted evidence and calculation

[Rodriguez et al. (2026), arXiv v2, revised 18 August 2026](https://arxiv.org/html/2604.18688v2), section 2.3 and Table 2, adopts **380±10 pc** for GLEAM-X J0704−37. Section 3 identifies posterior medians and p16/p84 credible intervals. This reproduces the earlier [Rodriguez (2025)](https://arxiv.org/html/2501.03315v2) spectrum fit and the frozen ledger record **M04418**. The interval convention supplements the ledger's original unspecified-level wording, which remains in a separate column. The fit depends on WD/M-dwarf atmospheres, donor-radius/isochrone and dust assumptions; it is not a precise Gaia parallax distance.

The unchanged counterpart is Gaia DR3 **5566254014771398912**. The unchanged unresolved, observed Gaia photometry is G=20.784512, BP=21.268938 and RP=19.417715 mag (M04413–M04415). Neither component model magnitudes nor extinction-corrected photometry are substituted.

| Input or result | Previous CMD | Current CMD |
|---|---:|---:|
| Distance evidence | M04422, Gaia geometric posterior | M04418, published spectrum/SED fit |
| Distance (pc) | 3010.02051 | 380 |
| Recorded distance endpoints (pc) | 1565.90601–6045.20801 | 370–390 |
| Observed BP−RP (mag) | 1.851223 | 1.851223 |
| Absolute G (mag) | 8.391665 | 12.885594 |
| Magnitude endpoints at fixed G | 6.877456–9.810684 | 12.829189–12.943503 |

`M_G = G + 5 − 5 log10(d/pc)`. Larger distance gives smaller/brighter M_G, so the distance endpoint order reverses. Rounded published distance offsets recover the 370/390 pc endpoints; these posterior endpoints are not Gaussian magnitude errors or a joint photometry/distance confidence region. The G error remains separate. The existing approximate BP−RP error uses independent BP/RP error quadrature; no covariance/variability model is introduced. Brighter magnitudes remain above.

Only the GLEAM-X distance-related CMD fields change. All 57 other input rows, including ILT's geometric placement and the two ASKAP exclusions, preserve every original field. No uncertainty level is assigned to the other systems' unspecified intervals. The current figure therefore uses 55 geometric distances and one published spectrum/SED distance, documented per source.

## Presentation and retained alternatives

The new figure has no permanent source-name or “prior sensitive” annotation. Marker color, shape, size and host/subclass qualification use the same conventions as other systems. Source names, methods and model qualifications remain in hover text, accessible links and source details. Catalog filtering still controls every foreground symbol and uncertainty segment.

The source's catalog preferred-distance selection remains the geometric posterior. Its CMD section and plot-input disclosure now show the separate 380 pc adoption. The unmodified catalog-source JSON and main summary CSV remain historical 1.0.2 evidence; they are not silently rewritten to match a plot-specific choice. The original M04422 geometric posterior, including its prior sensitivity, remains available there and in the old CMD input. The old LPT comparison is preserved as a historical comparison; its “main CMD” labels describe web r1, not the current adoption.

## Products and checks

- Current figure: `figures/v1.0.2-web-r13/rawdog_cmd.{pdf,svg,png}` (PNG at 350 dpi).
- Current source-keyed input: `data/v1.0.2-web-r13/cmd_plot_input.csv`, with the same rows in `cmd_plot_input.json` for the website.
- Checksums: `data/v1.0.2-web-r13/SHA256SUMS.txt`.
- Previous CMD: `figures/v1.0.2/rawdog_cmd.{pdf,svg,png}` and `data/v1.0.2/cmd_plot_input.csv`, preserved byte for byte and still downloadable.

Run `python scripts/cmd_revision.py` to build the revised inputs and all three exports through the shared plotting function. Run `python scripts/cmd_revision.py --check` to verify exact input products, evidence/source joins, unchanged photometry/other rows, formulas, reversed endpoints, finite values, 56 unique plotted members, absence of visible source annotations, interactive tokens and checksums. `python scripts/check.py` continues to validate the immutable 1.0.2 release; `node scripts/check_presentation.js` checks the current website overlay. No paper PDFs or private research paths are included.
