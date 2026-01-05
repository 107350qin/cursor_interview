# 第一阶段：构建阶段
FROM maven:3.8-openjdk-8 AS build
WORKDIR /app

# 缓存依赖
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 编译项目
COPY src ./src
RUN mvn clean package -DskipTests

# 第二阶段：运行阶段
FROM openjdk:8-jre-alpine
WORKDIR /app

# 创建非root用户
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# 复制构建产物
COPY --from=build /app/target/*.jar app.jar

# 设置权限
RUN chown -R appuser:appgroup /app

# 暴露端口
ENV SERVER_PORT=8080

EXPOSE ${SERVER_PORT}

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:${SERVER_PORT}/api/actuator/health || exit 1


# 切换到非root用户
USER appuser

# 启动应用
ENTRYPOINT ["java", "-jar", "app.jar", \
            "--server.port=${SERVER_PORT}", \
            "--spring.datasource.url=${DB_URL}", \
            "--spring.datasource.username=${DB_USERNAME}", \
            "--spring.datasource.password=${DB_PASSWORD}"]
