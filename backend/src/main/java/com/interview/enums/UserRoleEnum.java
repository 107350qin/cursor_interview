package com.interview.enums;

import lombok.Getter;

@Getter
public enum UserRoleEnum {
    USER("USER", "普通用户"),
    ADMIN("ADMIN", "管理员");

    private final String roleName;
    private final String roleDesc;

    UserRoleEnum(String roleName, String roleDesc) {
        this.roleName = roleName;
        this.roleDesc = roleDesc;
    }
}
