package com.interview.vo;

import lombok.Data;

import java.util.List;

/**
 * 用户权限信息
 */
@Data
public class Permissions {
    // 是否可以看到所有用户
    private Boolean canViewAllUsers;
    // 是否可以修改用户（除封禁外的其他信息）
    private Boolean canModifyUser;
    // 是否可以封禁用户
    private Boolean canBanUser;
    // 是否可以删除用户
    private Boolean canDeleteUser;
    // 是否可以重置密码
    private Boolean canResetPassword;
    // 是否可以修改角色
    private Boolean canModifyRole;
    // 是否可以修改自己的角色和状态（超级管理员不能）
    private Boolean canModifySelfRoleAndStatus;
    // 权限代码列表（包含所有类型的权限：PAGE、API、BUTTON）
    private List<String> permissionCodes;
}

