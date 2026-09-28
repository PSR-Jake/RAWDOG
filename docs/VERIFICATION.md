# RAWDOG 1.0.0 website verification

Local browser checks on 2026-09-28 used the actual static site beneath `/RAWDOG/` in the Codex browser. Search by AR Sco and candidate source name passed; numeric distance sorting in both directions kept all unselected values last. Magnetic-CV plus inferred/proposed host filters returned ASKAP J174508.9-505149 with both classification labels. Marginal-radio filtering retained all five systems including Hya 1 and VV Pup. Source detail inspection verified AR Sco's distinct region/polar fields, MCSE wording and retained alternatives, and CHIME's unresolved host/no assigned Gaia counterpart. Clicking an AR Sco sky symbol opened the correct source hash/detail. SVG titles expose source names, classes, hosts and CMD/astrometry qualifications.

Opt-in filtering with zero search matches produced 0/58 sky and 0/56 CMD plotted counts; visual inspection showed no foreground symbols or uncertainty segments. Background density remained fixed. Independent code review caught and corrected residual uncertainty segments under filtering before publication. Full figures remain versioned downloads.

Responsive browser check at 390×844: stacked controls/figures and mobile source dialog were usable, with no page-wide horizontal overflow; only the large catalog table scrolls within its bounded container. Desktop figure/website screenshots were visually checked, including title separation and brighter-upward CMD layout. No browser error/warning messages were reported.

Browser filtered CSV downloaded to disk with one ASKAP row; every field matched the versioned full summary exactly, including the exact Gaia ID. Downloaded sky PDF and CMD SVG matched local versioned SHA-256 hashes. All 20 static HTML-relative assets/document/data links and all 58 source bundles returned HTTP 200 beneath the project prefix. Versioned archive and checksums are generated with `scripts/package.py`.

GitHub Pages live verification is recorded below after deployment. Reference-manifest reachability checks are historical RC3 checks; external paper links were not all newly requested.
