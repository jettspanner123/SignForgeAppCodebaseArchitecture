package com.theweplm.signforge.Validators;

import java.util.regex.Pattern;

/**
 * System validator for email format compliance.
 */
public final class EmailSValidator {

    private static final EmailSValidator CURRENT = new EmailSValidator();
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$");

    public static EmailSValidator getCurrent() {
        return CURRENT;
    }

    private EmailSValidator() {}

    public boolean validate(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email.trim()).matches();
    }
}
