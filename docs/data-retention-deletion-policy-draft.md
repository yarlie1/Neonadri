# Data Retention and Deletion Policy Draft

Last updated: 2026-04-22
Status: internal release draft for legal review

## 1. Purpose

This draft describes how Neonadri should think about keeping, deleting, and preserving information.

## 2. General retention principle

Neonadri should retain data only as long as reasonably necessary to:

- operate the product
- support account and meetup features
- investigate abuse or safety incidents
- resolve disputes
- comply with legal obligations
- protect platform integrity

## 3. Data categories

### Account and profile data

Examples:

- email address
- profile details
- login-linked account metadata

Retention baseline:

- kept while the account remains active
- deleted or deactivated after account deletion unless limited retention is required for safety, fraud, legal, or enforcement reasons

### Meetup and match data

Examples:

- meetup posts
- match requests
- match states
- related timestamps

Retention baseline:

- kept as long as reasonably needed for product history, dispute handling, trust signals, and operations

### Chat and review data

Examples:

- chat messages and chat activity metadata
- review content and ratings

Retention baseline:

- kept for product operation, audit, moderation, and dispute resolution unless deletion is legally required

### Safety and enforcement data

Examples:

- block events
- reports
- moderation notes
- enforcement records

Retention baseline:

- may be retained longer than ordinary product data where needed for safety review, repeat-offender tracking, fraud prevention, or legal compliance

## 4. Account deletion

When a user deletes an account, Neonadri should remove or de-identify user-linked data where appropriate, but may retain limited records if necessary to:

- comply with law
- investigate or document safety incidents
- prevent abuse or repeat harm
- enforce platform rules
- maintain system security or backup integrity

## 5. Backups and logs

Some deleted data may remain in backups or operational logs for a limited time before rotation or cleanup.

## 6. Final implementation check

Before publishing a final version, retention statements should be checked against actual database behavior, admin tooling, backup policies, and account deletion flows.
