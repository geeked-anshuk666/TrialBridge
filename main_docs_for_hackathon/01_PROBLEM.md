# TrialBridge — 01_PROBLEM.md

## One-line pitch
An agent that takes a patient's plain-language description of their
condition, in any language, matches them against clinical trials across
18+ international registries, and explains the results in language a
non-clinician can actually understand and act on.

## The problem, stated plainly
Over 80% of clinical trials fail to recruit enough patients on time. This
is not because eligible patients don't exist — it's because nobody connects
them to the trial. A patient with a rare cancer, an autoimmune condition, or
a treatment-resistant disease may be sitting in a waiting room while several
relevant, actively-recruiting trials exist nearby or internationally, and
they will never find out.

## Scale of the discovery gap
- ClinicalTrials.gov alone lists **490,000+ registered studies.**
- WHO's ICTRP aggregates **18 national registries, 689,000+ trials across
  121 countries** as of 2026.
- No layperson can navigate a database of this size written in dense
  clinical eligibility language.
- No physician has time, during a routine visit, to check every
  potentially relevant registry for every patient.

## Who feels this pain
- Patients with rare diseases, treatment-resistant conditions, or advanced
  disease stages where standard treatment has been exhausted.
- Patients outside English-speaking countries who face a double barrier:
  the registries are mostly English-language and written in clinical
  jargon even for native English speakers.
- Patients who would be willing to travel internationally for an eligible
  trial but have no way to discover that such trials exist.

## Why this is not an abstract problem
This is a life-and-death-adjacent discovery failure. The existence of an
eligible trial is not the barrier — the invisibility of that trial to the
patient is. That is a pure information-access problem, which is exactly the
class of problem an LLM-based multilingual matching and explanation system
is well suited to close.
