package com.example.mapper;

import com.example.dto.request.LikeRequest;
import com.example.entity.Like;
import com.example.entity.Post;
import com.example.entity.User;
import com.example.repository.post.PostRepository;
import com.example.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LikeMapper {
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public Like toLike(LikeRequest request){
        Like like = new Like();

        User user = userRepository.findById(request.getUser_Id())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUser_Id()));

        Post post = postRepository.findById(request.getPost_Id())
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + request.getPost_Id()));

        like.setUser(user);
        like.setPost(post);
        like.setCreateAt(LocalDateTime.now());

        return like;
    }
}
