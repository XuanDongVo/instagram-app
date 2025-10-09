package com.example.repository.savedPost;

import com.example.entity.Post;
import com.example.entity.SavedPost;
import com.example.entity.SavedPostDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedPostDetailRepository extends JpaRepository<SavedPostDetail, String> {
    Optional<SavedPostDetail> findBySavedPostAndPost(SavedPost savedPost , Post post);

    List<SavedPostDetail> findBySavedPost(SavedPost savedPost );

    boolean existsBySavedPost(SavedPost savedPost);

    List<SavedPostDetail> findBySavedPost_User_Id(String userId);
}