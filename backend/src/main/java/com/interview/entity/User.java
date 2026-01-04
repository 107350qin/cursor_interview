package com.interview.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import javax.validation.constraints.NotBlank;


@Data
@TableName("user")
public class User {
    @NotBlank(message = "id不能为空")
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String username;
    private String password;
    private String email;
    private String phone;
    private String role; // USER, ADMIN
    @NotBlank(message = "状态不能为空")
    private String status; // NEW, OK
}

