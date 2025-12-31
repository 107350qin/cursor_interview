package com.interview.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.interview.annotation.RequireRole;
import com.interview.annotation.UserRoleEnum;
import com.interview.common.Result;
import com.interview.entity.Question;
import com.interview.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @GetMapping
    public Result<IPage<Question>> getQuestions(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Boolean forReview,
            @RequestParam(required = false) Boolean forHot,
            @RequestParam(required = false) Boolean forLatest) {
        return questionService.getQuestions(page, size, categoryId, difficulty, keyword, status, forReview, forHot,
                forLatest);
    }

    @GetMapping("/{id}")
    public Result<Question> getQuestionById(@PathVariable Long id) {
        return questionService.getQuestionById(id);
    }

    @PostMapping
    @RequireRole(UserRoleEnum.USER) 
    public Result<Question> createQuestion(@RequestBody Question question, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return questionService.createQuestion(question, userId);
    }

    @PutMapping("/{id}")
    public Result<Question> updateQuestion(@PathVariable Long id, @RequestBody Question question, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        String role = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        question.setId(id);
        return questionService.updateQuestion(question, userId, role);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteQuestion(@PathVariable Long id, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        String role = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        return questionService.deleteQuestion(id, userId, role);
    }
}

