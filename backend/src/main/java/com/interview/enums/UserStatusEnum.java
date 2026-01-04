package com.interview.enums;

import lombok.Getter;

@Getter
public enum UserStatusEnum {
    NEW("NEW", "新建状态"), OK("OK", "可用状态");

    private final String statusName;
    private final String statusDesc;

    UserStatusEnum(String statusName, String statusDesc) {
        this.statusName = statusName;
        this.statusDesc = statusDesc;
    }
}
