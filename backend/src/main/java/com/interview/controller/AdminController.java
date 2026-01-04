package com.interview.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.interview.common.Result;
import com.interview.entity.User;
import com.interview.service.UserService;

import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {
    @Resource
    private UserService userService;

    // 查询所有用户，管理员权限
    @GetMapping("/users")
    public Result<IPage<User>> getAllUsers(
            @RequestParam Integer page,
            @RequestParam Integer size,
            @RequestParam(required = false) String keyword) {
        return Result.success(userService.getAllUsers(page, size, keyword));
    }

    // 查询所有用户，管理员权限
    @PutMapping("/user")
    public Result<Integer> updateUser(@RequestBody User user) {
        return Result.success(userService.updateUser(user));
    }
}
