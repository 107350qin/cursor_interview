package com.interview.annotation;

public enum UserRoleEnum {

    USER("USER", "普通用户"),
    ADMIN("ADMIN", "管理员"),
    SUPER_ADMIN("SUPER_ADMIN", "超级管理员");

    private final String value;
    private final String name;

    UserRoleEnum(String value, String name) {
        this.value = value;
        this.name = name;
    }   

    public String getValue() {
        return value;
    }

    public String getName() {
        return name;
    }
}
