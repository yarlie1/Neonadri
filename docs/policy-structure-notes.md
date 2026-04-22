# Policy Structure Notes

Last updated: 2026-04-22

This note keeps the policy set organized between:

- public-facing pages linked in the product
- internal draft documents used for operations and future legal review

## Public-facing product pages

These are the pages users can open directly in the app:

- `/terms`
- `/privacy`
- `/community`

These pages should stay:

- shorter than the full internal drafts
- aligned with actual product behavior
- written in clear public-facing language

## Internal draft documents

These should remain internal for now:

- `docs/terms-of-service-draft.md`
- `docs/privacy-policy-draft.md`
- `docs/community-guidelines-draft.md`
- `docs/safety-policy-draft.md`
- `docs/report-enforcement-policy-draft.md`
- `docs/data-retention-deletion-policy-draft.md`
- `docs/safety-incident-playbook-draft.md`
- `docs/cost-support-guidelines.md`
- `docs/cost-support-moderation-flags.md`
- `docs/age-gate-notes.md`

## Practical rule

When product behavior changes:

1. update the implementation
2. update the internal draft that governs the topic
3. update the public page only if the change affects user-facing policy language

## Current recommendation

- keep `Terms`, `Privacy`, and `Community` public
- keep `Safety`, `Report & Enforcement`, `Retention`, and the incident playbook internal
- use the internal drafts as the source for later legal review and operational tightening
