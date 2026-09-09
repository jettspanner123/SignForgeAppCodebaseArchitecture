---
status: accepted — known risk, remediation deferred
---

# Committed Secret Defaults: Accepted Risk

`application.yml` in the orchestrator (tracked in git, unlike `.env` which is correctly gitignored) hardcodes fallback default values via Spring `${VAR:default}` placeholders for `SIGNFORGE_JWT_SECRET`, `SIGNFORGE_DB_PASSWORD`, and `ASSETSPHERE_DB_PASSWORD`. That means secret-shaped values are present in git history regardless of how well `.env` hygiene is otherwise kept. This is a known, accepted current-state risk — not something this documentation pass fixes. Rotating or removing these committed defaults is deliberately left as separate future work, so a future agent should treat this as a flagged, understood risk rather than something to silently "clean up" without confirming scope first, and rather than assuming it's already been handled.
