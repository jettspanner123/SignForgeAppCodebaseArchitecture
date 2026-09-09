# ⚙️ SignForge Orchestrator

The backend for **SignForge** — the multi-party eSignature orchestrator that powers the whole Employment Offer signing pipeline: authentication 🔐, offer creation 📝, candidate/HR/executive signatures ✍️, and the health checks that keep it all honest 💓.

<p>
  <img alt="Java" src="https://img.shields.io/badge/-Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" />
  <img alt="Spring Boot" src="https://img.shields.io/badge/-Spring_Boot_3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img alt="Maven" src="https://img.shields.io/badge/-Maven-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
</p>
<p>
  <img alt="Supabase" src="https://img.shields.io/badge/-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img alt="Docker" src="https://img.shields.io/badge/-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img alt="Render" src="https://img.shields.io/badge/-Deployed_on_Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" />
  <img alt="JWT" src="https://img.shields.io/badge/-JWT_Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
</p>

## 🧩 Part of the SignForge Monorepo

This package lives alongside two siblings in the [SignForgeAppCodebaseArchitecture](../) monorepo:

- 💻 `SignForgeClientServiceLayerMSC` — the React/TypeScript frontend
- 🐍 `SignForgeRunnerScriptsNMSC` — Python dev tooling that drives this service's Maven build

📖 For domain vocabulary, see `SignForgeAgentDocumentationNMCS/PROJECT_CONTEXT.md` at the repo root.
📐 For architectural decisions — including the AssetSphere database coupling and DataSource failure policy that shape this service — see `SignForgeAgentDocumentationNMCS/ArchitecturalDecisionRecord/`.
🚢 For deployment details (Render service config, env vars, Docker image), see `SignForgeAgentDocumentationNMCS/RENDER_BACKEND_DEPLOY_DETAILS.md`.

## 🏗️ Architecture

Feature-sliced **MSC** (Model-Service-Controller) layout under `com.theweplm.signforge.Features/`:

| Feature ✨ | What it does |
|---|---|
| 🔐 `Authentication` | Login, token refresh, current-user resolution |
| 📄 `EmploymentOffer` | Create offers, and record Candidate/Countersign/Third-Party signatures |
| ⚙️ `ConfigurationConstant` | Departments, designations, work locations (sourced from AssetSphere's database) |
| 📊 `DashboardInfoGrab` | Aggregate stats for the HR dashboard |
| 💓 `HealthCheck` | Liveness probes for uptime monitoring |
| 🙋 `RequestFeature` | Feature-request intake |

Every endpoint lives under `/Api/V1/*`, returns a uniform `ApiResponseClass<T>` envelope (`Data` / `Success` / `Message` / `Errors` / `StatusCode`), and serializes JSON in `PascalCase`. 🐫➡️🐪

## 🚀 Run Locally

**Prerequisites:** ☕ JDK 21, [Bun](https://bun.sh) 🥟 (this service is orchestrated through the monorepo's Turborepo/Bun setup, not run standalone)

From the **repo root**:

```bash
bun install
bun run dev
```

Or scoped to just this service:

```bash
bun run backend:local   # 🏠 build & run the orchestrator locally on :8080
```

`SignForgeRunnerScriptsNMSC/BackendRunner.py` auto-discovers a JDK 21 install on your machine and drives the underlying Maven build — no `JAVA_HOME` setup required. 🔍

## 💓 Health Check

```
GET /Api/V1/HealthCheck/Ping
```

```json
{
  "Data": { "timestamp": "2026-09-09T06:23:18Z", "status": "PONG" },
  "Success": true,
  "Message": "Liveness probe succeeded.",
  "StatusCode": 200
}
```

## 📦 Build

```bash
bun run build   # shells out to Maven via BackendRunner.py
```

Ships as a Docker image (`eclipse-temurin:21-jre-alpine`) to 🎨 Render — see the root `Dockerfile`.
