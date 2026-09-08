package com.theweplm.signforge.Features.EmploymentOffer.Constants;

/**
 * Employment Offer Feature Constants.
 */
public final class EmploymentOfferCON {

    // Statuses
    public static final String STATUS_DRAFT = "DRAFT";
    public static final String STATUS_AWAITING_CANDIDATE = "AWAITING_CANDIDATE";
    public static final String STATUS_AWAITING_COUNTERSIGN = "AWAITING_COUNTERSIGN";
    public static final String STATUS_AWAITING_THIRD_PARTY_SIGN = "AWAITING_THIRD_PARTY_SIGN";
    public static final String STATUS_FULLY_EXECUTED = "FULLY_EXECUTED";
    public static final String STATUS_CANCELLED = "CANCELLED";
    public static final String STATUS_REJECTED = "REJECTED";
    public static final String STATUS_EXPIRED = "EXPIRED";

    // Sign Modes
    public static final String SIGN_MODE_DRAW = "DRAW";
    public static final String SIGN_MODE_TYPED = "TYPED";
    public static final String SIGN_MODE_UPLOAD = "UPLOAD";

    // Document Types
    public static final String DOC_TYPE_OFFER_LETTER = "OFFER_LETTER";
    public static final String DOC_TYPE_JOINING_LETTER = "JOINING_LETTER";

    // Roles permitted for countersigning
    public static final String ROLE_HR_MANAGER = "HR_MANAGER";
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_EXECUTIVE_DIRECTOR = "EXECUTIVE_DIRECTOR";

    private EmploymentOfferCON() {}
}
