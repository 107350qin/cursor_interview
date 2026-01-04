package com.interview.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;


@Data
@TableName("question")
public class Question {
    @TableId(type = IdType.AUTO)
    private Long id;

    @NotBlank(message = "标题不能为空")
    private String title;
    private String difficulty; // EASY, MEDIUM, HARD
    private String tags; // 逗号分隔
    private String analysis;
    @NotBlank(message = "分类不能为空")
    private String categoryName;
    private LocalDateTime createTime;
    private Long userId;
}

