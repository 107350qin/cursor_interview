package com.interview.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.interview.common.Result;
import com.interview.entity.MockInterview;
import com.interview.entity.MockInterviewQuestion;
import com.interview.entity.Question;
import com.interview.service.MockInterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/mock-interviews")
public class MockInterviewController {

    @Autowired
    private MockInterviewService mockInterviewService;

    @PostMapping
    public Result<MockInterview> createMockInterview(
            @RequestParam(required = false) String categoryIds,
            @RequestParam(required = false) String difficulty,
            @RequestParam Integer questionCount,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return mockInterviewService.createMockInterview(userId, categoryIds, difficulty, questionCount);
    }

    @PostMapping("/{id}/submit")
    public Result<MockInterview> submitMockInterview(
            @PathVariable Long id,
            @RequestBody List<MockInterviewQuestion> answers,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return mockInterviewService.submitMockInterview(id, userId, answers);
    }

    @GetMapping("/{id}")
    public Result<MockInterview> getMockInterview(@PathVariable Long id, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return mockInterviewService.getMockInterview(id, userId);
    }

    @GetMapping("/{id}/questions")
    public Result<List<Question>> getMockInterviewQuestions(@PathVariable Long id, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return mockInterviewService.getMockInterviewQuestions(id, userId);
    }

    @GetMapping("/history")
    public Result<IPage<MockInterview>> getMockInterviewHistory(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return mockInterviewService.getMockInterviewHistory(userId, page, size);
    }
}

