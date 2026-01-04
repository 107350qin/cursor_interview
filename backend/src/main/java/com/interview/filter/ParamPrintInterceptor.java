package com.interview.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

/**
 * 权限拦截器：校验接口权限
 */
@Component
public class ParamPrintInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(ParamPrintInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 打印请求信息
        printRequestInfo(request, handler);
        return true;
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
            logger.info("处理器: {}.{}", handlerMethod.getBeanType().getSimpleName(), handlerMethod.getMethod()
                    .getName());
        }

        logger.info("================");
    }
}


