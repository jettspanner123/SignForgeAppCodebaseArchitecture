---
status: accepted — interim, not permanent
---

# Hibernate Auto-DDL, No Migration Tool

The orchestrator's schema is managed entirely through Hibernate's `ddl-auto: update`, which auto-applies schema changes on boot directly against the shared production Supabase instance. There is no migration tool (Flyway/Liquibase) and no migrations folder anywhere in the repo. This is an accepted trade-off for the project's current stage — velocity over rigor — not a permanent architectural stance.

## Consequences

- Schema drift and rollback risk grow as the schema evolves: there's no record of *how* the schema got to its current shape, and no way to roll a bad change back other than reasoning about entity history.
- As the project matures past its current stage, adopting a real migration tool is worth revisiting — this ADR should be treated as superseded once that happens, not silently ignored.
