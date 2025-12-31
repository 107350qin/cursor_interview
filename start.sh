#!/bin/bash

echo "启动面试题网站项目..."

# 检查MySQL是否运行
if ! pgrep -x "mysqld" > /dev/null; then
    echo "请确保MySQL已启动"
fi

# 检查Redis是否运行
if ! pgrep -x "redis-server" > /dev/null; then
    echo "请确保Redis已启动"
fi

# 启动后端
echo "启动后端服务..."
cd backend
mvn spring-boot:run &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 10

# 启动前端
echo "启动前端服务..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo "后端服务 PID: $BACKEND_PID"
echo "前端服务 PID: $FRONTEND_PID"
echo "后端地址: http://localhost:8080"
echo "前端地址: http://localhost:3000"

# 等待用户中断
wait

