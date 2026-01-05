@echo off
REM 设置UTF-8编码以支持中文输出
chcp 65001 >nul 2>&1
REM 启用延迟变量扩展以支持动态变量
setlocal enabledelayedexpansion

echo ====================================
echo Interview System - Service Starter
echo ====================================

REM 检查Java是否安装
where java >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java is not installed or not in PATH
    echo [INFO] Please install Java 8 or higher and add it to system PATH
    pause
    exit /b 1
) else (
    echo [INFO] Java found: %JAVA_HOME%
)

REM 检查npm是否安装
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed or not in PATH
    echo [INFO] Please install Node.js and add npm to system PATH
    pause
    exit /b 1
) else (
    echo [INFO] npm found, proceeding...
)

set "JAVA_OPTS=-Xms256m -Xmx512m"
set "JAVA_OPTS=%JAVA_OPTS% -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=256m"
echo [INFO] Java options set: %JAVA_OPTS%

REM 查找JAR文件
set "BACKEND_DIR=backend\target"
set "JAR_FILE="

if not exist "%BACKEND_DIR%" (
    echo [ERROR] Backend target directory does not exist: %BACKEND_DIR%
    echo [INFO] Please run 'mvn clean package -DskipTests' in backend directory first
    pause
    exit /b 1
)

echo [INFO] Searching for JAR files in: %BACKEND_DIR%
for %%f in ("%BACKEND_DIR%\*.jar") do (
    if exist "%%f" (
        if not "%%~nf" == "%%~nf.original" (
            set "JAR_FILE=%%f"
            echo [INFO] Found JAR file: !JAR_FILE!
            goto :jar_found
        )
    )
)

:jar_found
if "%JAR_FILE%" == "" (
    echo [ERROR] No JAR file found in %BACKEND_DIR%
    echo [INFO] Please run 'mvn clean package -DskipTests' in backend directory first
    echo [INFO] This will compile the backend code and generate the JAR file
    pause
    exit /b 1
)

REM 启动后端服务
echo [INFO] Starting backend service...
start "BackendService" cmd /k "java %JAVA_OPTS% -jar "%JAR_FILE%""

REM 等待后端服务启动
echo [INFO] Waiting for backend service to initialize...
timeout /t 10 /nobreak >nul

REM 启动前端服务
echo [INFO] Starting frontend service...
if not exist "frontend" (
    echo [ERROR] Frontend directory does not exist
    pause
    exit /b 1
)

cd frontend
if not exist "package.json" (
    echo [ERROR] package.json not found in frontend directory
    echo [INFO] Please check if the frontend project is properly initialized
    pause
    exit /b 1
)

start "FrontendService" cmd /k "npm run dev"

cd ..
echo ====================================
echo [SUCCESS] Services started successfully!
echo ====================================
echo [INFO] Backend Service: http://localhost:8080
echo [INFO] Frontend Service: http://localhost:3000
echo ====================================
echo [INFO] How to stop services:
echo [INFO] 1. Close the BackendService window
echo [INFO] 2. Close the FrontendService window
echo ====================================
echo Press any key to exit...
pause >nul
