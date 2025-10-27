package dev.emoforge.post.repository;


import dev.emoforge.post.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {


    List<Category> findAllByDefaultCategoryFalse();


    Optional<Category> findByDefaultCategoryTrue();


    boolean existsByName(String name);


    default Optional<Long> findDefaultCategory() {
        return findIdByDefaultCategoryTrue();
    }

    Optional<Long> findIdByDefaultCategoryTrue();
}
