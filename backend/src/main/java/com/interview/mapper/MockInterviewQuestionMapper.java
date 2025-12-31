package com.interview.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.interview.entity.MockInterviewQuestion;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MockInterviewQuestionMapper extends BaseMapper<MockInterviewQuestion> {
}

