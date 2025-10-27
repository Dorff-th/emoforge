package dev.emoforge.post.controller;


import dev.emoforge.post.domain.Category;
import dev.emoforge.post.service.internal.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// 카테고리 API
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryApiController {

    private final CategoryService categoryService;

    @GetMapping("")
    public List<Category> getCategories() {
        return categoryService.findAllCategory();
    }
}
