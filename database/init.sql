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
    `role` VARCHAR(20) NOT NULL DEFAULT 'USER' COMMENT '角色：USER, ADMIN',
    `status` VARCHAR(5) NOT NULL DEFAULT 'NEW' COMMENT '状态：NEW-新建, OK-正常',
    INDEX `idx_username` (`username`),
    INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 题目表
CREATE TABLE IF NOT EXISTS `question` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL COMMENT '题目标题',
    `difficulty` VARCHAR(20) NOT NULL COMMENT '难度：EASY, MEDIUM, HARD',
    `tags` VARCHAR(255) COMMENT '标签（逗号分隔）',
    `analysis` TEXT COMMENT '解析',
    `category_name` VARCHAR(50) NOT NULL COMMENT '分类名称',
    `user_id` BIGINT NOT NULL COMMENT '创建用户ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX `idx_user_id` (`user_id`),
    FULLTEXT INDEX `idx_fulltext` (`title`, `category_name`, `tags`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题目表';

-- 创建超级管理员账号（密码：admin123，需要在实际使用时修改）
-- 注意：这里使用BCrypt加密后的密码，实际密码是 admin123
INSERT INTO `user` (`username`, `password`, `email`, `role`, `status`) VALUES
('admin', '$2a$10$JAv.8hdm.Y/8eZhxv5bSXO/zSYEB8z7RFJHeHPA5jkfvIJQyiQLiO', '1654400317@qq.com', 'ADMIN', 'OK');

