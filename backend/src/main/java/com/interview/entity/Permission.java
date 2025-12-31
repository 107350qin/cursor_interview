package com.interview.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("permission")
public class Permission {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String permName; // 权限名称
    private String permCode; // 权限编码（唯一，使用冒号分层命名）
    private Integer permType; // 权限类型（1：页面权限，2：按钮权限，3：接口权限）
    private Long parentId; // 父权限ID（用于权限分级，0表示顶级）
    private String interfacePath; // 接口路径（仅perm_type=3时有效）
    private String requestMethod; // 请求方法（仅perm_type=3时有效）
    private String routePath; // 前端路由路径（仅perm_type=1时有效）
    private String description; // 权限描述
    private Integer status; // 状态（0：禁用，1：正常）
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}

