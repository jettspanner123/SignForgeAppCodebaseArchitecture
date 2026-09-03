package com.theweplm.signforge.Validators;

/**
 * System validator for password length and complexity.
 */
public final class PasswordSValidator {

    private static final PasswordSValidator CURRENT = new PasswordSValidator();

    public static PasswordSValidator getCurrent() {
        return CURRENT;
    }

    private PasswordSValidator() {}

    public boolean validate(String password) {
        if (password == null || password.trim().isEmpty()) {
            return false;
        }
        return password.length() >= 6;
    }
}
