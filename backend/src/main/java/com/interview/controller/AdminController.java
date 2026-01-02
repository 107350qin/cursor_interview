package com.interview.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.interview.annotation.RequireRole;
import com.interview.annotation.UserRoleEnum;
import com.interview.common.Result;
import com.interview.entity.Question;
import com.interview.entity.User;
import com.interview.service.QuestionService;
import com.interview.service.UserService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private QuestionService questionService;

    /**
     * 普通管理员：获取所有用户列表（可以看到所有用户，但只能操作USER角色）
     */
    @GetMapping("/users")
    @RequireRole(UserRoleEnum.ADMIN)
    public Result<Page<User>> getAllUsers(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            Authentication authentication) {
        // 普通管理员可以查看所有用户
        return userService.getAllUsers(page, size, keyword, role);
    }

    /**
     * 普通管理员：封禁/解禁用户（只能封禁/解禁普通用户）
     */
    @PutMapping("/users/{userId}/status")
    @RequireRole(UserRoleEnum.ADMIN)
    public Result<User> banOrUnbanUser(
            @PathVariable Long userId,
            @RequestParam Integer status,
            Authentication authentication) {
        Long operatorId = (Long) authentication.getPrincipal();
        String operatorRole = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        return userService.banOrUnbanUser(userId, status, operatorId, operatorRole);
    }

    /**
     * 管理员：获取待审核的题目列表
     */
    @GetMapping("/questions/pending")
    @RequireRole(UserRoleEnum.ADMIN)
    public Result<IPage<Question>> getPendingQuestions(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword,
            Authentication authentication) {
        return questionService.getPendingQuestions(page, size, keyword);
    }

    /**
     * 管理员：审核题目（通过或拒绝）
     */
    @PutMapping("/questions/review")
    @RequireRole(UserRoleEnum.ADMIN)
    public Result<String> reviewQuestion(
            @RequestBody QuestionReviewDTO reviewDTO, // 接收前端传递的 JSON 参数
            Authentication authentication) {
        // 从 DTO 中获取参数
        List<Long> questionIds = reviewDTO.getQuestionIds();
        Integer status = reviewDTO.getStatus();
        Long operatorId = (Long) authentication.getPrincipal();
        String operatorRole = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        return questionService.reviewQuestion(questionIds, status, operatorId, operatorRole);
    }

    @Data
    static class QuestionReviewDTO {
        // 对应前端的 questionIds 数组
        private List<Long> questionIds;
        // 对应前端的 status 字段
        private Integer status;
    }
}

