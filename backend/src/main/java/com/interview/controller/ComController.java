package com.interview.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.interview.common.Result;
import com.interview.entity.Question;
import com.interview.service.QuestionService;
import com.interview.vo.QuestionCategoryCountDTO;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/com")
public class ComController {

    @Resource
    private QuestionService questionService;

    @GetMapping("/get-questions")
    public Result<IPage<Question>> getQuestions(@RequestParam(defaultValue = "1") Integer page,
                                                @RequestParam(defaultValue = "10") Integer size,
                                                @RequestParam(required = false) String categoryName,
                                                @RequestParam(required = false) String difficulty,
                                                @RequestParam(required = false) String keyword,
                                                @RequestParam(required = false) Integer status,
                                                @RequestParam(required = false) Boolean forReview,
                                                @RequestParam(required = false) String sortBy) {
        return questionService.getQuestions(page, size, categoryName, difficulty, keyword);
    }

    @GetMapping("/get-question/{id}")
    public Result<Question> getQuestionById(@PathVariable Long id) {
        return questionService.getQuestionById(id);
    }

    // 获取所有的分类
    @GetMapping("/get-categories")
    public Result<Set<String>> getCategories() {
        return questionService.getCategories();
    }

    // 统计每种分类有多少个问题
    @GetMapping("/get-category-statistic")
    public Result<List<QuestionCategoryCountDTO>> getCategoryStatistic() {
        return Result.success(questionService.getCategoryStatistic());
    }

    // 统计每种分类有多少个问题
    @GetMapping("/mock-interviews")
    public Result<List<Question>> getMockInterviewQuestions(String categoryNames, String difficulty,
                                                            Integer questionCount) {
        if (questionCount == null || questionCount <= 0 || questionCount > 100) {
            return Result.error("问题数量只能时1-100");
        }
        return Result.success(questionService.getMockInterviewQuestions(categoryNames, difficulty, questionCount));
    }
}

