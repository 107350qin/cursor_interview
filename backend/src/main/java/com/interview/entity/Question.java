package com.interview.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("question")
public class Question {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String title;
    private String difficulty; // EASY, MEDIUM, HARD
    private String tags; // 逗号分隔
    private String analysis;
    private Long categoryId;
    
    // 临时字段，用于接收前端传递的分类名称（新分类）
    @TableField(exist = false)
    private String categoryName;
    
    private Long userId;
    private Integer viewCount;
    private Integer likeCount;
    private Integer collectCount;
    private Integer commentCount;
    private Integer status; // 0-待审核, 1-已发布, 2-已删除
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}

