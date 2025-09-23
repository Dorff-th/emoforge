package dev.emoforge.post.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "category")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "is_default", nullable = false)
    private boolean defaultCategory = false;

    private Category(String name, boolean defaultCategory) {
        this.name = name;
        this.defaultCategory = defaultCategory;
    }

    public static Category create(String name, boolean defaultCategory) {
        return new Category(name, defaultCategory);
    }

    public void rename(String name) {
        this.name = name;
    }

    public void markDefault(boolean defaultCategory) {
        this.defaultCategory = defaultCategory;
    }
}
