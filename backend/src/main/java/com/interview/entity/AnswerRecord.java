package com.interview.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("answer_record")
public class AnswerRecord {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long userId;
    private Long questionId;
    private String userAnswer;
    private Integer isCorrect; // 0-错误, 1-正确
    private Long answerTime; // 答题耗时（毫秒）
    private LocalDateTime createTime;
}

