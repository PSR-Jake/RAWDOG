# RAWDOG online presentation specification

## Catalog table

Present one searchable, sortable row per system from rawdog_source_summary.csv. Search preferred names, aliases, Gaia DR3 ID, and reference keys. Sort by source name, observational class, host-confidence label, selected orbital period, selected distance, radio status, and observation count. Keep periods blank when unselected; never sort missing values as zero.

Provide filters for:

- Classification: cataclysmic variable, magnetic-CV tag, white-dwarf pulsar, long-period radio transient, and other candidate labels. Treat these as overlapping audited class tags, not exclusive bins or proof that a subclass is secure; show candidate/disputed status next to the tag.
- WD identification confidence: Established, Inferred or proposed, Unresolved.
- Radio evidence: Secure reported detection, Marginal reported signal, Upper limit, Reported detection; significance not harmonized, Reported flux; significance not harmonized. A system can match multiple radio filters through different observations.

Use readable labels and a short help panel. Keep legacy class codes and internal audit-status strings out of the primary interface. Explain that a reported flux without harmonized significance is not a newly assessed detection claim.

## System detail view

Each detail page should show:

1. Preferred name, aliases, classification axes, host-confidence label, and the source evidence supporting those labels.
2. Every radio observation as its own row, with epoch/state, band/frequency, flux or upper limit, uncertainty convention, polarization, radio-evidence label, and reference links. Do not collapse rows across epochs or bands.
3. The full property-measurement list, grouped by parameter and component, with alternatives, assumptions, direct/model/derived status, units, errors/bounds, exact source location, and reference link. Put model alternatives next to one another without averaging them.
4. Periods grouped as orbital, WD spin, beat/sideband, radio recurrence, and other modulation. Explain that these clocks are not interchangeable.
5. WD temperatures and magnetic fields labeled by physical component or emitting region; present photospheric temperature, mean photospheric field, polar field, local accretion-region field, and radio-emitting-plasma field as separate properties. Include the selected method, uncertainty or bounds, reference, and qualification.
6. Observed versus extinction-corrected photometry, distance posterior choice, energy band and absorption convention for fluxes, and observation state wherever the source records them.
7. A plain-language list of unresolved evidence or interpretation questions with links to the public review-issue rows.

Do not display an empty preferred value as zero. Show its status text and a link to the alternatives. Provide uncertainty definitions in the table header or hover help, including “convention not specified; do not assume 1σ.”

## Downloads and citation

Expose the versioned CSV files individually and as a versioned archive. Include the data dictionary, validation report, and provisional citation. Show **RAWDOG 1.0.0-rc3, prepared 2026-09-28** visibly on every catalog/download landing page; replace it only when a new archived release is published. Once a DOI is assigned, show the DOI and preferred citation beside the version. Allow a user to download either the full provenance records or the currently filtered system rows while retaining source_id, observation_id, measurement_id, reference keys, units, flags, and status fields.

## Release-state behavior

Public screens should use the human-readable fields in the release tables. Keep raw audit status codes and maintainer-only local paths out of the default user flow. Preserve all scientific alternatives, caveats, and citations in downloads and detail pages. Make clear that this literature-selected sample is not complete and does not define one evolutionary sequence.
