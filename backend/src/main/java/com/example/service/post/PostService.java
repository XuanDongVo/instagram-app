package com.example.service.post;

import com.example.dto.request.UpPostRequest;
import com.example.dto.response.post.PostResponse;
import com.example.dto.response.user.PostProfileResponse;
import com.example.entity.Post;
import com.example.entity.SavedPostDetail;
import com.example.enums.PostStatus;
import com.example.mapper.PostMapper;
import com.example.repository.post.PostRepository;
import com.example.repository.savedPost.SavedPostDetailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostMapper postMapper;
    private final PostRepository repo;
    private final SavedPostDetailRepository savedPostDetailRepository;
    private final List<PostStatus> userSideStatus = List.of(PostStatus.HIDDEN, PostStatus.DELETED);

    public List<PostResponse> getAllPost() {
        List<Post> posts = repo.findByStatusNot(PostStatus.DELETED, Sort.by(Sort.Direction.DESC, "createAt"));
        List<PostResponse> rs = new ArrayList<>();
        for (Post p : posts) {
            rs.add(postMapper.toPostResponse(p, p.getUser().getId()));
        }
        return rs;
    }

    // lay moi post tru post cua user
    public List<PostResponse> getPosts(String currentId) {
        List<Post> post = repo.findByUserIdNotAndStatusNotIn(currentId, userSideStatus, Sort.by(Sort.Direction.DESC, "createAt"));
        List<PostResponse> rs = new ArrayList<>();
        for (Post p : post) {
            rs.add(postMapper.toPostResponse(p, currentId));
        }
        return rs;
    }

    public List<PostResponse> getPostsByUser(String currentId) {
        List<Post> post = repo.findByUserIdAndStatusNotIn(currentId, userSideStatus, Sort.by(Sort.Direction.DESC, "createAt"));
        List<PostResponse> rs = new ArrayList<>();
        for (Post p : post) {
            rs.add(postMapper.toPostResponse(p, currentId));
        }
        return rs;
    }

    public Post insertPost(UpPostRequest request) {
        Post post = postMapper.toPost(request);
        return repo.save(post);
    }

    public void deletePost(String postId) {
        Post post = repo.findById(postId).orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với ID: " + postId));
        post.setStatus(PostStatus.DELETED);
        repo.save(post);
    }

    public void hidePost(String postId) {
        Post post = repo.findById(postId).orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với ID: " + postId));
        post.setStatus(PostStatus.HIDDEN);
        repo.save(post);
    }

    public void activePost(String postId) {
        Post post = repo.findById(postId).orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với ID: " + postId));
        post.setStatus(PostStatus.ACTIVE);
        repo.save(post);
    }

    public List<PostProfileResponse> getSavedPosts(String userId) {
        List<SavedPostDetail> savedDetails = savedPostDetailRepository.findBySavedPost_User_Id(userId);

        return savedDetails.stream()
                .map(SavedPostDetail::getPost)
                .map(post -> PostProfileResponse.builder()
                        .id(post.getId())
                        .content(post.getContent())
                        .createdAt(post.getCreateAt())
                        .likeCount(post.getLikes().size())
                        .commentCount(post.getComments().size())
                        .imageUrls(post.getPostImages())
                        .userId(post.getUser().getId())
                        .userName(post.getUser().getUserName())
                        .avatarUrl(post.getUser().getProfileImage())
                        .build())
                .sorted(Comparator.comparing(PostProfileResponse::getCreatedAt).reversed())
                .toList();
    }


}
