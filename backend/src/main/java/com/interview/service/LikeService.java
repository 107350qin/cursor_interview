package com.interview.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.interview.common.Result;
import com.interview.common.ResultCode;
import com.interview.entity.LikeRecord;
import com.interview.entity.Question;
import com.interview.mapper.LikeRecordMapper;
import com.interview.mapper.QuestionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class LikeService {

    @Autowired
    private LikeRecordMapper likeRecordMapper;

    @Autowired
    private QuestionMapper questionMapper;

    @Transactional
    public Result<Void> likeQuestion(Long questionId, Long userId) {
        // 检查是否已点赞
        QueryWrapper<LikeRecord> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).eq("question_id", questionId);
        if (likeRecordMapper.selectOne(wrapper) != null) {
            return Result.error(ResultCode.QUESTION_ALREADY_LIKED.getCode(), ResultCode.QUESTION_ALREADY_LIKED.getMessage());
        }

        // 添加点赞记录
        LikeRecord likeRecord = new LikeRecord();
        likeRecord.setUserId(userId);
        likeRecord.setQuestionId(questionId);
        likeRecord.setCreateTime(LocalDateTime.now());
        likeRecordMapper.insert(likeRecord);

        // 更新题目点赞数
        Question question = questionMapper.selectById(questionId);
        if (question != null) {
            question.setLikeCount(question.getLikeCount() + 1);
            questionMapper.updateById(question);
        }

        return Result.success("点赞成功", null);
    }

    @Transactional
    public Result<Void> unlikeQuestion(Long questionId, Long userId) {
        QueryWrapper<LikeRecord> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).eq("question_id", questionId);
        LikeRecord likeRecord = likeRecordMapper.selectOne(wrapper);
        
        if (likeRecord == null) {
            return Result.error(ResultCode.QUESTION_NOT_LIKED.getCode(), ResultCode.QUESTION_NOT_LIKED.getMessage());
        }

        // 删除点赞记录
        likeRecordMapper.deleteById(likeRecord.getId());

        // 更新题目点赞数
        Question question = questionMapper.selectById(questionId);
        if (question != null && question.getLikeCount() > 0) {
            question.setLikeCount(question.getLikeCount() - 1);
            questionMapper.updateById(question);
        }

        return Result.success("取消点赞成功", null);
    }

    public Result<Boolean> isLiked(Long questionId, Long userId) {
        QueryWrapper<LikeRecord> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).eq("question_id", questionId);
        boolean liked = likeRecordMapper.selectOne(wrapper) != null;
        return Result.success(liked);
    }
}

