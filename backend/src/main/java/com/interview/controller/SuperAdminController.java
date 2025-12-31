package com.interview.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.interview.annotation.RequireRole;
import com.interview.annotation.UserRoleEnum;
import com.interview.common.Result;
import com.interview.entity.User;
import com.interview.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/super-admin")
public class SuperAdminController {

    @Autowired
    private UserService userService;

    /**
     * 获取所有用户列表（超级管理员可以查看所有用户，包括USER、ADMIN、SUPER_ADMIN）
     */
    @GetMapping("/users")
    public Result<Page<User>> getAllUsers(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            Authentication authentication) {
        // 超级管理员可以查看所有用户，不需要验证角色（已在SecurityConfig中配置）
        return userService.getAllUsers(page, size, keyword, role);
    }

    /**
     * 更新用户信息（可以更新所有用户，但不能修改自己的角色和状态）
     */
    @PutMapping("/users/{userId}")
    public Result<User> updateUser(
            @PathVariable Long userId,
            @RequestBody User userUpdate,
            Authentication authentication) {
        Long operatorId = (Long) authentication.getPrincipal();
        String operatorRole = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        return userService.updateUser(userId, userUpdate, operatorId, operatorRole);
    }

    /**
     * 删除用户（可以删除所有用户，但不能删除自己）
     */
    @DeleteMapping("/users/{userId}")
    public Result<Void> deleteUser(
            @PathVariable Long userId,
            Authentication authentication) {
        Long operatorId = (Long) authentication.getPrincipal();
        String operatorRole = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        return userService.deleteUser(userId, operatorId, operatorRole);
    }

    /**
     * 封禁/解禁用户（可以封禁/解禁所有用户，但不能修改自己的状态）
     */
    @PutMapping("/users/{userId}/status")
    public Result<User> banOrUnbanUser(
            @PathVariable Long userId,
            @RequestParam Integer status,
            Authentication authentication) {
        Long operatorId = (Long) authentication.getPrincipal();
        String operatorRole = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        return userService.banOrUnbanUser(userId, status, operatorId, operatorRole);
    }

    /**
     * 重置用户密码（可以重置所有用户的密码）
     */
    @PutMapping("/users/{userId}/password")
    public Result<Void> resetUserPassword(
            @PathVariable Long userId,
            @RequestBody PasswordResetRequest request,
            Authentication authentication) {
        Long operatorId = (Long) authentication.getPrincipal();
        String operatorRole = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        return userService.resetUserPassword(userId, request.getNewPassword(), operatorId, operatorRole);
    }

    /**
     * 批量删除用户
     */
    @DeleteMapping("/users/batch")
    @RequireRole(UserRoleEnum.SUPER_ADMIN)
    public Result<Void> batchDeleteUsers(
            @RequestBody BatchDeleteRequest request,
            Authentication authentication) {
        Long operatorId = (Long) authentication.getPrincipal();
        String operatorRole = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        return userService.batchDeleteUsers(request.getUserIds(), operatorId, operatorRole);
    }

    /**
     * 密码重置请求对象
     */
    public static class PasswordResetRequest {
        private String newPassword;

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }

    /**
     * 批量删除请求对象
     */
    public static class BatchDeleteRequest {
        private List<Long> userIds;

        public List<Long> getUserIds() {
            return userIds;
        }

        public void setUserIds(List<Long> userIds) {
            this.userIds = userIds;
        }
    }
}

