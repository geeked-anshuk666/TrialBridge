# TrialBridge — 03_WHY_NOW.md

## Why this becomes possible today, not two years ago

1. **Multilingual clinical reasoning at consumer accessibility.** Reading
   a patient's plain-language description in Hindi, Portuguese, or Arabic,
   extracting a structured medical profile, and matching it against
   English-language clinical eligibility criteria written in dense
   regulatory language is now reliable at GPT-5.6-class model quality — a
   task that required a bilingual clinical research coordinator as recently
   as 18 months ago.

2. **Open, stable, free international registry infrastructure now exists
   at sufficient scale.** ClinicalTrials.gov's V2 API, the EU Clinical
   Trials Register, ISRCTN, and WHO's ICTRP aggregator collectively cover
   121 countries and are queryable in real time without cost or
   authentication friction — the data layer this idea depends on is
   mature and stable today.

3. **Eligibility scoring as a genuine reasoning task, not keyword matching.**
   Scoring "does this specific patient, with this specific treatment
   history, plausibly meet this trial's inclusion/exclusion criteria" is a
   reasoning task over unstructured clinical text — this quality of
   reasoning at accessible cost and latency is a recent capability.

4. **PWA push notifications make "ongoing safety net" achievable without a
   native app.** The Web Push API lets a patient opt into "notify me when a
   new matching trial opens" entirely within a browser-installable PWA —
   no App Store approval process, no native app development overhead.

5. **The underlying pain (80%+ trial recruitment failure) is a persistent,
   well-documented structural problem** — this is not a fad or a
   temporary regulatory quirk; it is a stable, severe, global gap that a
   discovery tool can address durably.
