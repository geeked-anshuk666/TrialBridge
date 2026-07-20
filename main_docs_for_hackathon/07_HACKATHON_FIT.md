# TrialBridge — 07_HACKATHON_FIT.md

## Track
Apps for Your Life.

## Required technologies, used correctly (not bolted on)
- **Codex**: used throughout the build as a second, distinct session from
  FreightDoc — scaffolding the FastAPI backend, writing the parallel
  registry-query logic, writing the scoring and explanation prompts,
  wiring up push notifications.
- **GPT-5.6**: used specifically for the three tasks a rule engine or
  keyword search genuinely cannot do — multilingual profile extraction,
  eligibility scoring against unstructured clinical text, and
  plain-language multilingual explanation. The registry querying itself is
  deliberately zero-AI-cost, again demonstrating judgment about where
  reasoning is actually required.

## Judging rubric alignment
| Criterion | How TrialBridge scores |
|---|---|
| Technological Implementation | Parallel multi-registry integration + a genuine multilingual reasoning pipeline |
| Design | Trial cards natively in patient's language, map view, eligibility badges, one-tap notification toggle |
| Potential Impact | Directly addresses an 80%+ global trial recruitment failure rate with life-or-death stakes |
| Quality of Idea | Sharp, specific thesis (discovery + translation, not eligibility, is the barrier) rather than a generic healthcare chatbot |

## Submission requirements checklist alignment
- Distinct `/feedback` Session ID for this second Codex thread, captured
  before closing it.
- README written by hand documenting exactly how Codex and GPT-5.6 were
  used at each pipeline stage, with the multilingual capability called out
  explicitly as the key differentiator.
