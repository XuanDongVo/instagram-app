package com.example.repository.like;

import com.example.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, String> {
    boolean existsByUserIdAndPostId(String userId, String postId);
    Optional<Like> findByUserIdAndPostId(String userId, String postId);

}
