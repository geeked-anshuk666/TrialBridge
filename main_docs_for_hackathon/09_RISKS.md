# TrialBridge — 09_RISKS.md

## Risk 1: Medical/legal liability if a match is wrong or misleading
**Mitigation:** Every result is framed as "potential match to explore with
your doctor," never as a guarantee of eligibility or enrollment. Clear,
persistent disclaimer: informational tool, not a substitute for a
physician's judgment.

## Risk 2: Eligibility criteria change frequently and trials close to
enrollment without notice
**Mitigation:** Always display "last verified" timestamp per trial and link
directly back to the source registry listing so the patient (or their
doctor) can confirm current status before acting.

## Risk 3: False positives — patient believes they qualify but doesn't
**Mitigation:** Present eligibility scores with explicit "potential
barriers" alongside "match reasons," never a bare score with no caveats,
so the tone is exploratory rather than definitive.

## Risk 4: Multilingual explanation quality varies by language pair
**Mitigation:** For the hackathon demo, pre-test and pick the
highest-quality language pair for the recorded demo. For production,
maintain a quality-monitoring process and be transparent in-app about
which languages have been more thoroughly validated.

## Risk 5: Registry APIs (especially EU/UK) can be slower or less
consistently available than ClinicalTrials.gov
**Mitigation:** Run registry queries in parallel with individual timeouts;
degrade gracefully by showing whichever registries responded in time rather
than blocking the entire result set on the slowest source.

## Risk 6: Push notification setup/testing eating into limited build time
**Mitigation:** Treat push notifications as a "nice to have that
strengthens the demo" rather than a blocking dependency — if Web Push
integration proves too time-consuming, ship the search/match/explain core
pipeline first and add notifications only if time remains.
