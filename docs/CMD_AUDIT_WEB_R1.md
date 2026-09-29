# CMD audit — website/figure revision web r1

Catalog data remains **1.0.0**, 58 members; main CMD remains **56 systems**, with unchanged geometric distances and observed unresolved Gaia photometry. No association or magnitude calculation error was found in the supported inputs. SED placements are methodological alternatives, not new preferred selections or additional members.

| System / exact Gaia DR3 ID | Observed G / BP / RP (mag) | BP−RP | Main geometric distance (pc) | Main M_G | Separate SED distance (pc) | SED M_G |
|---|---|---:|---|---:|---|---:|
| GLEAM-X J0704−37 / 5566254014771398912 | 20.784512 / 21.268938 / 19.417715 | 1.851223 | 3010.02051 [1565.90601, 6045.20801], M04422 | 8.391665 | 380±10, M04418 | 12.885594 |
| ILT J1101+5521 / 855784912471554176 | 20.00551 / 21.19533 / 18.73405 | 2.461280 | 503.860168 [394.788361, 651.67334], M04294 | 11.493960 | 300±30, M04298 | 12.619904 |

The distances alone move the inferred absolute magnitudes by +4.493929 and +1.125944 mag, respectively. The two colors do not change. Magnitudes use `M_G = G + 5 − 5 log10(d/pc)`; larger distance means brighter/lower M_G. Both diagrams have brighter objects toward the top. Neither uses model component magnitudes or extinction-corrected photometry.

## Original-paper verification and interval clarification

[Rodriguez (2025), §3.3/Table 2 and Appendix A.2](https://arxiv.org/html/2501.03315v2) gives GLEAM-X 380±10 pc from a composite optical-spectrum MCMC fit. Appendix A.2 identifies medians and posterior p16/p84 intervals. Assumptions include DA WD and BT-DUSTY donor atmospheres, a 10 Gyr donor isochrone, 10% donor-radius inflation, uniform distance prior 250–1000 pc and a distance-dependent dust map. Extinction is part of the **fit**, but observed Gaia photometry in this comparison is not corrected for it.

[Rodriguez et al. (2026), §3/Table 2](https://arxiv.org/html/2604.18688v2) gives ILT 300±30 pc, matching M04298. The requested Table 1 is the observing log; the parameter table is **Table 2**. Its exact identifiers and rounded G values agree with the audited Gaia associations. §3 explicitly identifies posterior medians and p16/p84 intervals; assumptions include atmosphere/isochrone modeling, fixed E(B−V)=0.01, 10% donor-radius inflation and a uniform 200–1000 pc distance prior. Earlier 333±25 and 337±25 pc estimates remain unchanged as M04296–M04297 in the ledger.

The immutable ledger says the SED interval level is not restated in the table or unspecified. The new comparison records retain that wording in `ledger_uncertainty_convention`, and **supplement it** with the p16/p84 convention explicitly verified in the papers' surrounding analysis text and its URL/location. This is a documented provenance clarification, not an invented confidence level or an alteration of the catalog ledger. Printed symmetric offsets are used to recover rounded distance endpoints; posterior samples and covariances are unavailable.

Transformed magnitude endpoint pairs at fixed G:

- GLEAM-X geometric: [6.877456, 9.810684]; SED: [12.829189, 12.943503].
- ILT geometric: [10.935360, 12.023688]; SED: [12.412940, 12.848691].

These are reversed distance quantile endpoints, **not Gaussian magnitude errors or joint photometry-distance intervals**. G errors remain separate. BP/RP errors originate from the linked approximate magnitude-error records or quoted G error; color errors use quadrature under an independence approximation, without covariance or variability modeling. The new table explicitly links the uncertainty records (ILT M04285/M04287/M04289; GLEAM-X M04413–M04415). SED fitting uses Gaia-calibrated spectra, so photometry and fitted distance need not be independent; no combined error bar is asserted.

## Whole-foreground checks and qualifications

All 56 included sources were checked for source/measurement joins, exact string identifiers, magnitude units, linked G/BP/RP values (within printed precision), evidence-linked distances, finite colors/magnitudes, positive ordered endpoints, reversed bound direction and approximate color-error formulas. The existing scientific regression also checks the 58-system coordinate membership, wrapping, Galactic transformations, candidate status, rejected-counterpart separation and unchanged unrelated values. No foreground parallax inversion or incompatible absolute magnitude is introduced.

GLEAM-X's Gaia parallax is −0.2227831463±0.98077434 mas (M04402): negative and insignificant. Its broad geometric posterior is strongly prior sensitive and is **not a precise empirical distance constraint**. This qualification now appears in its overview, figure caption, main plot label and comparison hover text. ILT also has a broad geometric posterior; both geometric methods retain their prior qualifications. RUWE/astrometry flags for other sources remain visible in their compact CMD notes and full evidence, without undocumented cuts. Original background-cache selection is still incompletely known, as documented in the plotting methods.

CHIME/ILT J1634+44 remains excluded for no secure Gaia counterpart/complete photometry. ASKAP J174508.9−505149 remains excluded for competing unselected distance estimates and uncertain counterpart/astrometry. No concrete input error justifies changing either exclusion.

## Products and reproduction

Revised figures: `figures/v1.0.0-web-r1/` (PDF, SVG, 350-dpi PNG). New comparison inputs/checksums: `data/v1.0.0-web-r1/`. Main sky/CMD inputs still come from immutable `data/v1.0.0/`. Run `python scripts/build.py`, `python scripts/check.py`, then `python scripts/lpt_comparison.py`. The last script contains the small comparison/foreground check and generates exports from the checked rows. Original v1.0.0 figures, archive, tables, source bundles, historical RC releases and tag are preserved.
