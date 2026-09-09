---
status: accepted
---

# Direct AssetSphere Database Coupling

SignForge's orchestrator connects with a raw JDBC/`JdbcTemplate` DataSource straight into AssetSphere's own, separate Supabase Postgres project, running plain SQL against `AS_ConfigurationConstantTBL` to read (and write) departments, designations, and work locations — instead of calling an AssetSphere API. No AssetSphere API exists for this data, and since SignForge and AssetSphere are sibling products owned by the same team, direct DB access was the fastest path to get real configuration data flowing rather than waiting on API work. This was a deliberate, reviewed engineering trade-off, not an oversight.

## Consequences

- **No contract, no compile-time signal.** A column rename, type change, or table rename on the AssetSphere side breaks SignForge silently at runtime; there is nothing here that would catch it earlier.
- **Bypassed business logic.** Any validation, computed fields, or access rules AssetSphere's own service layer applies to this data are skipped entirely — SignForge sees only the raw table.
- **Wider credential blast radius.** SignForge's backend now holds live credentials to a second product's database; a SignForge compromise extends to AssetSphere data, and vice versa.
- **Future option:** a thin, read-only AssetSphere API for this specific data would remove the schema coupling without giving up the speed this approach bought early on.

See also [ASSETSPHERE_DATASOURCE_FAILURE_ASYMMETRY](./ASSETSPHERE_DATASOURCE_FAILURE_ASYMMETRY.md) for how failures against this second DataSource are handled, and [ASSETSPHERE_1TO1_FIDELITY_MANDATE](./ASSETSPHERE_1TO1_FIDELITY_MANDATE.md) for the broader relationship between the two products.
