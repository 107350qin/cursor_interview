package com.interview.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.interview.common.Result;
import com.interview.entity.CollectRecord;
import com.interview.entity.Question;
import com.interview.mapper.CollectRecordMapper;
import com.interview.mapper.QuestionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class CollectService {

    @Autowired
    private CollectRecordMapper collectRecordMapper;

    @Autowired
    private QuestionMapper questionMapper;

    @Transactional
    public Result<Void> collectQuestion(Long questionId, Long userId) {
        // 检查是否已收藏
        QueryWrapper<CollectRecord> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).eq("question_id", questionId);
        if (collectRecordMapper.selectOne(wrapper) != null) {
            return Result.error(500, "已经收藏过了");
        }

        // 添加收藏记录
        CollectRecord collectRecord = new CollectRecord();
        collectRecord.setUserId(userId);
        collectRecord.setQuestionId(questionId);
        collectRecord.setCreateTime(LocalDateTime.now());
        collectRecordMapper.insert(collectRecord);

        // 更新题目收藏数
        Question question = questionMapper.selectById(questionId);
        if (question != null) {
            question.setCollectCount(question.getCollectCount() + 1);
            questionMapper.updateById(question);
        }

        return Result.success("收藏成功", null);
    }

    @Transactional
    public Result<Void> uncollectQuestion(Long questionId, Long userId) {
        QueryWrapper<CollectRecord> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).eq("question_id", questionId);
        CollectRecord collectRecord = collectRecordMapper.selectOne(wrapper);
        
        if (collectRecord == null) {
            return Result.error(500, "未收藏");
        }

        // 删除收藏记录
        collectRecordMapper.deleteById(collectRecord.getId());

        // 更新题目收藏数
        Question question = questionMapper.selectById(questionId);
        if (question != null && question.getCollectCount() > 0) {
            question.setCollectCount(question.getCollectCount() - 1);
            questionMapper.updateById(question);
        }

        return Result.success("取消收藏成功", null);
    }

    public Result<Boolean> isCollected(Long questionId, Long userId) {
        QueryWrapper<CollectRecord> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).eq("question_id", questionId);
        boolean collected = collectRecordMapper.selectOne(wrapper) != null;
        return Result.success(collected);
    }
}

