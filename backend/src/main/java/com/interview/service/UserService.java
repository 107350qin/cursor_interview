package com.interview.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.interview.common.Result;
import com.interview.common.ResultCode;
import com.interview.entity.User;
import com.interview.enums.UserRoleEnum;
import com.interview.enums.UserStatusEnum;
import com.interview.mapper.UserMapper;
import com.interview.util.JwtUtil;
import com.interview.vo.LoginRequest;
import com.interview.vo.LoginResponse;
import com.interview.vo.RegisterRequest;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.Objects;

@Service
public class UserService {

    @Resource
    private UserMapper userMapper;

    @Resource
    private PasswordEncoder passwordEncoder;

    @Resource
    private JwtUtil jwtUtil;

    @Transactional
    public Result<String> register(RegisterRequest request) {
        // 检查用户名是否已存在
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("username", request.getUsername());
        if (userMapper.selectOne(wrapper) != null) {
            return Result.error(ResultCode.USER_ALREADY_EXISTS.getCode(), ResultCode.USER_ALREADY_EXISTS.getMessage());
        }

        // 检查邮箱是否已存在
        wrapper = new QueryWrapper<>();
        wrapper.eq("email", request.getEmail());
        if (userMapper.selectOne(wrapper) != null) {
            return Result.error(ResultCode.USER_ALREADY_EXISTS.getCode(), "邮箱已被注册");
        }

        // 创建新用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(UserRoleEnum.USER.getRoleName());
        user.setStatus(UserStatusEnum.NEW.getStatusName());

        userMapper.insert(user);
        return Result.success("注册成功");
    }

    public Result<LoginResponse> login(LoginRequest request) {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("username", request.getUsername());
        User user = userMapper.selectOne(wrapper);
        if (user == null) {
            return Result.error(ResultCode.USER_NOT_FOUND.getCode(), ResultCode.USER_NOT_FOUND.getMessage());
        }
        if (Objects.equals(user.getStatus(), UserStatusEnum.NEW.getStatusName())) {
            return Result.error(ResultCode.USER_NOT_ACTIVE.getCode(), ResultCode.USER_NOT_ACTIVE.getMessage());
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return Result.error(ResultCode.PASSWORD_ERROR.getCode(), ResultCode.PASSWORD_ERROR.getMessage());
        }
        // 生成token
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setRole(user.getRole());

        return Result.success("登录成功", response);
    }

    public Result<User> getUserInfo(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            return Result.error(ResultCode.USER_NOT_FOUND.getCode(), ResultCode.USER_NOT_FOUND.getMessage());
        }
        // 清除密码信息
        user.setPassword(null);
        return Result.success(user);
    }

    public IPage<User> getAllUsers(Integer page, Integer size, String keyword) {
        Page<User> pageParam = new Page<>(page, size);
        // 查询用户，根据用户状态进行排序，正常用户优先
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        
        // 搜索条件
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like("username", keyword).or().like("email", keyword);
        }
        
        // 排序
        wrapper.orderByAsc("status")
                .orderByAsc("role")
                .orderByDesc("id");
        
        // 不查询password字段
        wrapper.select("id", "username", "email", "phone", "role", "status");
        
        // 分页查询
        return userMapper.selectPage(pageParam, wrapper);
    }

    public int updateUser(User user) {
        return userMapper.updateById(user);
    }
}

