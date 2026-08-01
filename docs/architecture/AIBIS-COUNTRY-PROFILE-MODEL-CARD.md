# AIBIS Country Profile Registry — Model Card

## Purpose
Provide versioned, provenance-first country inputs for teaching simulations and entry-mode comparison. The registry is not a country-risk rating service and must not be used as investment, legal, customs or tax advice.

## Dimensions
Market size, market growth, institutional quality, political risk, cultural distance, logistics quality, tariff pressure, digital readiness, IP protection, partner ecosystem, data-regulation risk and network effects.

## Evidence architecture
- World Bank Indicators API for macro indicators. The API exposes thousands of time series and requires no API key.
- World Bank WGI for governance/institutional indicators, with uncertainty retained where available.
- World Bank LPI for logistics; values are not annual, so age must be displayed.
- WTO Tariff & Trade Data for permitted tariff/trade aggregates. Detailed IDB/CTS data have dissemination restrictions and must not be bundled for commercial redistribution without rights review.
- WIPO GII and ITU ICT statistics for innovation/digital context, subject to their terms.
- Expert protocol only for constructs without a validated directly reusable public indicator.

## Normalization
Every model value is 0–100, but raw value, raw unit, source, reference year, retrieval date, direction and confidence are retained. Normalization rules must be versioned separately. A rank must not be treated as an interval-scale measure without justification.

## Confidence
Confidence is separate from the normalized value. It reflects source quality, construct validity, age, coverage and transformation uncertainty. It does not represent probability that an entry mode will succeed.

## Freshness
- current: 0–2 years old
- aging: 3–4 years old
- stale: 5+ years old
- unknown: no reference year

## Licensing guardrail
A source catalog records access and commercial-use status. Restricted source records may be referenced or queried, but raw restricted datasets must not be redistributed through paid BizOn packages.

## Validation roadmap
1. Source and licensing review.
2. Construct-to-indicator mapping by IB experts.
3. Normalization sensitivity analysis.
4. Cross-country face-validity review.
5. Entry-mode ranking sensitivity tests.
6. Annual provenance audit.

## Known limitations
Country averages conceal regional, sectoral and firm-level heterogeneity. Tariffs are product- and partner-specific. Cultural and institutional distance depend on the home-host pair, not the host alone. Therefore pairwise variables should eventually be calculated in a separate bilateral-context module.

## Release rule
No populated country profile enters production unless all required dimensions have source metadata, licensing status, reference year and reviewer approval.