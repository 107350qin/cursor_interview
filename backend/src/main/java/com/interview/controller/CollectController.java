package com.interview.controller;

import com.interview.common.Result;
import com.interview.service.CollectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/collects")
public class CollectController {

    @Autowired
    private CollectService collectService;

    @PostMapping("/{questionId}")
    public Result<Void> collectQuestion(@PathVariable Long questionId, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return collectService.collectQuestion(questionId, userId);
    }

    @DeleteMapping("/{questionId}")
    public Result<Void> uncollectQuestion(@PathVariable Long questionId, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return collectService.uncollectQuestion(questionId, userId);
    }

    @GetMapping("/{questionId}/status")
    public Result<Boolean> isCollected(@PathVariable Long questionId, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return collectService.isCollected(questionId, userId);
    }
}

