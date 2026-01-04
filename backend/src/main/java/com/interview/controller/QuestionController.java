package com.interview.controller;

import com.interview.common.Result;
import com.interview.entity.Question;
import com.interview.service.QuestionService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

@RestController
@RequestMapping("/questions")
public class QuestionController {

    @Resource
    private QuestionService questionService;

    @PostMapping
    public Result<String> createQuestion(@RequestBody Question question, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return questionService.createQuestion(question, userId);
    }

    @PutMapping("/{id}")
    public Result<String> updateQuestion(@PathVariable Long id, @RequestBody Question question, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        String role = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        question.setId(id);
        return questionService.updateQuestion(question, userId, role);
    }

    @DeleteMapping("/{id}")
    public Result<String> deleteQuestion(@PathVariable Long id, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        String role = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        return questionService.deleteQuestion(id, userId, role);
    }


}

