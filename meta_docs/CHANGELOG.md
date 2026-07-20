# TrialBridge — CHANGELOG.md

All notable changes to this project are documented here. Entries are
categorized as **Added / Changed / Fixed / Security / Documentation**.

Given this product's health-adjacent nature, **Security** entries related
to patient data handling are especially important and must never be
skipped, even for seemingly minor changes.

## [Unreleased]

### Added
- (placeholder — populate as Phase 0-9 of `plan.md` execute)

### Changed
- (placeholder)

### Fixed
- (placeholder)

### Security
- (placeholder — every change touching patient input handling, logging,
  or data retention gets an explicit entry here, even if the conclusion
  is "no retention change, reviewed and confirmed safe")

### Documentation
- (placeholder — every `docs/*` and `.private_docs/*` file creation/update
  gets a line here, referencing the corresponding code change)

## Update Requirements (policy, not history)
This file must be updated for:
- Every code change
- Every architecture change
- Every schema change (including the SQLite subscription table)
- Every API change
- Every documentation change
- Every security/data-handling change (mandatory, no exceptions, given
  the health-information-adjacent context of this product)

A phase in `plan.md` is not complete until its `CHANGELOG.md` entries
exist.
