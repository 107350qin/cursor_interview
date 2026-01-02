package com.interview.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.interview.common.Result;
import com.interview.common.ResultCode;
import com.interview.entity.Category;
import com.interview.entity.Question;
import com.interview.mapper.CategoryMapper;
import com.interview.mapper.QuestionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    @Autowired
    private QuestionMapper questionMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    public Result<IPage<Question>> getQuestions(Integer page, Integer size, Long categoryId, String difficulty,
            String keyword, Integer status, Boolean forReview, Boolean forHot, Boolean forLatest) {
        Page<Question> pageParam = new Page<>(page, size);
        QueryWrapper<Question> wrapper = new QueryWrapper<>();

        // 如果是审核页面查询，获取所有状态的题目
        if (Boolean.TRUE.equals(forReview)) {
            // 支持按状态筛选
            if (status != null) {
                wrapper.eq("status", status);
            }
            // 不限制状态，获取所有题目

            if (keyword != null && !keyword.isEmpty()) {
                wrapper.and(w -> w.like("title", keyword).or().like("tags", keyword));
            }

            // 待审核的排在前面按照创建时间正序排序，已审核的按照审核时间逆序排序放到后面
            // 状态0（待审核）正序，状态1（已通过）逆序，状态2（已拒绝）逆序
            wrapper.orderByAsc("status").orderByDesc("create_time");
        } else {
            // 普通查询：默认只查询已发布的题目（status=1）
            if (status == null) {
                wrapper.eq("status", 1);
            } else {
                wrapper.eq("status", status);
            }

            if (categoryId != null) {
                wrapper.eq("category_id", categoryId);
            }

            if (difficulty != null && !difficulty.isEmpty()) {
                wrapper.eq("difficulty", difficulty);
            }

            if (keyword != null && !keyword.isEmpty()) {
                wrapper.and(w -> w.like("title", keyword).or().like("tags", keyword));
            }

            if (forHot != null && forHot) {
                wrapper.orderByDesc("view_count", "like_count", "comment_count", "collect_count");
            }

            if (forLatest != null && forLatest) {
                wrapper.orderByDesc("update_time");
            }

            wrapper.orderByDesc("create_time");
        }

        IPage<Question> result = questionMapper.selectPage(pageParam, wrapper);
        return Result.success(result);
    }

    public Result<Question> getQuestionById(Long id) {
        Question question = questionMapper.selectById(id);
        if (question == null || question.getStatus() == 2) {
            return Result.error(ResultCode.QUESTION_NOT_FOUND.getCode(), ResultCode.QUESTION_NOT_FOUND.getMessage());
        }

        // 增加浏览量
        question.setViewCount(question.getViewCount() + 1);
        questionMapper.updateById(question);

        return Result.success(question);
    }

    @Transactional
    public Result<Question> createQuestion(Question question, Long userId) {
        // 处理分类：如果传递了分类名称（新分类），则查找或创建分类
        if (question.getCategoryName() != null && !question.getCategoryName().trim().isEmpty()) {
            String categoryName = question.getCategoryName().trim();

            // 先查找是否已存在该分类
            QueryWrapper<Category> categoryWrapper = new QueryWrapper<>();
            categoryWrapper.eq("name", categoryName);
            Category existingCategory = categoryMapper.selectOne(categoryWrapper);

            if (existingCategory != null) {
                // 如果分类已存在，使用已有分类的ID
                question.setCategoryId(existingCategory.getId());
            } else {
                // 如果分类不存在，创建新分类
                Category newCategory = new Category();
                newCategory.setName(categoryName);
                newCategory.setQuestionCount(0);
                newCategory.setCreateTime(LocalDateTime.now());
                newCategory.setUpdateTime(LocalDateTime.now());
                categoryMapper.insert(newCategory);
                question.setCategoryId(newCategory.getId());
            }
        }

        // 验证分类ID是否存在
        if (question.getCategoryId() == null) {
            return Result.error(400, "分类不能为空");
        }

        Category category = categoryMapper.selectById(question.getCategoryId());
        if (category == null) {
            return Result.error(400, "分类不存在");
        }

        question.setUserId(userId);
        question.setStatus(0); // 待审核
        question.setViewCount(0);
        question.setLikeCount(0);
        question.setCollectCount(0);
        question.setCommentCount(0);
        question.setCreateTime(LocalDateTime.now());
        question.setUpdateTime(LocalDateTime.now());

        questionMapper.insert(question);
        return Result.success("题目创建成功，等待审核", question);
    }

    @Transactional
    public Result<Question> updateQuestion(Question question, Long userId, String role) {
        Question existing = questionMapper.selectById(question.getId());
        if (existing == null) {
            return Result.error(ResultCode.QUESTION_NOT_FOUND.getCode(), ResultCode.QUESTION_NOT_FOUND.getMessage());
        }

        // 只有题目创建者或管理员可以编辑
        if (!existing.getUserId().equals(userId) && !"ADMIN".equals(role) && !"SUPER_ADMIN".equals(role)) {
            return Result.error(ResultCode.PERMISSION_DENIED.getCode(), ResultCode.PERMISSION_DENIED.getMessage());
        }

        question.setUpdateTime(LocalDateTime.now());
        questionMapper.updateById(question);
        return Result.success("题目更新成功", question);
    }

    @Transactional
    public Result<Void> deleteQuestion(Long id, Long userId, String role) {
        Question question = questionMapper.selectById(id);
        if (question == null) {
            return Result.error(ResultCode.QUESTION_NOT_FOUND.getCode(), ResultCode.QUESTION_NOT_FOUND.getMessage());
        }

        // 只有题目创建者或管理员可以删除
        if (!question.getUserId().equals(userId) && !"ADMIN".equals(role) && !"SUPER_ADMIN".equals(role)) {
            return Result.error(ResultCode.PERMISSION_DENIED.getCode(), ResultCode.PERMISSION_DENIED.getMessage());
        }

        question.setStatus(2); // 标记为已删除
        question.setUpdateTime(LocalDateTime.now());
        questionMapper.updateById(question);
        return Result.success("题目删除成功", null);
    }

    public Result<List<Question>> getHotQuestions(Integer limit) {
        QueryWrapper<Question> wrapper = new QueryWrapper<>();
        wrapper.eq("status", 1);
        wrapper.orderByDesc("like_count", "view_count");
        wrapper.last("LIMIT " + limit);

        List<Question> questions = questionMapper.selectList(wrapper);
        return Result.success(questions);
    }

    /**
     * 管理员：获取待审核的题目列表
     */
    public Result<IPage<Question>> getPendingQuestions(Integer page, Integer size, String keyword) {
        Page<Question> pageParam = new Page<>(page, size);
        QueryWrapper<Question> wrapper = new QueryWrapper<>();

        wrapper.eq("status", 0); // 只查询待审核的题目

        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like("title", keyword).or().like("tags", keyword));
        }

        wrapper.orderByDesc("create_time");

        IPage<Question> result = questionMapper.selectPage(pageParam, wrapper);
        return Result.success(result);
    }

    /**
     * 管理员：审核题目（通过或拒绝）
     */
    @Transactional
    public Result<String> reviewQuestion(List<Long> questionIds, Integer status, Long operatorId,
            String operatorRole) {
        // 只有管理员可以审核
        if (!"ADMIN".equals(operatorRole) && !"SUPER_ADMIN".equals(operatorRole)) {
            return Result.error(ResultCode.PERMISSION_DENIED.getCode(), "只有管理员可以审核题目");
        }

        // 检查题目是否存在
        List<Question> questions = questionMapper.selectBatchIds(questionIds);
        if (questions.size() != questionIds.size()) {
            return Result.error(ResultCode.QUESTION_NOT_FOUND.getCode(), ResultCode.QUESTION_NOT_FOUND.getMessage());
        }

        // status: 1-通过, 2-拒绝
        if (status != 1 && status != 2) {
            return Result.error(400, "审核状态无效");
        }

        // 批量查询分类并映射为Map
        List<Long> categoryIds = questions.stream().map(Question::getCategoryId).collect(Collectors.toList());
        List<Category> categories = categoryMapper.selectBatchIds(categoryIds);
        Map<Long, Category> categoryMap = categories.stream()
                .collect(Collectors.toMap(Category::getId, category -> category));

        // 检查题目是否已被审核
        for (Question question : questions) {
            int dealNum = 0;
            if ((question.getStatus() == 0 && status == 1) || question.getStatus() == 2 && status == 1) {
                dealNum = 1;
            } else if (question.getStatus() == 1 && status == 2) {
                dealNum = -1;
            }
            Category category = categoryMap.get(question.getCategoryId());
            if (category == null) {
                return Result.error(ResultCode.QUESTION_CATEGORY_NOT_FOUND.getCode(),
                        ResultCode.QUESTION_CATEGORY_NOT_FOUND.getMessage());
            }
            // 增加分类的问题数量
            category.setQuestionCount(category.getQuestionCount() + dealNum);

            question.setStatus(status);
            question.setUpdateTime(LocalDateTime.now());
        }

        // 批量更新题目
        questionMapper.updateBatchById(questions);
        // 批量更新分类
        categoryMapper.updateBatchById(categories);

        String message = status == 1 ? "题目审核通过" : "题目审核拒绝";
        return Result.success(message);
    }
}
