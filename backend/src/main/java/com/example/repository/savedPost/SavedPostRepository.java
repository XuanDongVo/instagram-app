package com.example.repository.savedPost;

import com.example.entity.SavedPost;
import com.example.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SavedPostRepository extends JpaRepository<SavedPost, String> {
    Optional<SavedPost> findByUser(User user );
}
