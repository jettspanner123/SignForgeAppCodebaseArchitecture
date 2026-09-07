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
