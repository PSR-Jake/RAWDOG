# Preferred reference links — web r23

Website reference links prefer the corresponding arXiv abstract page. Journal, ADS and other existing source links provide fallbacks. Data queries and service endpoints retain their targets.

The lookup covers all 669 reference keys in catalog 1.0.2. It selects 316 arXiv links and 353 fallbacks, including database queries, documentation and records with incomplete bibliographic metadata. There are 216 updated URLs, including normalization of arXiv PDF links to abstract pages.

## Matching and provenance

NASA ADS was queried by exact bibcode, DOI and existing arXiv identifiers on 2026-11-06. The returned metadata contains 413 records. Primary arXiv metadata was retrieved for 261 identifiers, and titles were compared with the matched citations. Preprint and journal titles can differ in wording.

Ten catalog records have DOI or bibcode inconsistencies. Their citation titles, authors/year and bibliographic locations were reviewed explicitly. These decisions are recorded in `manual_citation_matches` in the metadata snapshot.

Three additional arXiv associations required title-based review.

| Reference | Preferred destination | Review |
| --- | --- | --- |
| Campbell+08_STLMi | [arXiv:0807.1143](https://arxiv.org/abs/0807.1143) | The primary title identifies paper III on AM Her and ST LMi. Its related DOI and ADS association refer to paper II. |
| Campbell+08_EQCet | [Journal DOI](https://doi.org/10.1086/533488) | Paper II concerns EQ Cet, AN UMa and VV Pup. The arXiv identifier attached by ADS has the title of paper III. |
| vanDerHeyden+02_V1043Cen | [Journal DOI](https://doi.org/10.1046/j.1365-8711.2002.05320.x) | The arXiv identifier attached by ADS describes SNR N103B, rather than the RX J1313.32−3259 polar. |

Hog+00_ZCam uses its exact ADS record because the stored DOI resolves to a different paper. Publisher corrections and corrigenda retain their own links.

## Products and checks

- [Metadata snapshot](../data/v1.0.2-web-r23/reference_metadata.json) records the lookup date, input checksum, ADS/arXiv metadata and reviewed exceptions.
- [Link audit CSV](../data/v1.0.2-web-r23/reference_links.csv) records each original and preferred URL, the matched ADS bibcode, arXiv title and matching basis.
- [Website link index](../assets/reference_links.json) supplies the preferred links to radio, X-ray and complete-reference views.

Rebuild and validate the products offline from the repository root.

```sh
python scripts/reference_links.py
python scripts/reference_links.py --check
node scripts/check_presentation.js
```

The reference CSV and source JSON bundles remain the versioned 1.0.2 evidence snapshot. The website index is a separate presentation product. If that optional index cannot load, the interface uses the catalog's existing URLs.
