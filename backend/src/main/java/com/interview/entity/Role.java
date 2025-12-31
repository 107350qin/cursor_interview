package com.interview.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("role")
public class Role {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String roleName; // 角色名称
    private String roleCode; // 角色编码（唯一）
    private String description; // 角色描述
    private Integer status; // 状态（0：禁用，1：正常）
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}

