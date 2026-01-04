package com.interview.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.interview.common.Result;
import com.interview.common.ResultCode;
import com.interview.entity.Question;
import com.interview.entity.User;
import com.interview.enums.UserRoleEnum;
import com.interview.enums.UserStatusEnum;
import com.interview.mapper.QuestionMapper;
import com.interview.mapper.UserMapper;
import com.interview.vo.QuestionCategoryCountDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    @Resource
    private UserMapper userMapper;

    @Resource
    private QuestionMapper questionMapper;

    public Result<IPage<Question>> getQuestions(Integer page, Integer size, String categoryName, String difficulty,
                                                String keyword) {
        Page<Question> pageParam = new Page<>(page, size);
        QueryWrapper<Question> wrapper = new QueryWrapper<>();
        if (categoryName != null) {
            wrapper.eq("category_name", categoryName);
        }
        if (difficulty != null && !difficulty.isEmpty()) {
            wrapper.eq("difficulty", difficulty);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like("title", keyword).or().like("tags", keyword));
        }
        wrapper.orderByDesc("create_time");
        IPage<Question> result = questionMapper.selectPage(pageParam, wrapper);
        return Result.success(result);
    }

    public Result<Question> getQuestionById(Long id) {
        Question question = questionMapper.selectById(id);
        if (question == null) {
            return Result.error(ResultCode.QUESTION_NOT_FOUND.getCode(), ResultCode.QUESTION_NOT_FOUND.getMessage());
        }
        return Result.success(question);
    }

    /**
     * 验证用户是否存在且状态正常
     */
    private Result<String> validateUser(Long userId) {
        if (userId == null) {
            return Result.error(ResultCode.USER_NOT_FOUND.getCode(), ResultCode.USER_NOT_FOUND.getMessage());
        }
        User user = userMapper.selectById(userId);
        if (user == null) {
            return Result.error(ResultCode.USER_NOT_FOUND.getCode(), ResultCode.USER_NOT_FOUND.getMessage());
        } else if (user.getStatus().equals(UserStatusEnum.NEW.name())) {
            return Result.error(ResultCode.USER_NOT_ACTIVE.getCode(), ResultCode.USER_NOT_ACTIVE.getMessage());
        }
        return Result.success("用户验证成功", null);
    }

    @Transactional
    public Result<String> createQuestion(Question question, Long userId) {
        Result<String> userResult = validateUser(userId);
        if (!userResult.getCode().equals(ResultCode.SUCCESS.getCode())) {
            return userResult;
        }
        question.setUserId(userId);
        questionMapper.insert(question);
        return Result.success("题目创建成功");
    }

    @Transactional
    public Result<String> updateQuestion(Question question, Long userId, String role) {
        Result<String> userResult = validateUser(userId);
        if (!userResult.getCode().equals(ResultCode.SUCCESS.getCode())) {
            return userResult;
        }
        Question existing = questionMapper.selectById(question.getId());
        if (existing == null) {
            return Result.error(ResultCode.QUESTION_NOT_FOUND.getCode(), ResultCode.QUESTION_NOT_FOUND.getMessage());
        }
        // 只有题目创建者或管理员可以编辑
        if (!existing.getUserId().equals(userId) && !UserRoleEnum.ADMIN.getRoleName().equals(role)) {
            return Result.error(ResultCode.PERMISSION_DENIED.getCode(), ResultCode.PERMISSION_DENIED.getMessage());
        }
        questionMapper.updateById(question);
        return Result.success("题目更新成功");
    }

    @Transactional
    public Result<String> deleteQuestion(Long id, Long userId, String role) {
        Result<String> userResult = validateUser(userId);
        if (!userResult.getCode().equals(ResultCode.SUCCESS.getCode())) {
            return userResult;
        }
        Question question = questionMapper.selectById(id);
        if (question == null) {
            return Result.error(ResultCode.QUESTION_NOT_FOUND.getCode(), ResultCode.QUESTION_NOT_FOUND.getMessage());
        }

        // 只有题目创建者或管理员可以删除
        if (!question.getUserId().equals(userId) && !UserRoleEnum.ADMIN.getRoleName().equals(role)) {
            return Result.error(ResultCode.PERMISSION_DENIED.getCode(), ResultCode.PERMISSION_DENIED.getMessage());
        }
        questionMapper.deleteById(question);
        return Result.success("题目删除成功");
    }

    public Result<Set<String>> getCategories() {
        // 查询所有题目分类
        Set<String> categories = questionMapper.selectCategoryNames();
        return Result.success(categories);
    }

    public List<QuestionCategoryCountDTO> getCategoryStatistic() {
        // 查询每种分类有多少个问题
        return questionMapper.selectCategoryStatistic();
    }

    public List<Question> getMockInterviewQuestions(String categoryNames, String difficulty, Integer questionCount) {
        QueryWrapper<Question> wrapper = new QueryWrapper<>();
        if (StringUtils.hasText(categoryNames)) {
            List<String> categoryList = Arrays.asList(categoryNames.split(","));
            wrapper.in("category_name", categoryList);
        }
        if (StringUtils.hasText(difficulty)) {
            wrapper.eq("difficulty", difficulty);
        }
        // 查询随机的100道题目
        wrapper.orderByDesc("rand()");
        wrapper.last("limit " + questionCount);
        // 执行查询
        return questionMapper.selectList(wrapper);
    }
}
