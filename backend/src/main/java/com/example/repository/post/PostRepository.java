package com.example.repository.post;

import com.example.entity.Post;
import com.example.enums.PostStatus;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, String> {
    List<Post> findByUser_Id(String userId);

    List<Post> findByUser_IdNot(String userId, Sort sort);

    @Query("SELECT p FROM Post p WHERE p.user.id != :currentId AND p.status NOT IN :excludedStatuses")
    List<Post> findByUserIdNotAndStatusNotIn(String currentId, List<PostStatus> excludedStatuses, Sort sort);

    @Query("SELECT p FROM Post p WHERE p.user.id = :userId AND p.status NOT IN :excludedStatuses")
    List<Post> findByUserIdAndStatusNotIn(String userId, List<PostStatus> excludedStatuses, Sort sort);

    List<Post> findByStatusNot(PostStatus status, Sort sort);
}
