package com.interview.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.interview.entity.Question;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface QuestionMapper extends BaseMapper<Question> {

    //实现批量更新
    void updateBatchById(List<Question> questions);
}

