package com.theweplm.signforge.Constants;

/**
 * Database Constants (1:1 AssetSphere Schema Architecture).
 * Table Naming Convention: SF_${PascalCase}TBL
 */
public final class DatabaseCON {

    public static final String DEFAULT_SCHEMA = "public";
    public static final String CONNECTION_STRING_KEY = "SIGNFORGE_DATABASE_CONNECTION_STRING";

    // Table Names - Strict Convention: SF_${PascalCase}TBL (Quoted for PostgreSQL case preservation)
    public static final String USERS_TABLE = "\"SF_UsersTBL\"";
    public static final String OFFER_DOCUMENTS_TABLE = "\"SF_OfferDocumentsTBL\"";
    public static final String SIGNATURES_TABLE = "\"SF_SignaturesTBL\"";
    public static final String AUDIT_LOGS_TABLE = "\"SF_AuditLogsTBL\"";
    public static final String CONFIGURATION_CONSTANTS_TABLE = "\"SF_ConfigurationConstantTBL\"";
    public static final String NOTIFICATIONS_TABLE = "\"SF_NotificationTBL\"";

    private DatabaseCON() {}
}
