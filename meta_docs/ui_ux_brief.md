# TrialBridge — ui_ux_brief.md

## 1. Design Principles
- **Warmth over clinical coldness.** This product touches serious, often
  frightening health situations. Tone, color, and copy must feel like a
  compassionate advocate, not a database query tool.
- **Language consistency is non-negotiable.** Once a language is detected,
  every subsequent piece of patient-facing text — labels, card content,
  explanations, empty states, error messages — must render in that
  language. A partially-translated UI breaks trust immediately.
- **Never imply certainty about eligibility.** Every score, badge, and
  explanation must visually and textually communicate "potential match to
  explore with your doctor," never "you qualify."

## 2. Visual Language
- Calm, warm palette — avoid harsh clinical white/blue-only schemes;
  favor softer, human tones while remaining highly legible.
- Eligibility score shown as a badge with both a number AND a plain-
  language qualifier ("Strong potential match" / "Possible match" /
  "Unlikely match") — never a bare number that could be misread as a
  clinical probability.
- Map view uses simple, unmistakable pins per country, not a dense
  clinical dashboard aesthetic.

## 3. Key Components
| Component | Behavior |
|---|---|
| SearchInput | Large, single free-text field; no forced structured fields (patients describe conditions in their own words) |
| LanguageDetector | Small, unobtrusive confirmation of detected language with a manual override dropdown |
| TrialCard | Collapsed: title + score badge + location. Expanded: full plain-language explanation |
| TrialMap | Pins by country, clickable to filter cards |
| EligibilityBadge | Score + plain-language qualifier + "why" tooltip |
| NotifyToggle | Single clear toggle, explains exactly what will be sent and how often |
| DoctorReport | One-click PDF generation, always English regardless of patient's UI language |

## 4. Accessibility & Sensitivity Baseline
- All text must be screen-reader friendly; this audience may include
  patients with disabilities related to their condition.
- No autoplay media, no jarring animations — a patient in a vulnerable
  emotional state should never be startled by the interface.
- Every score/badge carries a text label, never color alone.

## 5. Design Documentation Requirements (Mandatory for Stage 2)
- `docs/project_concepts.md` must explain the "compassionate advocate,
  not database" tone principle and the "never imply certainty" rule as
  core UX concepts a new engineer must internalize before writing any
  patient-facing copy.
- `docs/design_decisions.md` must justify the free-text SearchInput (vs.
  a structured symptom-picker form) — patients describe their situation
  in their own words and the LLM extraction step exists precisely to
  handle that unstructured input.

## 6. Component Documentation Requirements
- Every component in Section 3 documented in `docs/lld.md` with its props
  interface, explicitly noting which props carry patient-language content
  vs. always-English content (DoctorReport).
- `.private_docs/code_walkthrough.md` must include the exact reasoning
  for the EligibilityBadge's "score + qualifier + why tooltip" design —
  specifically why a bare numeric score alone was rejected (risk of being
  misread as a clinical guarantee).
