---
trigger: always_on
---

## Mandatory AssetSphere 1:1 Codebase Investigation & Porting Protocol

1. **Pre-Implementation AssetSphere Investigation**:
   - Before designing, creating, or modifying ANY screen, component, navigation element, modal, toolbar, button, input, badge, typography, or feature in SignForge, you MUST FIRST search the AssetSphere codebase (`c:\Users\UddeshyaSingh\Development\AssetsphereAppCodebaseArchitecture\AssetsphereClientServiceLayerMSC`).
   - Find and view the corresponding files, controllers, components, and constants in AssetSphere.

2. **Thorough Architectural & Design Study**:
   - Study the exact DOM markup, hierarchy, responsive layout, CSS utility classes, Lucide icons, typography classes (e.g. `font-serif-headline`, `font-mono`), state management, container padding, button dimensions (e.g. `h-9` track with `h-7` inner buttons), and micro-interactions.

3. **1:1 Strict Fidelity Replication**:
   - Implement an exact 1:1 copy of that feature, component, or layout in SignForge.
   - Do NOT alter text labels, omit icons, modify padding, or invent alternative designs when an AssetSphere reference exists.

4. **Domain Divergence Questionnaire Protocol**:
   - If a feature or component cannot be copied 1:1 because of domain-specific differences between AssetSphere (device/hardware management) and SignForge (eSignature/contract management), you MUST NOT assume the solution.
   - Stop and conduct a sequential, single-question interview with the user via `ask_question` with recommendations before writing code.