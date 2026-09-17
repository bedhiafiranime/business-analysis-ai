# Stage 1: Build the application
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

# Copy the maven wrapper and pom.xml
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Give execution permission to the wrapper
RUN chmod +x mvnw

# Download dependencies (this step is cached if pom.xml doesn't change)
RUN ./mvnw dependency:go-offline

# Copy the source code
COPY src ./src

# Build the application, skipping tests
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre AS runner

WORKDIR /app

# Copy the built JAR file from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Start the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
