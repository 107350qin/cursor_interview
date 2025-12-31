package com.interview.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.interview.common.Result;
import com.interview.common.ResultCode;
import com.interview.entity.User;
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

import java.time.LocalDateTime;

@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
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
        user.setRole("USER");
        user.setStatus(0);
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());

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

        if (user.getStatus() == 1) {
            return Result.error(ResultCode.FORBIDDEN.getCode(), "账号已被封禁");
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



    /**
     * 获取所有用户列表（超级管理员和管理员都可以查看所有用户）
     */
    public Result<Page<User>> getAllUsers(Integer page, Integer size, String keyword, String role) {
        Page<User> pageObj = new Page<>(page, size);
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        
        // 如果有关键词，搜索用户名或邮箱
        if (keyword != null && !keyword.trim().isEmpty()) {
            wrapper.and(w -> w.like("username", keyword).or().like("email", keyword));
        }
        
        // 如果指定了角色，按角色过滤
        if (role != null && !role.trim().isEmpty()) {
            wrapper.eq("role", role);
        }
        
        wrapper.orderByDesc("create_time");
        Page<User> result = userMapper.selectPage(pageObj, wrapper);
        
        // 清除所有用户的密码信息
        result.getRecords().forEach(user -> user.setPassword(null));
        
        return Result.success(result);
    }

    /**
     * 超级管理员：更新用户信息
     */
    @Transactional
    public Result<User> updateUser(Long userId, User userUpdate, Long operatorId, String operatorRole) {
        // 只有超级管理员可以更新用户
        if (!"SUPER_ADMIN".equals(operatorRole)) {
            return Result.error(ResultCode.PERMISSION_DENIED.getCode(), "只有超级管理员可以更新用户信息");
        }
        
        User user = userMapper.selectById(userId);
        if (user == null) {
            return Result.error(ResultCode.USER_NOT_FOUND.getCode(), ResultCode.USER_NOT_FOUND.getMessage());
        }
        
        // 超级管理员不能修改自己的角色和状态
        if (operatorId.equals(userId)) {
            if (userUpdate.getRole() != null && !userUpdate.getRole().equals(user.getRole())) {
                return Result.error(ResultCode.PERMISSION_DENIED.getCode(), "不能修改自己的角色");
            }
            if (userUpdate.getStatus() != null && !userUpdate.getStatus().equals(user.getStatus())) {
                return Result.error(ResultCode.PERMISSION_DENIED.getCode(), "不能修改自己的状态");
            }
        }
        
        // 更新允许修改的字段
        if (userUpdate.getEmail() != null) {
            // 检查邮箱是否被其他用户使用
            QueryWrapper<User> wrapper = new QueryWrapper<>();
            wrapper.eq("email", userUpdate.getEmail());
            wrapper.ne("id", userId);
            if (userMapper.selectOne(wrapper) != null) {
                return Result.error(ResultCode.USER_ALREADY_EXISTS.getCode(), "邮箱已被其他用户使用");
            }
            user.setEmail(userUpdate.getEmail());
        }
        
        if (userUpdate.getPhone() != null) {
            user.setPhone(userUpdate.getPhone());
        }
        
        if (userUpdate.getRole() != null) {
            user.setRole(userUpdate.getRole());
        }
        
        if (userUpdate.getStatus() != null) {
            user.setStatus(userUpdate.getStatus());
        }
        
        user.setUpdateTime(LocalDateTime.now());
        userMapper.updateById(user);
        
        // 清除密码信息
        user.setPassword(null);
        return Result.success("用户更新成功", user);
    }

    /**
     * 超级管理员：删除用户
     */
    @Transactional
    public Result<Void> deleteUser(Long userId, Long operatorId, String operatorRole) {
        // 只有超级管理员可以删除用户
        if (!"SUPER_ADMIN".equals(operatorRole)) {
            return Result.error(ResultCode.PERMISSION_DENIED.getCode(), "只有超级管理员可以删除用户");
        }
        
        // 不能删除自己
        if (operatorId.equals(userId)) {
            return Result.error(ResultCode.PERMISSION_DENIED.getCode(), "不能删除自己");
        }
        
        User user = userMapper.selectById(userId);
        if (user == null) {
            return Result.error(ResultCode.USER_NOT_FOUND.getCode(), ResultCode.USER_NOT_FOUND.getMessage());
        }
        
        userMapper.deleteById(userId);
        return Result.success("用户删除成功", null);
    }

    /**
     * 批量删除用户
     */
    @Transactional
    public Result<Void> batchDeleteUsers(List<Long> userIds, Long operatorId, String operatorRoleCode) {
        if (userIds == null || userIds.isEmpty()) {
            return Result.error(400, "用户ID列表不能为空");
        }

        int successCount = 0;
        int failCount = 0;
        StringBuilder failMessages = new StringBuilder();
        
        for (Long userId : userIds) {
            // 不能删除自己
            if (operatorId.equals(userId)) {
                failCount++;
                failMessages.append("不能删除自己; ");
                continue;
            }
            
            User user = userMapper.selectById(userId);
            if (user == null) {
                failCount++;
                failMessages.append("用户ID ").append(userId).append(" 不存在; ");
                continue;
            }
            
            userMapper.deleteById(userId);
            successCount++;
        }
        
        if (failCount > 0) {
            return Result.error(400, 
                String.format("成功删除 %d 个用户，失败 %d 个: %s", successCount, failCount, failMessages.toString()));
        }
        
        return Result.success(String.format("成功删除 %d 个用户", successCount), null);
    }

    /**
     * 超级管理员：封禁/解禁用户
     */
    @Transactional
    public Result<User> banOrUnbanUser(Long userId, Integer status, Long operatorId, String operatorRole) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            return Result.error(ResultCode.USER_NOT_FOUND.getCode(), ResultCode.USER_NOT_FOUND.getMessage());
        }
        
        // 超级管理员可以封禁/解禁所有用户，但不能修改自己的状态
        if ("SUPER_ADMIN".equals(operatorRole)) {
            if (operatorId.equals(userId)) {
                return Result.error(ResultCode.PERMISSION_DENIED.getCode(), "不能修改自己的状态");
            }
        } 
        // 普通管理员只能封禁/解禁USER角色的用户
        else if ("ADMIN".equals(operatorRole)) {
            if (!"USER".equals(user.getRole())) {
                return Result.error(ResultCode.PERMISSION_DENIED.getCode(), "只能封禁/解禁普通用户");
            }
        } else {
            return Result.error(ResultCode.PERMISSION_DENIED.getCode(), "没有权限封禁/解禁用户");
        }
        
        user.setStatus(status);
        user.setUpdateTime(LocalDateTime.now());
        userMapper.updateById(user);
        
        // 清除密码信息
        user.setPassword(null);
        String message = status == 1 ? "用户已封禁" : "用户已解禁";
        return Result.success(message, user);
    }

    /**
     * 超级管理员：重置用户密码
     */
    @Transactional
    public Result<Void> resetUserPassword(Long userId, String newPassword, Long operatorId, String operatorRole) {
        // 只有超级管理员可以重置用户密码
        if (!"SUPER_ADMIN".equals(operatorRole)) {
            return Result.error(ResultCode.PERMISSION_DENIED.getCode(), "只有超级管理员可以重置用户密码");
        }
        
        User user = userMapper.selectById(userId);
        if (user == null) {
            return Result.error(ResultCode.USER_NOT_FOUND.getCode(), ResultCode.USER_NOT_FOUND.getMessage());
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdateTime(LocalDateTime.now());
        userMapper.updateById(user);
        
        return Result.success("密码重置成功", null);
    }

    /**
     * 普通管理员：获取所有用户列表（可以看到所有用户，但只能操作USER角色）
     */
    public Result<Page<User>> getAllUsersForAdmin(Integer page, Integer size, String keyword) {
        // 普通管理员可以看到所有用户，但只能操作USER角色
        return getAllUsers(page, size, keyword, null);
    }
}

