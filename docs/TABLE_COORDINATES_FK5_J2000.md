# Main-table coordinates — FK5, equinox J2000

Website web r19 uses FK5/J2000 in the main table. This is a separate, derived presentation product; the released catalog, source bundles and published sky map are preserved. A change of equinox/reference frame is distinct from propagation of a moving source to another position epoch.

The 57 Gaia-counterpart inputs are the existing `gaia_ra_j2000_deg` and `gaia_dec_j2000_deg` fields in `data/v1.0.2/rawdog_gaia_counterparts.csv`. They already contain the released epoch-2000 positions. This revision does not repeat their proper-motion propagation, adopt new astrometry, estimate new errors or propagate covariances. The inputs inherit the original methods, uncertainties and astrometric-quality cautions recorded in the ledger and counterpart table.

| Inputs | Count | Table treatment |
| --- | ---: | --- |
| Released propagated ICRS epoch-2000 positions | 56 | Transform with Astropy `SkyCoord(..., frame='icrs').transform_to(FK5(equinox='J2000'))`. |
| U Gem, Gaia DR3 `674214551557961984` | 1 | The source-specific saved VizieR-output qualification and M05820/M05821 explicitly declare FK5/J2000. Retain these values without a second frame conversion; this qualification takes precedence over the generic dictionary convention. |
| ASKAP J144834−685644 | 1 | Retain the published J2000 radio RA/Dec numerically. Its exact reference system and astrometric reference epoch are unspecified. FK5/J2000 alignment is an explicit approximation for this source, not a newly established frame identification. No Gaia ID is assigned. |

Gl/Gb are transformed from the same adopted table positions. The published sky map and its original Galactic-coordinate inputs retain native Gaia ICRS positions at J2016.0 (plus the qualified radio fallback); main-table and sky-map values therefore have different, documented position-epoch conventions. Neither the map nor its source data are rebuilt by this change.

RA displays hh:mm:ss.sss and Dec displays ±dd:mm:ss.ss; Galactic coordinates display four decimal places in degrees (web r20). Sorting and coordinate downloads retain full-precision derived values. Display precision is not an uncertainty estimate. Source details expose the table coordinates, original coordinate values, input frame/file, SHA-256 and qualifications alongside the unchanged original evidence.

Products:

- [`assets/table_coordinates_fk5_j2000.json`](../assets/table_coordinates_fk5_j2000.json): 58 positions, exact string Gaia IDs, per-row provenance, input SHA-256 values and Astropy version.
- [`assets/table_coordinates_fk5_j2000.csv`](../assets/table_coordinates_fk5_j2000.csv): the same full-precision coordinate rows and provenance for reuse. This is the main table's coordinate download.
- Filtered systems CSV keeps its original 210-field source-summary contract. The frozen native sky-map coordinate CSV remains separately available.

Reproduce with `python scripts/table_coordinates.py`; validate without writing products with `python scripts/table_coordinates.py --check`. The generator checks unique source joins, exact Gaia-ID matches (including the explicitly missing radio counterpart), the U Gem exception, and equatorial/Galactic round trips below one microarcsecond. This numerical closure tests the frame implementation; it does not establish the accuracy of the input astrometry. The generated metadata records the actual Astropy version used.

Primary implementation references: [Astropy FK5 frame and equinox](https://docs.astropy.org/en/stable/api/astropy.coordinates.FK5.html), [Astropy coordinate transformations](https://docs.astropy.org/en/stable/coordinates/transforming.html).
