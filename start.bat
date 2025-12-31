@echo off
echo 启动面试题网站项目...

echo 启动后端服务...
cd backend
start "后端服务" cmd /k "mvn spring-boot:run"
cd ..

timeout /t 10 /nobreak

echo 启动前端服务...
cd frontend
call npm install
start "前端服务" cmd /k "npm run dev"
cd ..

echo 后端地址: http://localhost:8080
echo 前端地址: http://localhost:3000
pause

