FROM openjdk:17-jdk-slim

WORKDIR /app

COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

RUN chmod +x mvnw && \
    ./mvnw dependency:go-offline

COPY . .

RUN ./mvnw clean package -DskipTests

FROM openjdk:17-jdk-slim

WORKDIR /app

COPY --from=0 /app/target/workshop-platform-1.0.0.jar app.jar

EXPOSE 8081

CMD ["java", "-jar", "app.jar"]
