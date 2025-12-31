# 面试题网站

一个功能完整的面试题网站，使用 Spring Boot 2 + React + MySQL 8 开发。

## 项目概述

本项目是一个面试题管理系统，支持题目管理、用户答题、模拟面试等核心功能。采用前后端分离架构，后端使用 Spring Boot 2，前端使用 React + Ant Design。

## 技术栈

### 后端
- **Spring Boot 2.7.18**：应用框架
- **MyBatis Plus 3.5.3.1**：ORM 框架
- **MySQL 8**：关系型数据库
- **Redis**：缓存数据库
- **JWT**：用户认证
- **Spring Security**：安全框架
- **Lombok**：简化代码
- **SpringDoc**：API 文档

### 前端
- **React 18**：前端框架
- **Ant Design 5**：UI 组件库
- **Zustand**：状态管理
- **React Router 6**：路由管理
- **Axios**：HTTP 客户端
- **Vite**：构建工具

## 功能模块

### 1. 题目管理模块
- 题目分类（按技术栈分类）
- 题目搜索（关键词、分类、难度、标签）
- 题目筛选（难度、标签、发布时间）
- 题目详情（描述、难度、标签、解析）
- 题目操作（添加、编辑、删除）

### 2. 用户功能模块
- 用户认证（登录/注册/退出）
- 用户信息管理
- 答题功能
- 互动功能（点赞、收藏、评论）
- 个人中心

### 3. 管理员模块
- 题目管理（审核、编辑、删除）
- 用户管理（封禁/解禁）
- 分类管理
- 统计分析

### 4. 模拟面试模块
- 随机出题
- 计时功能
- 答题结果
- 历史记录

### 5. 首页与展示模块
- 热门题目
- 分类导航
- 统计信息
- 推荐题目

## 项目结构

```
cursor_interview/
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/interview/
│   │   │   │   ├── config/      # 配置类
│   │   │   │   ├── controller/  # 控制器
│   │   │   │   ├── entity/      # 实体类
│   │   │   │   ├── mapper/      # Mapper接口
│   │   │   │   ├── service/     # 服务层
│   │   │   │   ├── util/        # 工具类
│   │   │   │   ├── vo/          # 视图对象
│   │   │   │   ├── common/      # 通用类
│   │   │   │   └── filter/      # 过滤器
│   │   │   └── resources/
│   │   │       ├── mapper/      # MyBatis XML
│   │   │       └── application.yml
│   │   └── pom.xml
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── components/      # 通用组件
│   │   ├── pages/           # 页面组件
│   │   ├── store/           # 状态管理
│   │   ├── services/        # API 服务
│   │   ├── styles/          # 全局样式
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── database/                # 数据库脚本
│   └── init.sql
└── README.md
```

## 快速开始

### 环境要求

- JDK 8+
- Node.js 18+
- MySQL 8
- Redis
- Maven 3.6+

### 数据库初始化

1. 创建数据库：
```sql
CREATE DATABASE interview_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 执行初始化脚本：
```bash
mysql -u root -p interview_db < database/init.sql
```

### 后端启动

1. 进入后端目录：
```bash
cd backend
```

2. 修改配置文件 `src/main/resources/application.yml`：
   - 配置 MySQL 连接信息
   - 配置 Redis 连接信息
   - 配置 JWT 密钥（生产环境请修改）

3. 启动项目：
```bash
mvn spring-boot:run
```

后端服务将在 `http://localhost:8080` 启动。

### 前端启动

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

前端服务将在 `http://localhost:3000` 启动。

## 默认账号

- **超级管理员**：
  - 用户名：`admin`
  - 密码：`admin123`

> 注意：这是初始化脚本中的默认账号，生产环境请及时修改密码。

## API 文档

启动后端服务后，访问 `http://localhost:8080/api/swagger-ui.html` 查看 API 文档。

## 开发规范

### 后端规范
- 遵循 RESTful API 设计规范
- 统一异常处理
- 统一返回结果格式
- 完善的日志记录

### 前端规范
- 组件化开发
- 状态管理清晰
- 响应式设计
- 性能优化

## 部署

### Docker 部署（推荐）

1. 构建后端镜像：
```bash
cd backend
mvn clean package
docker build -t interview-backend .
```

2. 构建前端镜像：
```bash
cd frontend
npm run build
docker build -t interview-frontend .
```

3. 使用 docker-compose 启动：
```bash
docker-compose up -d
```

### 传统部署

1. 后端：
   - 打包：`mvn clean package`
   - 运行：`java -jar target/interview-backend-1.0.0.jar`

2. 前端：
   - 构建：`npm run build`
   - 部署 `dist` 目录到 Nginx

## 注意事项

1. **安全性**：
   - 生产环境请修改 JWT 密钥
   - 使用 HTTPS
   - 配置 CORS 白名单
   - 防止 SQL 注入、XSS 攻击

2. **性能**：
   - 使用 Redis 缓存热门数据
   - 数据库索引优化
   - 前端懒加载

3. **数据备份**：
   - 定期备份数据库
   - 配置日志轮转

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request。

