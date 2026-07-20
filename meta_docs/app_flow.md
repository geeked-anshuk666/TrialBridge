# TrialBridge — app_flow.md

## 1. Primary User Journey

```mermaid
flowchart TD
    S1[Land on TrialBridge PWA] --> S2[Type or speak condition\ndescription in own language]
    S2 --> S3[Click Search]
    S3 --> S4[Language detected + shown]
    S5[Pipeline status:\n'Searching N registries...']
    S4 --> S5
    S5 --> S6[6 trial cards appear\nin patient's language]
    S6 --> S7[Map shows trial locations\nby country]
    S7 --> S8[User clicks a card]
    S8 --> S9[Full plain-language explanation\nin patient's language]
    S9 --> S10{Wants notifications?}
    S10 -->|Yes| S11[Toggle Notify Me\nWeb Push subscription registered]
    S10 -->|No| S12[Continue browsing results]
    S9 --> S13[Click 'Share with my doctor']
    S13 --> S14[English PDF generated + downloadable]
```

## 2. Screen Flow

| Screen | Purpose | Key Components |
|---|---|---|
| Landing / Search | Capture condition description | SearchInput, LanguageDetector |
| Results | Show ranked, explained trial matches | TrialCard, TrialMap, EligibilityBadge |
| Trial Detail (expanded card) | Full explanation in patient's language | TrialCard (expanded state) |
| Notification Settings | Opt into future match alerts | NotifyToggle |
| Doctor Report | Physician-facing English PDF | DoctorReport |

## 3. Error / Edge-Case Flows

```mermaid
flowchart TD
    E1[One registry times out] --> E2[Partial results shown\nwith a note: 'X of Y registries responded']
    E3[No trials match] --> E4[Empty state:\nsuggest broadening search terms\nor checking back later]
    E5[Language detection uncertain] --> E6[Fallback to browser\nnavigator.language,\nallow manual override]
    E7[Push notification permission denied] --> E8[Graceful degradation:\nsearch still fully functional\nwithout notifications]
```

## 4. User Journey Documentation Requirements (Mandatory for Stage 2)

- `docs/system_overview.md` must narrate the primary journey (Section 1)
  in plain English, explicitly calling out that the ENTIRE journey
  (search, results, explanation) happens in the patient's own language,
  not just the initial input.
- `docs/codebase_explained.md` must map every screen/component in Section
  2's table to its exact frontend file path.
- `docs/troubleshooting_guide.md` must document all edge-case flows in
  Section 3, including exact log signatures to look for when diagnosing a
  registry timeout vs. a genuine zero-results case.

## 5. Screen Flow Documentation Requirements
- Every component in Section 2 documented in `docs/lld.md` with props,
  state, and API calls.
- `.private_docs/code_walkthrough.md` must specifically walk through how
  the language-detection result flows through every downstream component
  (Results screen, TrialCard, DoctorReport) since maintaining language
  consistency across the whole UI is the trickiest cross-cutting concern
  in this codebase.
