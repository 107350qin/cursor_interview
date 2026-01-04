package com.interview.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.interview.entity.Question;

import java.util.List;
import java.util.Map;
import java.util.Set;

import com.interview.vo.QuestionCategoryCountDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface QuestionMapper extends BaseMapper<Question> {

    /**
     * 查询所有题目分类
     * 
     * @return 所有题目分类的集合
     */
    @Select("SELECT DISTINCT category_name FROM question")
    Set<String> selectCategoryNames();

    /**
     * 查询每种分类有多少个问题
     * 
     * @return 分类名称到问题数量的映射
     */
    @Select("SELECT category_name as name, COUNT(*) AS count FROM question GROUP BY category_name HAVING count > 0 " +
            "order by count desc")
    List<QuestionCategoryCountDTO> selectCategoryStatistic();
}
