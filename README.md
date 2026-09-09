<div align="center">

# 🖋️ SignForge

**An internal multi-party eSignature & offer-letter workflow platform.**

HR creates an Employment Offer 📝 → the Candidate reviews and signs it ✍️ → HR applies a Countersign 🖊️ → an Executive applies the Third-Party Sign where required 🏢 → the offer is **Fully Executed** ✅

<p>
  <img alt="Bun" src="https://img.shields.io/badge/-Bun-000000?style=for-the-badge&logo=bun&logoColor=FBF0DF" />
  <img alt="Turborepo" src="https://img.shields.io/badge/-Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/-React_19-61DAFB?style=for-the-badge&logo=react&logoColor=20232A" />
  <img alt="TypeScript" src="https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
</p>
<p>
  <img alt="Java" src="https://img.shields.io/badge/-Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" />
  <img alt="Spring Boot" src="https://img.shields.io/badge/-Spring_Boot_3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img alt="Python" src="https://img.shields.io/badge/-Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
</p>
<p>
  <img alt="Supabase" src="https://img.shields.io/badge/-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img alt="Docker" src="https://img.shields.io/badge/-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img alt="Render" src="https://img.shields.io/badge/-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" />
  <img alt="Vercel" src="https://img.shields.io/badge/-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

</div>

---

## 📦 Monorepo Layout

| Package 📁 | Language | Purpose | Docs |
|---|---|---|---|
| [`SignForgeClientServiceLayerMSC`](./SignForgeClientServiceLayerMSC) 💻 | React 19 + TypeScript | Candidate/HR-facing web app | [README](./SignForgeClientServiceLayerMSC/README.md) |
| [`SignForgeOrchestratorServiceLayerMSC`](./SignForgeOrchestratorServiceLayerMSC) ⚙️ | Java 21 + Spring Boot | Auth, offers, signatures, dashboard API | [README](./SignForgeOrchestratorServiceLayerMSC/README.md) |
| [`SignForgeRunnerScriptsNMSC`](./SignForgeRunnerScriptsNMSC) 🐍 | Python | Dev tooling — JDK discovery, backend env switching | — |
| [`SignForgeAgentDocumentationNMCS`](./SignForgeAgentDocumentationNMCS) 📚 | Markdown | Domain glossary, ADRs, deployment docs | [PROJECT_CONTEXT.md](./SignForgeAgentDocumentationNMCS/PROJECT_CONTEXT.md) |

Everything is tied together with **Bun** 🥟 workspaces and **Turborepo** 🏎️, giving one command surface across three different languages.

## 🚀 Quickstart

**Prerequisites:** [Bun](https://bun.sh) 🥟 · ☕ JDK 21 · 🐍 Python 3

```bash
bun install
bun run dev
```

That single command starts the client and orchestrator together via Turborepo. Useful variants:

```bash
bun run client:dev      # 💻 frontend only
bun run server:dev      # ⚙️ backend only
bun run backend:local   # 🏠 point the client at a local backend
bun run backend:live    # ☁️ point the client at the deployed backend
bun run list:cmd        # 📋 list every available command
```

## 🏗️ How It Fits Together

```mermaid
flowchart LR
    Candidate(["🙋 Candidate"]) -->|signs| Client["💻 SignForge Client\n(React · Vercel)"]
    HR(["🧑‍💼 HR"]) -->|countersigns| Client
    Exec(["🏢 Executive"]) -->|third-party signs| Client
    Client -->|"REST · JSON (PascalCase)"| Orchestrator["⚙️ SignForge Orchestrator\n(Spring Boot · Render)"]
    Orchestrator -->|JPA| OwnDB[("🐘 SignForge DB\nSupabase")]
    Orchestrator -->|"raw JDBC"| AssetSphereDB[("🐘 AssetSphere DB\nSupabase, separate product")]
```

The Orchestrator reads reference data (departments, designations, work locations) directly from a **sibling product's** database, AssetSphere — a deliberate, documented trade-off. See the ADRs below for why. 👇

## 📖 Documentation

Everything a future contributor (human 🧑‍💻 or agent 🤖) needs to understand *why* this codebase looks the way it does lives in [`SignForgeAgentDocumentationNMCS/`](./SignForgeAgentDocumentationNMCS):

- 📘 [**PROJECT_CONTEXT.md**](./SignForgeAgentDocumentationNMCS/PROJECT_CONTEXT.md) — the domain glossary (Employment Offer, Countersign, Third-Party Sign, and friends)
- 📐 [**ArchitecturalDecisionRecord/**](./SignForgeAgentDocumentationNMCS/ArchitecturalDecisionRecord) — why the non-obvious decisions were made, including:
  - 🔗 Direct AssetSphere database coupling
  - ⚖️ Asymmetric DataSource failure policy
  - 🧬 The 1:1 AssetSphere fidelity mandate that shapes the coding standards
  - 🔑 Committed secret defaults (known, accepted risk)
  - 🗄️ Schema management via Hibernate auto-DDL (no migration tool, yet)
  - 📎 Duplicated agent rule files across services
- 🚢 [**RENDER_BACKEND_DEPLOY_DETAILS.md**](./SignForgeAgentDocumentationNMCS/RENDER_BACKEND_DEPLOY_DETAILS.md) — full backend deployment reference

## 🧭 Coding Standards

Both the client and orchestrator follow a shared **MSC (Model-Service-Controller)** architecture and, deliberately, mirror the coding standards and design system of a sibling internal product, **AssetSphere** — see [`ASSETSPHERE_1TO1_FIDELITY_MANDATE.md`](./SignForgeAgentDocumentationNMCS/ArchitecturalDecisionRecord/ASSETSPHERE_1TO1_FIDELITY_MANDATE.md) for why. Each service folder carries its own `.agents/rules/` for AI coding agents working scoped to just that package.

## ☁️ Deployment

| Layer | Platform | URL |
|---|---|---|
| 💻 Client | ▲ Vercel | `signforge-weplm.vercel.app` |
| ⚙️ Orchestrator | 🎨 Render | `signforgeappcodebasearchitecture.onrender.com` |
| 🐘 Database | Supabase | PostgreSQL 17 |

---

<div align="center">

Made with 🖋️ by the SignForge team.

</div>
