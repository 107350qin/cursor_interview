package com.interview.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;



@Data
@TableName("comment")
public class Comment {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long userId;
    private Long questionId;
    private String content;
    private Long parentId; // 父评论ID，用于回复
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}

