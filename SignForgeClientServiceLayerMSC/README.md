# 🖋️ SignForge Client

The client application for **SignForge** — an internal e-signature and offer-letter workflow platform. This is the candidate/HR-facing web app: HR creates Employment Offers, Candidates review and sign them ✍️, and HR (and, where required, an Executive) apply their own signatures to fully execute the document. ✅

<p>
  <img alt="Bun" src="https://img.shields.io/badge/-Bun-000000?style=for-the-badge&logo=bun&logoColor=FBF0DF" />
  <img alt="React" src="https://img.shields.io/badge/-React_19-61DAFB?style=for-the-badge&logo=react&logoColor=20232A" />
  <img alt="TypeScript" src="https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/-Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E" />
</p>
<p>
  <img alt="TailwindCSS" src="https://img.shields.io/badge/-Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img alt="TanStack Query" src="https://img.shields.io/badge/-TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" />
  <img alt="Zustand" src="https://img.shields.io/badge/-Zustand-593D88?style=for-the-badge&logoColor=FFD54F" />
  <img alt="Vercel" src="https://img.shields.io/badge/-Deployed_on_Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

## 🧩 Part of the SignForge Monorepo

This package lives alongside two siblings in the [SignForgeAppCodebaseArchitecture](../) monorepo:

- ⚙️ `SignForgeOrchestratorServiceLayerMSC` — the Java/Spring Boot backend
- 🐍 `SignForgeRunnerScriptsNMSC` — Python dev tooling

📖 For domain vocabulary, see `SignForgeAgentDocumentationNMCS/PROJECT_CONTEXT.md` at the repo root.
📐 For architectural decisions, see `SignForgeAgentDocumentationNMCS/ArchitecturalDecisionRecord/`.

## 🚀 Run Locally

**Prerequisites:** [Bun](https://bun.sh) 🥟

From the **repo root** (this app is run through Turborepo, not standalone):

```bash
bun install
bun run dev
```

This starts the client (and, where configured, the backend) together via Turborepo. To run only this package during development:

```bash
cd SignForgeClientServiceLayerMSC
bun run dev
```

### 🔀 Switching backend targets

By default the client talks to the deployed orchestrator backend. To point it at a local backend instance instead, use the repo-root environment switcher:

```bash
bun run backend:local   # 🏠 point the client at http://localhost:8080
bun run backend:live    # ☁️ point the client back at the deployed backend
```

## 📦 Build

```bash
bun run build
```

Deploys as a static SPA to ▲ Vercel (see `vercel.json`).
