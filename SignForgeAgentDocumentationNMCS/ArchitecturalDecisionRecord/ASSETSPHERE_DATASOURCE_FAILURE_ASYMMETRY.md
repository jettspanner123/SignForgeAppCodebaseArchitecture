---
status: accepted
---

# AssetSphere DataSource Failure Asymmetry

SignForge's primary DataSource (its own Supabase database) fails fast on boot — throwing `IllegalStateException` if it's unreachable, a "zero-fallback" policy — while the secondary AssetSphere DataSource instead catches connection failures, logs them, and falls back to local SignForge tables rather than crashing. This is a deliberate, risk-based asymmetry, not an inconsistency: SignForge's own data is critical-path and must never silently degrade, while AssetSphere-sourced reference data (departments, designations, work locations) is non-critical convenience data where a graceful, soft degradation is the right behavior. Given the direct-coupling risk accepted in [ASSETSPHERE_DIRECT_DATABASE_COUPLING](./ASSETSPHERE_DIRECT_DATABASE_COUPLING.md), this asymmetry is the correct mitigation, not an accident to "fix" into consistency with the primary DataSource's policy.
