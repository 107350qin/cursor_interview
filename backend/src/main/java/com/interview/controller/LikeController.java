package com.interview.controller;

import com.interview.common.Result;
import com.interview.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/likes")
public class LikeController {

    @Autowired
    private LikeService likeService;

    @PostMapping("/{questionId}")
    public Result<Void> likeQuestion(@PathVariable Long questionId, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return likeService.likeQuestion(questionId, userId);
    }

    @DeleteMapping("/{questionId}")
    public Result<Void> unlikeQuestion(@PathVariable Long questionId, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return likeService.unlikeQuestion(questionId, userId);
    }

    @GetMapping("/{questionId}/status")
    public Result<Boolean> isLiked(@PathVariable Long questionId, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return likeService.isLiked(questionId, userId);
    }
}

