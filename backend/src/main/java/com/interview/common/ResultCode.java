package com.interview.common;

public enum ResultCode {
    SUCCESS(200, "操作成功"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),
    INTERNAL_ERROR(500, "服务器内部错误"),
    
    // 用户相关
    USER_NOT_FOUND(1001, "用户不存在"),
    USER_ALREADY_EXISTS(1002, "用户已存在"),
    PASSWORD_ERROR(1003, "密码错误"),
    
    // 题目相关
    QUESTION_NOT_FOUND(2001, "题目不存在"),
    QUESTION_ALREADY_LIKED(2002, "已经点赞过了"),
    QUESTION_NOT_LIKED(2003, "未点赞"),
    QUESTION_CATEGORY_NOT_FOUND(2004, "问题分类不存在"),

    // 权限相关
    PERMISSION_DENIED(3001, "权限不足");

    private final Integer code;
    private final String message;

    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }

    public Integer getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}

