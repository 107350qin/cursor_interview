package com.interview;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;


@SpringBootApplication
@MapperScan("com.interview.mapper")
public class InterviewApplication {

    @Resource
    PasswordEncoder passwordEncoder;

   
    @PostConstruct
    public void testPasswordEncoder() {
        String password = "admin123";
        String encodedPassword = passwordEncoder.encode(password);
        System.out.println(encodedPassword);
    }

    public static void main(String[] args) {
        SpringApplication.run(InterviewApplication.class, args);
    }
}

