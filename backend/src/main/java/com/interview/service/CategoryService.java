package com.interview.service;

import com.interview.common.Result;
import com.interview.entity.Category;
import com.interview.mapper.CategoryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryMapper categoryMapper;

    public Result<List<Category>> getAllCategories() {
        // 根据questionCount进行排序,并且过滤掉questionCount为0的分类
        List<Category> categories = categoryMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<Category>()
                        .orderByDesc("question_count")
                        .ne("question_count", 0)    
        );
        return Result.success(categories);
    }

    public Result<Category> getCategoryById(Long id) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            return Result.error(404, "分类不存在");
        }
        return Result.success(category);
    }

    public Result<Category> createCategory(Category category) {
        category.setQuestionCount(0);
        category.setCreateTime(LocalDateTime.now());
        category.setUpdateTime(LocalDateTime.now());
        categoryMapper.insert(category);
        return Result.success("分类创建成功", category);
    }

    public Result<Category> updateCategory(Category category) {
        category.setUpdateTime(LocalDateTime.now());
        categoryMapper.updateById(category);
        return Result.success("分类更新成功", category);
    }

    public Result<Void> deleteCategory(Long id) {
        categoryMapper.deleteById(id);
        return Result.success("分类删除成功", null);
    }
}

