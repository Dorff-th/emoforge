package dev.emoforge.post.admin.controller;

import dev.emoforge.post.admin.service.AdminCategoryService;
import dev.emoforge.post.domain.Category;
import dev.emoforge.post.dto.internal.CategoryRequest;
import dev.emoforge.post.dto.internal.CategoryUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final AdminCategoryService adminCategoryService;

    // 카테고리 목록 조회 (기본 카테고리 제외)
    @GetMapping
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(adminCategoryService.getAllCategories());
    }

    // 카테고리 추가
    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody CategoryRequest request) {
        try {
            Category saved = adminCategoryService.createCategory(request.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());    // 카테고리 추가시 카테고리 이름이 중복되면 400 Bad Request 발생
        }
    }

    //카테고리 수정
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable("id") Long id,
                                            @RequestBody CategoryUpdateRequest request) {
        try {
            Category updated = adminCategoryService.updateCategory(id, request.getName());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 카테고리 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable("id") Long id) {
        adminCategoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
