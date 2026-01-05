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
FROM adoptopenjdk:8-jre-hotspot
WORKDIR /app

# 安装curl用于健康检查
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# 创建非root用户
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# 复制构建产物
COPY --from=build /app/target/*.jar app.jar

# 设置权限
RUN chown -R appuser:appgroup /app

# 暴露端口
ENV SERVER_PORT=8080
ENV DB_HOST=mysql6.sqlpub.com
ENV DB_PORT=3311
ENV DB_USERNAME=qinmeng
ENV DB_PASSWORD=IXZ2Bfy99dwdRf8P


EXPOSE ${SERVER_PORT}

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${SERVER_PORT}/api/actuator/health || exit 1


# 切换到非root用户
USER appuser

# 启动应用
ENTRYPOINT ["java", "-jar", "app.jar"]
