package com.interview.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.interview.common.Result;
import com.interview.entity.MockInterview;
import com.interview.entity.MockInterviewQuestion;
import com.interview.entity.Question;
import com.interview.mapper.MockInterviewMapper;
import com.interview.mapper.MockInterviewQuestionMapper;
import com.interview.mapper.QuestionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class MockInterviewService {

    @Autowired
    private MockInterviewMapper mockInterviewMapper;

    @Autowired
    private MockInterviewQuestionMapper mockInterviewQuestionMapper;

    @Autowired
    private QuestionMapper questionMapper;

    @Transactional
    public Result<MockInterview> createMockInterview(Long userId, String categoryIds, String difficulty, Integer questionCount) {
        // 构建查询条件
        QueryWrapper<Question> wrapper = new QueryWrapper<>();
        wrapper.eq("status", 1); // 只查询已发布的题目

        if (categoryIds != null && !categoryIds.isEmpty()) {
            List<Long> categoryIdList = Arrays.stream(categoryIds.split(","))
                    .map(Long::parseLong)
                    .collect(Collectors.toList());
            wrapper.in("category_id", categoryIdList);
        }

        if (difficulty != null && !difficulty.isEmpty() && !"ALL".equals(difficulty)) {
            wrapper.eq("difficulty", difficulty);
        }

        // 获取符合条件的题目
        List<Question> allQuestions = questionMapper.selectList(wrapper);

        if (allQuestions.size() < questionCount) {
            return Result.error(500, "符合条件的题目数量不足");
        }

        // 随机选择题目
        List<Question> selectedQuestions = randomSelect(allQuestions, questionCount);

        // 创建模拟面试记录
        MockInterview mockInterview = new MockInterview();
        mockInterview.setUserId(userId);
        mockInterview.setCategoryIds(categoryIds);
        mockInterview.setDifficulty(difficulty);
        mockInterview.setQuestionCount(questionCount);
        mockInterview.setStatus(0); // 进行中
        mockInterview.setCreateTime(LocalDateTime.now());
        mockInterview.setUpdateTime(LocalDateTime.now());
        mockInterviewMapper.insert(mockInterview);

        // 创建模拟面试题目记录
        for (Question question : selectedQuestions) {
            MockInterviewQuestion miq = new MockInterviewQuestion();
            miq.setMockInterviewId(mockInterview.getId());
            miq.setQuestionId(question.getId());
            mockInterviewQuestionMapper.insert(miq);
        }

        return Result.success("模拟面试创建成功", mockInterview);
    }

    @Transactional
    public Result<MockInterview> submitMockInterview(Long mockInterviewId, Long userId, List<MockInterviewQuestion> answers) {
        MockInterview mockInterview = mockInterviewMapper.selectById(mockInterviewId);
        if (mockInterview == null || !mockInterview.getUserId().equals(userId)) {
            return Result.error(404, "模拟面试不存在");
        }

        if (mockInterview.getStatus() == 1) {
            return Result.error(500, "模拟面试已完成");
        }

        int correctCount = 0;
        long totalTime = 0;

        // 更新答题记录
        for (MockInterviewQuestion answer : answers) {
            MockInterviewQuestion miq = mockInterviewQuestionMapper.selectById(answer.getId());
            if (miq == null || !miq.getMockInterviewId().equals(mockInterviewId)) {
                continue;
            }

            Question question = questionMapper.selectById(miq.getQuestionId());
            if (question == null) {
                continue;
            }

            miq.setUserAnswer(answer.getUserAnswer());
            miq.setAnswerTime(answer.getAnswerTime());
            
            // 简单的答案判断（实际应该根据题目类型进行更复杂的判断）
            boolean isCorrect = checkAnswer(question, answer.getUserAnswer());
            miq.setIsCorrect(isCorrect ? 1 : 0);
            
            if (isCorrect) {
                correctCount++;
            }
            if (answer.getAnswerTime() != null) {
                totalTime += answer.getAnswerTime();
            }

            mockInterviewQuestionMapper.updateById(miq);
        }

        // 计算得分
        int score = (int) (correctCount * 100.0 / mockInterview.getQuestionCount());

        // 更新模拟面试记录
        mockInterview.setScore(score);
        mockInterview.setDuration(totalTime);
        mockInterview.setStatus(1); // 已完成
        mockInterview.setUpdateTime(LocalDateTime.now());
        mockInterviewMapper.updateById(mockInterview);

        return Result.success("提交成功", mockInterview);
    }

    public Result<MockInterview> getMockInterview(Long mockInterviewId, Long userId) {
        MockInterview mockInterview = mockInterviewMapper.selectById(mockInterviewId);
        if (mockInterview == null || !mockInterview.getUserId().equals(userId)) {
            return Result.error(404, "模拟面试不存在");
        }
        return Result.success(mockInterview);
    }

    public Result<IPage<MockInterview>> getMockInterviewHistory(Long userId, Integer page, Integer size) {
        Page<MockInterview> pageParam = new Page<>(page, size);
        QueryWrapper<MockInterview> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        wrapper.orderByDesc("create_time");
        
        IPage<MockInterview> result = mockInterviewMapper.selectPage(pageParam, wrapper);
        return Result.success(result);
    }

    public Result<List<Question>> getMockInterviewQuestions(Long mockInterviewId, Long userId) {
        MockInterview mockInterview = mockInterviewMapper.selectById(mockInterviewId);
        if (mockInterview == null || !mockInterview.getUserId().equals(userId)) {
            return Result.error(404, "模拟面试不存在");
        }

        QueryWrapper<MockInterviewQuestion> wrapper = new QueryWrapper<>();
        wrapper.eq("mock_interview_id", mockInterviewId);
        List<MockInterviewQuestion> miqs = mockInterviewQuestionMapper.selectList(wrapper);

        List<Question> questions = new ArrayList<>();
        for (MockInterviewQuestion miq : miqs) {
            Question question = questionMapper.selectById(miq.getQuestionId());
            if (question != null) {
                questions.add(question);
            }
        }

        return Result.success(questions);
    }

    private List<Question> randomSelect(List<Question> questions, int count) {
        List<Question> result = new ArrayList<>();
        Random random = new Random();
        List<Integer> indices = new ArrayList<>();
        
        for (int i = 0; i < count; i++) {
            int index;
            do {
                index = random.nextInt(questions.size());
            } while (indices.contains(index));
            indices.add(index);
            result.add(questions.get(index));
        }
        
        return result;
    }

    private boolean checkAnswer(Question question, String userAnswer) {
        // 这里应该根据题目的实际类型进行答案判断
        // 目前简单实现，实际应该更复杂
        if (userAnswer == null || userAnswer.trim().isEmpty()) {
            return false;
        }
        // 可以扩展为支持多种答案格式的判断
        return true; // 简化实现
    }
}

