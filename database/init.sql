drop database interview_db;

-- 创建数据库
CREATE DATABASE IF NOT EXISTS interview_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE interview_db;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码（加密）',
    `email` VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    `phone` VARCHAR(20) COMMENT '手机号',
    `role` VARCHAR(20) NOT NULL DEFAULT 'USER' COMMENT '角色：USER, ADMIN, SUPER_ADMIN',
    `status` INT NOT NULL DEFAULT 0 COMMENT '状态：0-正常, 1-封禁',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_username` (`username`),
    INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 分类表
CREATE TABLE IF NOT EXISTS `category` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE COMMENT '分类名称',
    `description` VARCHAR(255) COMMENT '分类描述',
    `question_count` INT NOT NULL DEFAULT 0 COMMENT '题目数量',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分类表';

-- 题目表
CREATE TABLE IF NOT EXISTS `question` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL COMMENT '题目标题',
    `content` TEXT NOT NULL COMMENT '题目内容',
    `difficulty` VARCHAR(20) NOT NULL COMMENT '难度：EASY, MEDIUM, HARD',
    `tags` VARCHAR(255) COMMENT '标签（逗号分隔）',
    `analysis` TEXT COMMENT '解析',
    `category_id` BIGINT NOT NULL COMMENT '分类ID',
    `user_id` BIGINT NOT NULL COMMENT '创建用户ID',
    `view_count` INT NOT NULL DEFAULT 0 COMMENT '浏览量',
    `like_count` INT NOT NULL DEFAULT 0 COMMENT '点赞数',
    `collect_count` INT NOT NULL DEFAULT 0 COMMENT '收藏数',
    `comment_count` INT NOT NULL DEFAULT 0 COMMENT '评论数',
    `status` INT NOT NULL DEFAULT 0 COMMENT '状态：0-待审核, 1-已发布, 2-已删除',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_category_id` (`category_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_difficulty` (`difficulty`),
    FULLTEXT INDEX `idx_fulltext` (`title`, `content`, `tags`),
    FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题目表';

-- 答题记录表
CREATE TABLE IF NOT EXISTS `answer_record` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `question_id` BIGINT NOT NULL COMMENT '题目ID',
    `user_answer` TEXT COMMENT '用户答案',
    `is_correct` INT NOT NULL DEFAULT 0 COMMENT '是否正确：0-错误, 1-正确',
    `answer_time` BIGINT COMMENT '答题耗时（毫秒）',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_question_id` (`question_id`),
    INDEX `idx_create_time` (`create_time`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`question_id`) REFERENCES `question`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='答题记录表';

-- 点赞记录表
CREATE TABLE IF NOT EXISTS `like_record` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `question_id` BIGINT NOT NULL COMMENT '题目ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY `uk_user_question` (`user_id`, `question_id`),
    INDEX `idx_question_id` (`question_id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`question_id`) REFERENCES `question`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='点赞记录表';

-- 收藏记录表
CREATE TABLE IF NOT EXISTS `collect_record` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `question_id` BIGINT NOT NULL COMMENT '题目ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY `uk_user_question` (`user_id`, `question_id`),
    INDEX `idx_question_id` (`question_id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`question_id`) REFERENCES `question`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏记录表';

-- 评论表
CREATE TABLE IF NOT EXISTS `comment` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `question_id` BIGINT NOT NULL COMMENT '题目ID',
    `content` TEXT NOT NULL COMMENT '评论内容',
    `parent_id` BIGINT COMMENT '父评论ID（用于回复）',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_question_id` (`question_id`),
    INDEX `idx_parent_id` (`parent_id`),
    INDEX `idx_create_time` (`create_time`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`question_id`) REFERENCES `question`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`parent_id`) REFERENCES `comment`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';

-- 模拟面试表
CREATE TABLE IF NOT EXISTS `mock_interview` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `category_ids` VARCHAR(255) COMMENT '分类ID列表（逗号分隔）',
    `difficulty` VARCHAR(20) COMMENT '难度：EASY, MEDIUM, HARD, ALL',
    `question_count` INT NOT NULL COMMENT '题目数量',
    `score` INT COMMENT '得分',
    `duration` BIGINT COMMENT '总耗时（毫秒）',
    `status` INT NOT NULL DEFAULT 0 COMMENT '状态：0-进行中, 1-已完成',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_create_time` (`create_time`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='模拟面试表';

-- 模拟面试题目表
CREATE TABLE IF NOT EXISTS `mock_interview_question` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `mock_interview_id` BIGINT NOT NULL COMMENT '模拟面试ID',
    `question_id` BIGINT NOT NULL COMMENT '题目ID',
    `user_answer` TEXT COMMENT '用户答案',
    `is_correct` INT NOT NULL DEFAULT 0 COMMENT '是否正确：0-错误, 1-正确',
    `answer_time` BIGINT COMMENT '答题耗时（毫秒）',
    INDEX `idx_mock_interview_id` (`mock_interview_id`),
    FOREIGN KEY (`mock_interview_id`) REFERENCES `mock_interview`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`question_id`) REFERENCES `question`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='模拟面试题目表';

-- 初始化分类数据
INSERT INTO `category` (`name`, `description`) VALUES
('redis', 'Redis相关面试题'),
('springboot', 'Spring Boot相关面试题'),
('netty', 'Netty相关面试题'),
('springcloud', 'Spring Cloud相关面试题'),
('jvm', 'JVM相关面试题');

-- 角色表（RBAC模型核心表）
CREATE TABLE IF NOT EXISTS `role` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `role_name` VARCHAR(50) NOT NULL COMMENT '角色名称（如：超级管理员、普通管理员）',
    `role_code` VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码（唯一，如：SUPER_ADMIN、ADMIN、USER）',
    `description` VARCHAR(200) COMMENT '角色描述',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态（0：禁用，1：正常）',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_role_code` (`role_code`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 用户-角色关联表（实现用户与角色的多对多关联）
CREATE TABLE IF NOT EXISTS `user_role` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL COMMENT '关联用户表id',
    `role_id` BIGINT NOT NULL COMMENT '关联角色表id',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY `uk_user_role` (`user_id`, `role_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_role_id` (`role_id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户-角色关联表';

-- 权限资源表（优化后的结构，支持树形结构和更细粒度控制）
CREATE TABLE IF NOT EXISTS `permission` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `perm_name` VARCHAR(50) NOT NULL COMMENT '权限名称（如：删除用户、用户管理页面）',
    `perm_code` VARCHAR(100) NOT NULL UNIQUE COMMENT '权限编码（唯一，使用冒号分层命名，如：system:user:delete、system:user:page）',
    `perm_type` TINYINT NOT NULL COMMENT '权限类型（1：页面权限，2：按钮权限，3：接口权限）',
    `parent_id` BIGINT DEFAULT 0 COMMENT '父权限ID（用于页面权限分级，如：用户管理菜单是删除用户按钮的父权限，0表示顶级）',
    `interface_path` VARCHAR(200) COMMENT '接口路径（仅perm_type=3时有效，如：/api/system/user/delete）',
    `request_method` VARCHAR(10) COMMENT '请求方法（仅perm_type=3时有效，如：POST、GET、PUT、DELETE）',
    `route_path` VARCHAR(100) COMMENT '前端路由路径（仅perm_type=1时有效，如：/system/user）',
    `description` VARCHAR(255) COMMENT '权限描述',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态（0：禁用，1：正常）',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_perm_code` (`perm_code`),
    INDEX `idx_perm_type` (`perm_type`),
    INDEX `idx_parent_id` (`parent_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限资源表';

-- 角色-权限关联表（实现角色与权限的多对多关联）
CREATE TABLE IF NOT EXISTS `role_permission` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `role_id` BIGINT NOT NULL COMMENT '关联角色表id',
    `perm_id` BIGINT NOT NULL COMMENT '关联权限表id',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY `uk_role_permission` (`role_id`, `perm_id`),
    INDEX `idx_role_id` (`role_id`),
    INDEX `idx_perm_id` (`perm_id`),
    FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`perm_id`) REFERENCES `permission`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色-权限关联表';

-- 初始化角色数据
INSERT INTO `role` (`role_name`, `role_code`, `description`, `status`) VALUES
('超级管理员', 'SUPER_ADMIN', '拥有系统所有权限', 1),
('普通管理员', 'ADMIN', '可以管理用户，但权限受限', 1),
('普通用户', 'USER', '普通用户权限', 1);

-- 初始化权限资源数据（使用冒号分层命名规范）
INSERT INTO `permission` (`perm_name`, `perm_code`, `perm_type`, `parent_id`, `route_path`, `interface_path`, `request_method`, `description`, `status`) VALUES
-- 页面权限（perm_type=1）
('管理员管理页面', 'system:user:page', 1, 0, '/admin-management', NULL, NULL, '管理员管理页面', 1),
('权限配置页面', 'system:permission:page', 1, 0, '/permission-config', NULL, NULL, '权限配置管理页面', 1),

-- 接口权限（perm_type=3）
('获取用户列表', 'system:user:list', 3, 0, NULL, '/admin/users,/super-admin/users', 'GET', '查看所有用户', 1),
('查看用户详情', 'system:user:view', 3, 0, NULL, '/admin/users/*,/super-admin/users/*', 'GET', '查看用户详细信息', 1),
('修改用户信息', 'system:user:modify', 3, 0, NULL, '/super-admin/users/*', 'PUT', '修改用户信息（邮箱、手机号、角色、状态）', 1),
('封禁/解禁用户', 'system:user:ban', 3, 0, NULL, '/admin/users/*/status,/super-admin/users/*/status', 'PUT', '封禁或解禁用户', 1),
('删除用户', 'system:user:delete', 3, 0, NULL, '/super-admin/users/*', 'DELETE', '删除用户', 1),
('重置用户密码', 'system:user:resetPassword', 3, 0, NULL, '/super-admin/users/*/password', 'PUT', '重置用户密码', 1),
('获取权限列表', 'system:permission:list', 3, 0, NULL, '/super-admin/permissions', 'GET', '获取所有权限资源', 1),
('获取角色权限', 'system:permission:role', 3, 0, NULL, '/super-admin/permissions/role/*', 'GET', '获取指定角色的权限', 1),
('更新角色权限', 'system:permission:update', 3, 0, NULL, '/super-admin/permissions/role/*', 'PUT', '更新角色的权限配置', 1),

-- 按钮权限（perm_type=2）
('编辑用户按钮', 'system:user:edit:button', 2, 0, NULL, NULL, NULL, '显示编辑用户按钮', 1),
('删除用户按钮', 'system:user:delete:button', 2, 0, NULL, NULL, NULL, '显示删除用户按钮', 1),
('封禁用户按钮', 'system:user:ban:button', 2, 0, NULL, NULL, NULL, '显示封禁/解禁用户按钮', 1),
('重置密码按钮', 'system:user:resetPassword:button', 2, 0, NULL, NULL, NULL, '显示重置密码按钮', 1),
('添加题目按钮', 'question:add:button', 2, 0, NULL, NULL, NULL, '显示添加题目按钮', 1),
('模拟面试按钮', 'interview:mock:button', 2, 0, NULL, NULL, NULL, '显示模拟面试按钮', 1);

-- 初始化角色权限关联（超级管理员拥有所有权限）
INSERT INTO `role_permission` (`role_id`, `perm_id`) 
SELECT (SELECT id FROM `role` WHERE role_code = 'SUPER_ADMIN'), `id` FROM `permission`;

-- 初始化角色权限关联（普通管理员默认权限）
INSERT INTO `role_permission` (`role_id`, `perm_id`) 
SELECT (SELECT id FROM `role` WHERE role_code = 'ADMIN'), `id` FROM `permission` 
WHERE `perm_code` IN ('system:user:page', 'system:user:list', 'system:user:view', 'system:user:ban', 'system:user:ban:button');

-- 创建超级管理员账号（密码：admin123，需要在实际使用时修改）
-- 注意：这里使用BCrypt加密后的密码，实际密码是 admin123
INSERT INTO `user` (`username`, `password`, `email`, `role`, `status`) VALUES
('admin', '$2a$10$JAv.8hdm.Y/8eZhxv5bSXO/zSYEB8z7RFJHeHPA5jkfvIJQyiQLiO', 'admin@example.com', 'SUPER_ADMIN', 0);

-- 初始化用户-角色关联（超级管理员账号关联超级管理员角色）
INSERT INTO `user_role` (`user_id`, `role_id`) 
SELECT u.id, r.id FROM `user` u, `role` r 
WHERE u.username = 'admin' AND r.role_code = 'SUPER_ADMIN';

