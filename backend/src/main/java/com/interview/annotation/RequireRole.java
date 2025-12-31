package com.interview.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 角色权限注解
 * 用于标记需要特定角色才能访问的接口
 * 
 * 角色ID说明：
 * - 1: 超级管理员
 * - 2: 管理员
 * - 3: 普通用户（已登录）
 * 
 * 如果不加此注解，则允许游客访问
 * 
 * 注意：只能用于方法上，不能用于类上
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRole {
    /**
     * 需要的角色名称
     * USER: 普通用户
     * ADMIN: 管理员
     * SUPER_ADMIN: 超级管理员
     */
    UserRoleEnum value() default UserRoleEnum.USER;
}
