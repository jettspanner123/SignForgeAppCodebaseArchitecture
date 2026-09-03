---
trigger: always_on
---

## Mandatory AssetSphere Backend 1:1 Codebase Investigation & Porting Protocol

1. **Pre-Implementation AssetSphere Backend Investigation**:
   - Before designing, creating, or modifying ANY controller, service, assertion, model, DTO, constant, exception, validator, or feature in SignForge backend (`SignForgeOrchestratorServiceLayerMSC`), you MUST FIRST search the AssetSphere backend codebase (`c:\Users\UddeshyaSingh\Development\AssetsphereAppCodebaseArchitecture\AssetsphereOrchestratorServiceLayerMSC`).
   - Find and view the corresponding files, controllers, services, assertions, DTOs, and constants in AssetSphere.

2. **Thorough Architectural & Pattern Study**:
   - Study the exact endpoints, request/response models, assertion rules, exception types, dependency injections, logging, and error handling patterns in AssetSphere.

3. **1:1 Strict Fidelity Replication in Java 21 / Spring Boot 3+**:
   - Implement an exact 1:1 replica of that feature, controller, service, or model in SignForge adapted for Java 21 and Spring Boot.
   - Follow the same MSC file/folder structure:
     - `Features/<FeatureName>/<FeatureName>Controller.java`
     - `Features/<FeatureName>/Services/<FeatureName>Service.java`
     - `Features/<FeatureName>/Assertion/<FeatureName>Assertion.java`
     - `Features/<FeatureName>/Constants/<FeatureName>CON.java`
     - `Features/<FeatureName>/Models/`
   - Use `ApplicationRouteFactory` for all endpoint URLs.
   - Use `ApiResponseClass<T>` for all endpoint response envelopes.
   - Use `<FeatureName>Assertion.getCurrent()` for all controller request validations.

4. **Domain Divergence Questionnaire Protocol**:
   - If a feature or model cannot be copied 1:1 because of domain-specific differences between AssetSphere (IT hardware/devices) and SignForge (eSignature/contract management), you MUST NOT assume the solution.
   - Stop and conduct a sequential, single-question interview with the user via `ask_question` with recommendations before writing code.
