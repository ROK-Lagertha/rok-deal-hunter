# Development Workflow

## Main branch
`main` is the protected-by-process known-working baseline.

Do not develop experimental UI changes directly on `main`.

## Feature work
Create a branch such as:

`feature/deal-settings`

Make and test changes there first.

## Merge rule
Only merge a feature branch into `main` after the Google Apps Script deployment has been tested successfully.

## Recovery
If a feature breaks the app, return to `main`. The known-working baseline remains intact.

## Commit guidance
Prefer small commits with clear messages, for example:

- `feat: add shop multi-select`
- `fix: preserve settings modal behavior`
- `docs: update routing rules`
- `data: document market eligibility model`
