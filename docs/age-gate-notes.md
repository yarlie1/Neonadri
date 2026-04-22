# Age Gate Notes

## Current minimum gate

- Neonadri is presented as an adults-only service.
- Signup requires a self-attestation checkbox confirming the user is 18 or older.
- The confirmation is stored in auth user metadata:
  - `is_adult_confirmed: true`
  - `age_gate_confirmed_at: <ISO timestamp>`

## Current user-facing copy

- Signup: `Neonadri is for adults 18+ only.`
- Signup checkbox: `I confirm that I am 18 or older and understand that Neonadri is for adults only.`
- Login: adults-only reminder copy remains visible.

## Next hardening options

- deny access for accounts missing adult confirmation metadata
- require fresh confirmation when legal copy changes
- add admin review path for suspected underage accounts
- define suspension/removal flow for underage access attempts
