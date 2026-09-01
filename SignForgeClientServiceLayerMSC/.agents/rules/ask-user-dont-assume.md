---
trigger: always_on
---

## Pre-Coding Comprehensive Questionnaire & Zero Assumptions

1. **Mandatory Questionnaire Before Coding**: Before writing or modifying any code for a task, feature, bug fix, or architectural adjustment, ALWAYS conduct a comprehensive questionnaire/interview with the user (using the `ask_question` tool or structured clarifying prompts) to ensure complete alignment on requirements, edge cases, visual presentation, and constraints.
2. **Strict Sequential Questioning (One at a Time)**: NEVER present a batch or list of multiple questions at once (e.g., 5 or 10 questions together). Always ask exactly ONE question at a time. The next question must be dynamically generated based on the user's response and output from the previous question.
3. **Exhaustive Probing & Minute-to-Minute Details (`/grill-me`)**: When conducting questionnaires or when `/grill-me` is triggered, probe deeply into minute visual, structural, layout, state, and edge-case details. Walk down each branch of the design tree step-by-step to prevent any out-of-context or misaligned code.
4. **Zero Assumptions**: Do not make assumptions about the user's intent, requirements, preferences, constraints, context, schema, or any detail that is not explicitly confirmed or determined with high confidence.
5. **Clarify Before Proceeding**: If any requirement or design branch is ambiguous, uncertain, incomplete, or has multiple valid interpretations, stop and interview the user with specific, structured questions before proposing or writing code. Prefer asking over guessing at all times.