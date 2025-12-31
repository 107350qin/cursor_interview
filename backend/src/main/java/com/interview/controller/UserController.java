package com.interview.controller;

import com.interview.common.Result;
import com.interview.entity.User;
import com.interview.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/info")
    public Result<User> getUserInfo(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return userService.getUserInfo(userId);
    }
}

