# AGENTS.md — `newfiles/`

This folder is part of an enterprise application. Prefer caution over speed. Do not get ahead of the user.

## Before any code change

1. **Propose a plan first.** List the exact files you intend to touch, what you will change, and why.
2. **Wait for explicit approval** before creating, editing, deleting, renaming, or moving files.
3. If requirements are unclear, ask — do not assume or invent scope.

## While working

- Change **only** what was approved. No drive-by refactors, renames, cleanups, or “while I’m here” fixes.
- Do **not** wire features together, add redirects, connect APIs, or link UI to other screens unless the user explicitly asks.
- Do **not** add new files, dependencies, docs, or tooling unless approved in the plan.
- Prefer the smallest diff that satisfies the request.

## Explain every change

For each edit (or batch of related edits), tell the user:

- **What** changed (file + brief description)
- **Why** it was necessary for the approved request

The user will double-check everything. Write so a careful reviewer can verify intent without reading the whole diff first.

## After approval

- Implement only the approved plan.
- If you discover you need to go beyond the plan, **stop**, explain, and wait for a new approval.
- Do not commit, push, or open PRs unless the user asks.
