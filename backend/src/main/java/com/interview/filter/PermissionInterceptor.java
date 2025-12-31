package com.interview.filter;

import com.interview.annotation.RequireRole;
import com.interview.annotation.UserRoleEnum;
import com.interview.common.Result;
import com.interview.common.ResultCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

/**
 * 权限拦截器：校验接口权限
 */
@Component
public class PermissionInterceptor implements HandlerInterceptor {
    
    private static final Logger logger = LoggerFactory.getLogger(PermissionInterceptor.class);

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 打印请求信息
        printRequestInfo(request, handler);
        
        // 如果不是HandlerMethod，直接放行（如静态资源等）
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }
        
        HandlerMethod handlerMethod = (HandlerMethod) handler;
        
        // 检查方法或类上的 @RequireRole 注解
        RequireRole requireRole = handlerMethod.getMethodAnnotation(RequireRole.class);
        if (requireRole == null) {
            return true;
        }
        
        // 从请求中获取当前用户ID
        Long userId = getCurrentUserId(request);
        if (userId == null) {
            writeErrorResponse(response, ResultCode.UNAUTHORIZED.getCode(), "未登录");
            return false;
        }
      
        // 获取用户的角色
        String userRole = getUserRole(request);
        if (userRole == null) {
            writeErrorResponse(response, ResultCode.UNAUTHORIZED.getCode(), "未登录");
            return false;
        }
        
        if(requireRole.value() == UserRoleEnum.SUPER_ADMIN && userRole.equals(UserRoleEnum.SUPER_ADMIN.getValue())) {
            return true;
        }else if(requireRole.value() == UserRoleEnum.ADMIN && (userRole.equals(UserRoleEnum.ADMIN.getValue()) || userRole.equals(UserRoleEnum.SUPER_ADMIN.getValue()))) {
            return true;
        }else if(requireRole.value() == UserRoleEnum.USER) {
            return true;
        }else {
            writeErrorResponse(response, ResultCode.PERMISSION_DENIED.getCode(), "需要" + requireRole.value().getName() + "权限");
            return false;
        }
    }
    
    /**
     * 从请求中获取用户角色
     */
    private String getUserRole(HttpServletRequest request) {
        Object userRole = request.getAttribute("userRole");
        if (userRole instanceof String) {
            return (String) userRole;
        }
        return null;
    }
    

    /**
     * 从请求中获取当前用户ID
     */
    private Long getCurrentUserId(HttpServletRequest request) {
        Object userId = request.getAttribute("userId");
        if (userId instanceof Long) {
            return (Long) userId;
        }
        return null;
    }

    /**
     * 写入错误响应
     */
    private void writeErrorResponse(HttpServletResponse response, Integer code, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json;charset=UTF-8");
        Result<?> result = Result.error(code, message);
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }
    
    /**
     * 打印请求信息
     */
    private void printRequestInfo(HttpServletRequest request, Object handler) {
        String method = request.getMethod();
        String requestURI = request.getRequestURI();
        String queryString = request.getQueryString();
        
        // 打印请求方法和路径
        logger.info("=== 请求信息 ===");
        logger.info("请求方法: {}", method);
        logger.info("请求路径: {}", requestURI);
        if (queryString != null) {
            logger.info("查询参数: {}", queryString);
        }
        
        // 打印请求头中的参数
        logger.info("请求头参数:");
        Enumeration<String> headerNames = request.getHeaderNames();
        Map<String, String> headers = new HashMap<>();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            // 过滤掉敏感的头信息
            if (!"authorization".equalsIgnoreCase(headerName)) {
                headers.put(headerName, request.getHeader(headerName));
            }
        }
        headers.forEach((key, value) -> logger.info("  {}: {}", key, value));
        
        // 打印处理器信息
        if (handler instanceof HandlerMethod) {
            HandlerMethod handlerMethod = (HandlerMethod) handler;
            logger.info("处理器: {}.{}",
                handlerMethod.getBeanType().getSimpleName(),
                handlerMethod.getMethod().getName());
        }
        
        logger.info("================");
    }
}


