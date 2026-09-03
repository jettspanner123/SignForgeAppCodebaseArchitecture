---
trigger: always_on
---

## AssetSphere 1:1 Backend Orchestrator Coding Rules & Architecture (Java 21 / Spring Boot)

When writing or modifying ANY code in `SignForgeOrchestratorServiceLayerMSC`, you MUST strictly adhere to the AssetSphere backend architecture adapted for Java 21 / Spring Boot 3.4+:

### 1. General & Type Safety
- **High Code Splitting**: Keep controllers, services, and models modular, neat, and clean.
- **Strict Typing**: All variables, method signatures, DTOs, and collections must be explicitly and strictly typed (e.g. `String`, `Integer`, `Double`, `Boolean`, `Long`, `List<String>`, `Map<String, Object>`).
- **Singleton Pattern**: Where singletons are required (assertions, validators, helpers, route factories):
  ```java
  public final class MySingletonHelper {
      private static final MySingletonHelper CURRENT = new MySingletonHelper();
      public static MySingletonHelper getCurrent() { return CURRENT; }
      private MySingletonHelper() {}
  }
  ```

### 2. File & Package Structure (1:1 MSC)
- Every feature must be encapsulated in its own Feature package: `com.theweplm.signforge.Features.<FeatureName>`
  - **Controller**: `Features/<FeatureName>/<FeatureName>Controller.java`
  - **Service**: `Features/<FeatureName>/Services/<FeatureName>Service.java`
  - **Assertion**: `Features/<FeatureName>/Assertion/<FeatureName>Assertion.java`
  - **Constants**: `Features/<FeatureName>/Constants/<FeatureName>CON.java`
  - **Models**: `Features/<FeatureName>/Models/` (All enums, records, DTOs, payloads in PascalCase)
  - **Utilities**: `Features/<FeatureName>/Utilities/<FeatureName>Utility.java`

- Shared / Global packages (`com.theweplm.signforge.`):
  - **Services**: `Services/*Service.java`
  - **Constants**: `Constants/*CON.java`
  - **Models**:
    - `Models/Interfaces/*Interface.java`
    - `Models/Types/*Type.java`
    - `Models/DTOs/*DTO.java`
    - `Models/Classes/*Class.java`
    - `Models/Records/*Record.java`
  - **Utilities**: `Utilities/*Utility.java`
  - **Middlewares**: `Middlewares/*Middleware.java`
  - **Helpers**: `Helpers/*Helper.java` (Must be singletons with `getCurrent()`)
  - **Exceptions**: `Exceptions/*CException.java` (Custom exceptions, e.g. `ValidationCException.java`)
  - **Validators**: `Validators/*CValidator.java` or `*SValidator.java` (Singleton with single `boolean validate(...)` method)
  - **Factories**: `Factories/ApplicationRouteFactory.java`

### 3. Assertion Pattern & Controller Request Validation
- **Try-Catch on Every Endpoint**: Controllers must wrap logic in `try-catch`, returning structured `ApiResponseClass<T>` envelopes.
- **No Direct Null/Empty Checks in Controllers**: Use the Feature Assertion Singleton class (`<FeatureName>Assertion.getCurrent().checkForNullRequest(request)`).
- **Assertion Location**: `Features/<FeatureName>/Assertion/<FeatureName>Assertion.java`
- **Assertion Example**:
  ```java
  public final class AuthenticationAssertion {
      private static final AuthenticationAssertion CURRENT = new AuthenticationAssertion();
      public static AuthenticationAssertion getCurrent() { return CURRENT; }
      private AuthenticationAssertion() {}

      public <T> void checkForNullRequest(T request, String errorMessage) {
          if (request == null) {
              throw new ValidationCException(errorMessage != null ? errorMessage : "Request body cannot be empty.");
          }
      }

      public void assertLoginRequest(LoginRequestDTO request) {
          checkForNullRequest(request, "Login request body cannot be empty.");
          if (request.email() == null || request.email().isBlank() || request.password() == null || request.password().isBlank()) {
              throw new ValidationCException(List.of("Both email and password must be provided."));
          }
      }
  }
  ```

### 4. Strict Route Factory Rules
- **Never Hardcode Route Strings**: All `@RequestMapping`, `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping` routes must reference the singleton `ApplicationRouteFactory`:
  ```java
  @RestController
  @RequestMapping(ApplicationRouteFactory.AuthenticationRoutes.CONTROLLER_URL)
  public class AuthenticationController {

      @PostMapping(ApplicationRouteFactory.AuthenticationRoutes.LOGIN)
      public ResponseEntity<ApiResponseClass<AuthResponseDTO>> login(@RequestBody LoginRequestDTO request) {
          try {
              AuthenticationAssertion.getCurrent().assertLoginRequest(request);
              AuthResponseDTO response = authenticationService.login(request);
              return ResponseEntity.ok(ApiResponseClass.succeeded(response, "Login successful.", 200));
          } catch (ValidationCException valEx) {
              return ResponseEntity.badRequest().body(ApiResponseClass.failed(valEx.getMessage(), valEx.getValidationErrors(), 400));
          } catch (Exception ex) {
              return ResponseEntity.internalServerError().body(ApiResponseClass.failed("An unexpected error occurred.", List.of(ex.getMessage()), 500));
          }
      }
  }
  ```
