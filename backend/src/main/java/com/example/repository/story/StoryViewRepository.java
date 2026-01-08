package com.example.repository.story;

import com.example.entity.Story;
import com.example.entity.StoryView;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface StoryViewRepository extends JpaRepository<StoryView, String> {
    
    // Kiểm tra xem user đã xem story chưa
    Optional<StoryView> findByStoryIdAndViewerId(String storyId, String viewerId);

    // Lấy danh sách người đã xem story
    @Query("SELECT sv FROM StoryView sv WHERE sv.story.id = :storyId ORDER BY sv.viewedAt DESC")
    List<StoryView> findByStoryId(@Param("storyId") String storyId);

    // Đếm số lượt xem của story
    long countByStoryId(String storyId);

    // Lấy danh sách stories đã xem của user
    @Query("SELECT sv.story FROM StoryView sv WHERE sv.viewer.id = :viewerId ORDER BY sv.viewedAt DESC")
    List<Story> findViewedStoriesByViewerId(@Param("viewerId") String viewerId);
    
    // Xóa story views của stories đã hết hạn
    @Transactional
    @Modifying
    @Query("DELETE FROM StoryView sv WHERE sv.story.expiresAt < :now")
    void deleteViewsForExpiredStories(@Param("now") LocalDateTime now);
}

