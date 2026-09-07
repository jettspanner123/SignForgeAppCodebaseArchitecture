# SignForge Orchestrator Backend - Render Cloud Deployment Guide

This document provides complete, exhaustive architectural and operational documentation for the production deployment of the **SignForge Orchestrator Backend Service** on **Render Cloud**.

---

## 1. Executive Summary & Architecture Overview

| Parameter | Specification |
| :--- | :--- |
| **Service Name** | `SignForgeAppCodebaseArchitecture` |
| **Service ID** | `srv-daf6vnpt0dsc73crbk0g` |
| **Service URL** | [https://signforgeappcodebasearchitecture.onrender.com](https://signforgeappcodebasearchitecture.onrender.com) |
| **Dashboard URL** | [https://dashboard.render.com/web/srv-daf6vnpt0dsc73crbk0g](https://dashboard.render.com/web/srv-daf6vnpt0dsc73crbk0g) |
| **Render Workspace** | `tea-d7p6f8bbc2fs73c18d8g` (`My Workspace`) |
| **Runtime Environment** | Docker (`eclipse-temurin:21-jre-alpine`) |
| **Application Framework** | Spring Boot `3.4.3` / Java `21` |
| **Database Engine** | PostgreSQL 17 (Hosted on Supabase with Connection Pooling) |
| **Region** | Oregon (US-West) |
| **Instance Type / Plan** | Free Tier (`0.5 CPU, 512 MB RAM`) |
| **Auto-Deploy** | Enabled (`yes` on commits to branch `main`) |
| **Health Check Path** | `/Api/V1/HealthCheck/Ping` & `/Api/V1/HealthCheck` |

```
                                  +-------------------------------------------------------------+
                                  |                     Render Cloud Service                    |
                                  |             (SignForgeAppCodebaseArchitecture)              |
                                  |                                                             |
+---------------------+           |   +-------------------+          +----------------------+   |           +-------------------------+
|  SignForge Client   |  HTTPS    |   |   Reverse Proxy   |  :8080   | Spring Boot 3.4 /    |   |  JDBC     | Supabase PostgreSQL 17  |
|  (Web / Desktop)    +---------->+   |   & SSL Gateway   +--------->+ Java 21 Container    +---+---------->+ Connection Pooler       |
|                     |           |   |                   |          | (Tomcat Web Server)  |   | (SSL Req) | (AWS ap-southeast-1)    |
+---------------------+           |   +-------------------+          +----------------------+   |           +-------------------------+
                                  +-------------------------------------------------------------+
```

---

## 2. Multi-Stage Docker Containerization

To ensure reproducible, lightweight, and secure container builds across environments without requiring local JDK installations on deployment runners, a multi-stage Docker build pipeline is utilized.

### 2.1 Multi-Stage Architecture (`Dockerfile`)

1. **Stage 1: Build & Dependency Resolution (`builder`)**
   - **Base Image**: `maven:3.9.9-eclipse-temurin-21-alpine`
   - **Caching Strategy**: Copies `pom.xml` first to cache downloaded Maven plugins and JAR dependencies before compiling source code.
   - **Compilation**: Executes `mvn clean package -DskipTests` to produce the shaded Spring Boot executable JAR.

2. **Stage 2: Hardened Production Runtime (`runtime`)**
   - **Base Image**: `eclipse-temurin:21-jre-alpine` (~180MB lightweight Alpine footprint).
   - **Security**: Creates an unprivileged system user/group `signforge:signforge` (UID/GID non-root) to prevent container escape vulnerabilities.
   - **Tools**: Includes `curl` for container health monitoring.
   - **JVM Container Optimization**: Sets `-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0` to respect cgroup memory limits on containerized hosts.

```dockerfile
# ==============================================================================
# SignForge Orchestrator Backend Service - Multi-Stage Production Dockerfile
# Base: Eclipse Temurin Java 21 (Alpine Linux)
# ==============================================================================

# --- Stage 1: Build Stage ---
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy pom.xml and pre-fetch dependencies for optimal layer caching
COPY SignForgeOrchestratorServiceLayerMSC/pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build executable Spring Boot JAR
COPY SignForgeOrchestratorServiceLayerMSC/src ./src
RUN mvn clean package -DskipTests

# --- Stage 2: Production Runtime Stage ---
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Install curl for container health checks
RUN apk add --no-cache curl

# Create non-root system group and user
RUN addgroup -S signforge && adduser -S signforge -G signforge

# Copy built JAR from builder stage
COPY --from=builder /app/target/*.jar /app/app.jar

# Adjust ownership
RUN chown -R signforge:signforge /app

# Switch to non-root user
USER signforge:signforge

# Expose default HTTP port
EXPOSE 8080

# Environment defaults
ENV PORT=8080 \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Application Entrypoint
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
```

---

## 3. Environment Variables Configuration

The following environment variables are securely provisioned on Render:

| Variable Name | Value / Description | Purpose |
| :--- | :--- | :--- |
| `PORT` | `8080` | Render HTTP ingress port binding |
| `SIGNFORGE_DATABASE_URL` | `jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require` | Supabase pooled PostgreSQL JDBC connection |
| `SIGNFORGE_DB_USERNAME` | `signforge_app.apzfodnvbvvpxalsxltv` | Database authentication username |
| `SIGNFORGE_DB_PASSWORD` | `[SECURE]` | Database authentication password |
| `SIGNFORGE_JWT_SECRET` | `SignForgeSuperEnterpriseSecretKey2026SecureLongJwtTokenSigningKey!` | HS256 / HS512 JWT cryptographic signing key |
| `SIGNFORGE_JWT_ISSUER` | `SignForgeOrchestrator` | JWT Issuer assertion (`iss`) |
| `SIGNFORGE_JWT_AUDIENCE` | `SignForgeClient` | JWT Audience assertion (`aud`) |
| `SIGNFORGE_ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173,https://signforge.theweplm.com` | CORS allowed origins for web and desktop clients |
| `SIGNFORGE_DATABASE_SEED` | `false` | Seeder switch (prevents unintentional re-seeding on boot) |

---

## 4. Port Binding & Networking Configuration

Spring Boot's `application.yml` dynamically evaluates port hierarchy:

```yaml
server:
  port: ${PORT:${SERVER_PORT:8080}}
```

- **Render Default**: Automatically assigns port `8080` or binds to the dynamic container port.
- **Local Fallback**: Binds to `SERVER_PORT` (if defined) or defaults to port `8080`.

---

## 5. Live Verification & Health Endpoints

### 5.1 Liveness Probe (`/Api/V1/HealthCheck/Ping`)

- **HTTP Method**: `GET`
- **URL**: `https://signforgeappcodebasearchitecture.onrender.com/Api/V1/HealthCheck/Ping`
- **Response**:
```json
{
  "Data": {
    "status": "PONG",
    "timestamp": "2026-09-07T08:07:39.080893905Z"
  },
  "Success": true,
  "Message": "Liveness probe succeeded.",
  "StatusCode": 200
}
```

### 5.2 Deep System Health Check (`/Api/V1/HealthCheck`)

- **HTTP Method**: `GET`
- **URL**: `https://signforgeappcodebasearchitecture.onrender.com/Api/V1/HealthCheck`
- **Response**:
```json
{
  "Data": {
    "OverallStatus": "Healthy",
    "TotalDurationMs": 353,
    "Database": {
      "ComponentName": "PostgreSQL Supabase Database",
      "Status": "Healthy",
      "LatencyMs": 351,
      "Details": "Connected successfully. Latency: 351ms",
      "CheckedAt": "2026-09-07T08:07:41.449389702Z"
    },
    "Runtime": {
      "EnvironmentName": "Development",
      "Uptime": "0d 0h 0m 39s",
      "MemoryAllocatedMB": 46.93,
      "ThreadCount": 24,
      "RuntimeVersion": "21.0.12+8-LTS"
    },
    "Subsystems": [
      {
        "ComponentName": "Authentication Subsystem",
        "Status": "Healthy",
        "LatencyMs": 0,
        "Details": "Subsystem resolved and operational.",
        "CheckedAt": "2026-09-07T08:07:41.802487689Z"
      },
      {
        "ComponentName": "Offer Orchestrator Subsystem",
        "Status": "Healthy",
        "LatencyMs": 0,
        "Details": "Subsystem resolved and operational.",
        "CheckedAt": "2026-09-07T08:07:41.802500949Z"
      },
      {
        "ComponentName": "eSignature Crypto Subsystem",
        "Status": "Healthy",
        "LatencyMs": 0,
        "Details": "Subsystem resolved and operational.",
        "CheckedAt": "2026-09-07T08:07:41.802502879Z"
      },
      {
        "ComponentName": "Notification Routing Subsystem",
        "Status": "Healthy",
        "LatencyMs": 0,
        "Details": "Subsystem resolved and operational.",
        "CheckedAt": "2026-09-07T08:07:41.802504439Z"
      },
      {
        "ComponentName": "PDF Generator Subsystem",
        "Status": "Healthy",
        "LatencyMs": 0,
        "Details": "Subsystem resolved and operational.",
        "CheckedAt": "2026-09-07T08:07:41.802505869Z"
      }
    ],
    "Timestamp": "2026-09-07T08:07:41.449389702Z"
  },
  "Success": true,
  "Message": "All systems operational and healthy.",
  "StatusCode": 200
}
```

---

## 6. Continuous Deployment & Lifecycle Management

- **GitHub Repository**: [https://github.com/jettspanner123/SignForgeAppCodebaseArchitecture](https://github.com/jettspanner123/SignForgeAppCodebaseArchitecture)
- **Deployment Trigger**: Any push to branch `main` automatically triggers a zero-downtime rolling build on Render.
- **Rollback Procedure**: In the Render Dashboard, navigate to **Deploys** -> Select any prior successful deploy -> Click **Rollback to this deploy**.
- **Cold Starts (Free Tier)**: If the service has no incoming traffic for 15 minutes, Render will spin down the instance. The first request after spin-down will take ~30-45 seconds to boot Spring Boot and initialize HikariCP. Subsequent requests will execute with low millisecond latency.
