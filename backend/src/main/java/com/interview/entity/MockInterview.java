package com.interview.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("mock_interview")
public class MockInterview {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long userId;
    private String categoryIds; // 逗号分隔的分类ID
    private String difficulty; // EASY, MEDIUM, HARD, ALL
    private Integer questionCount;
    private Integer score; // 得分
    private Long duration; // 总耗时（毫秒）
    private Integer status; // 0-进行中, 1-已完成
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}

