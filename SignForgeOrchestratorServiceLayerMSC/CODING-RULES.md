# Coding Rules

## General

- (e.g. Use as much code splitting, into components or controller as you can, the code space must be neat and clean).
- (e.g. Always use singleton pattern when possible).

  ```java
  // Definition
  public final class SingletonHelper {
      private static final SingletonHelper CURRENT = new SingletonHelper();
      public static SingletonHelper getCurrent() {
          return CURRENT;
      }

      private SingletonHelper() {
      }

      public void sayHello() {
          // Something here
      }
  }

  // Usage
  SingletonHelper.getCurrent().sayHello();
  ```

- Everything should be fully typed and adhere strictly to object-oriented domain models.

---

## File Structure

- All enums, structs, interfaces, and classes used for data transfer, state options, or data representations must be stored in the `Features/${folderName}/Models/` folder inside each feature, and the file name should be in PascalCase.
- Every feature folder must follow this standardized layout (e.g., if the feature is `Authentication`):
  - **Controller**: `Features/Authentication/AuthenticationController.java`
  - **Service Folder**: `Features/Authentication/Services/AuthenticationService.java`
  - **Assertion Folder**: `Features/Authentication/Assertion/AuthenticationAssertion.java`
  - **Constants Folder**: `Features/Authentication/Constants/`
  - **Models Folder**: `Features/Authentication/Models/`
  - **Utils Folder**: `Features/Authentication/Utilities/`

- If a file/class/utility/tool is used across more than one feature, place it in the appropriate global folder:
  - **Global Service Folder**: `Services/`
    - All file names must be PascalCase and end with `*Service.java`.
  - **Global Constants Folder**: `Constants/`
    - All file names must be PascalCase and end with `*CON.java`.
  - **Global Models Folder**: `Models/`
    - **Global Interface Folder**: `Models/Interfaces/*Interface.java`
    - **Global Types Folder**: `Models/Types/*Type.java`
    - **Global DTOs Folder**: `Models/DTOs/*DTO.java`
    - **Global Classes Folder**: `Models/Classes/*Class.java`
    - **Global Records Folder**: `Models/Records/*Record.java`
  - **Global Utils Folder**: `Utilities/*Utility.java`
  - **Global Middlewares Folder**: `Middlewares/*Middleware.java`
  - **Global Helper Folder**: `Helpers/*Helper.java` (All helper classes must follow the singleton pattern).
  - **Global Exceptions Folder**: `Exceptions/*CException.java` (Custom exceptions).
  - **Global Validators Folder**: `Validators/*CValidator.java` (custom) or `*SValidator.java` (system).
    - Each validator class must be a singleton with a single `boolean validate(...)` method returning `true` or `false`.
    - Each validation class must perform only one type of validation.

---

## PascalCase API Endpoint & JSON Naming Standards

To maintain 1:1 architectural and communication fidelity with enterprise orchestrator services:

### 1. PascalCase URL Endpoint Routes
All API endpoints and URL path segments must be declared in **PascalCase** (e.g. `/Api/V1/Authentication/Login`, `/Api/V1/HealthCheck/Ping`, `/Api/V1/OfferLetter/{id}`).
Hardcoding route paths as raw strings in controllers is strictly prohibited; all routes must reference `ApplicationRouteFactory.java`.

### 2. PascalCase JSON Request and Response Serialization
All request payloads and response bodies serialized or deserialized across the API boundary must use **PascalCase** property keys:
- Enforced globally via Jackson `PropertyNamingStrategies.UPPER_CAMEL_CASE`.
- Envelope properties: `Data`, `Success`, `Message`, `Errors`, `StatusCode`.
- Domain properties: `Email`, `Password`, `AccessToken`, `RefreshToken`, `ExpiresAt`, `User`, `FirstName`, `LastName`, `Role`, `Department`, etc.

#### Example JSON Response Envelope:
```json
{
  "Data": {
    "AccessToken": "eyJhbGciOi...",
    "RefreshToken": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "ExpiresAt": "2026-09-04T12:00:00Z",
    "User": {
      "Id": "22222222-2222-2222-2222-222222222222",
      "Email": "hr@theweplm.com",
      "FirstName": "Priya",
      "LastName": "Sharma",
      "Role": "HR_MANAGER",
      "Department": "HUMAN_RESOURCES"
    }
  },
  "Success": true,
  "Message": "Login successful.",
  "Errors": null,
  "StatusCode": 200
}
```

---

## Assertion Pattern & Controller Request Validation

- Controllers must use `try-catch` blocks on every endpoint, returning structured `ApiResponseClass<T>` envelopes for all success and error paths.
- **Do not write direct `if (request == null)` boilerplate in controllers.** Instead, use the Feature Assertion Singleton class.
- **File Name**: `${FeatureName}Assertion.java` (e.g. `AuthenticationAssertion.java`, `HealthCheckAssertion.java`)
- **File Location**: `Features/${FeatureName}/Assertion/${FeatureName}Assertion.java`
- **Pattern**: Singleton class with `getCurrent()` instance.

### Assertion Definition:

```java
package com.theweplm.signforge.Features.Authentication.Assertion;

import com.theweplm.signforge.Exceptions.ValidationCException;
import com.theweplm.signforge.Features.Authentication.Models.LoginRequestDTO;

import java.util.Collections;

public final class AuthenticationAssertion {

    private static final AuthenticationAssertion CURRENT = new AuthenticationAssertion();

    public static AuthenticationAssertion getCurrent() {
        return CURRENT;
    }

    private AuthenticationAssertion() {
    }

    public <T> void checkForNullRequest(T request, String errorMessage) {
        if (request == null) {
            throw new ValidationCException(errorMessage != null ? errorMessage : "Request body cannot be empty.");
        }
    }

    public void checkForNullRequest(Object request) {
        checkForNullRequest(request, "Request body cannot be empty.");
    }

    public void assertLoginRequest(LoginRequestDTO request) {
        checkForNullRequest(request, "Login request body cannot be empty.");

        if (request.getEmail() == null || request.getEmail().trim().isEmpty() ||
            request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new ValidationCException("Both email and password must be provided.");
        }
    }
}
```

### Controller Usage:

```java
@PostMapping(ApplicationRouteFactory.AuthenticationRoutes.LOGIN)
public ResponseEntity<ApiResponseClass<AuthResponseDTO>> login(@Valid @RequestBody LoginRequestDTO request) {
    try {
        AuthenticationAssertion.getCurrent().checkForNullRequest(request);
        AuthenticationAssertion.getCurrent().assertLoginRequest(request);

        AuthResponseDTO response = authenticationService.login(request);
        return ResponseEntity.ok(ApiResponseClass.succeeded(response, "Login successful.", 200));
    } catch (ValidationCException valEx) {
        log.warn("Login validation failed: {}", valEx.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponseClass.failed(valEx.getMessage(), valEx.getValidationErrors(), 400));
    } catch (Exception ex) {
        log.error("Unexpected error during login.", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseClass.failed("An unexpected error occurred while processing the login request.",
                        Collections.singletonList(ex.getMessage()), 500));
    }
}
```

---

## Strict Route Factory Rules

- Never hardcode route strings in controllers.
- All controller route endpoints must reference the singleton `ApplicationRouteFactory.java` located in `Factories/`.

```java
// Wrong
@RestController
@RequestMapping("/api/users")
public class UserController {
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) { ... }
}

// Right
@RestController
@RequestMapping(ApplicationRouteFactory.AuthenticationRoutes.CONTROLLER_URL)
public class AuthenticationController {
    @PostMapping(ApplicationRouteFactory.AuthenticationRoutes.LOGIN)
    public ResponseEntity<ApiResponseClass<AuthResponseDTO>> login(@RequestBody LoginRequestDTO request) { ... }
}
```
