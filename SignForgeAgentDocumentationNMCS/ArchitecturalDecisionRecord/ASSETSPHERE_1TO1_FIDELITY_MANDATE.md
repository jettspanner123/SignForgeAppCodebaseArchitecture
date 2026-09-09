---
status: accepted
---

# 1:1 AssetSphere Fidelity Mandate

SignForge's coding standards and design system (`CODING_STYLE.md`, `EXPORT_DESIGN.md`, `CODING-RULES.md` — still titled "AssetSphere...") are ported wholesale from sibling product AssetSphere, and always-on agent rules (`.agents/rules/assetsphere-*-investigation.md`, duplicated in the root, client, and orchestrator folders — see [DUPLICATED_AGENT_RULES_PER_SERVICE](./DUPLICATED_AGENT_RULES_PER_SERVICE.md)) forbid building any new screen, controller, or component without first finding and replicating the equivalent AssetSphere implementation 1:1 — same DOM markup, Tailwind classes, MSC file structure, and naming suffixes. SignForge and AssetSphere are sibling internal products from the same company; reusing AssetSphere's already-battle-tested architecture, design system, and coding conventions maximizes consistency and developer velocity across the company's internal tool suite, rather than each product reinventing its own conventions.

## Consequences

- Nearly every structural and visual decision in this repo traces back to "what does AssetSphere do," not to SignForge's own domain (eSignature/offer letters) — a future agent should expect this and not treat it as a puzzle to solve independently.
- The always-on rules include an explicit escape hatch: if SignForge's domain genuinely diverges from AssetSphere's (hardware/asset management) in a way that makes 1:1 replication wrong, the agent must stop and run a single-question-at-a-time interview with the user rather than assume either way.
- This mandate makes the repo not self-contained: a fresh clone without the sibling `AssetsphereAppCodebaseArchitecture` repo checked out on the same machine cannot fully follow these rules.
