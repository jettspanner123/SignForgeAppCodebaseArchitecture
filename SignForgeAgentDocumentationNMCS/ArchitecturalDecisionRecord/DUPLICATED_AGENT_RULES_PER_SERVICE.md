---
status: accepted
---

# Duplicated Agent Rules Per Service

The `.agents/rules/` files (`git-commit-style-convention.md`, the AssetSphere investigation and coding-rules files) exist byte-identical in three places: the repo root, `SignForgeClientServiceLayerMSC/.agents/rules/`, and `SignForgeOrchestratorServiceLayerMSC/.agents/rules/`. This duplication is intentional: it lets an agent working scoped to just one service folder be self-sufficient without needing the repo root in context.

## Consequences

- There is no single source of truth for these rules. Editing one copy without updating the other two is a real, live maintenance-drift risk — a future agent (or human) changing one of these files should check for the sibling copies rather than assume the file it's editing is the only one.
