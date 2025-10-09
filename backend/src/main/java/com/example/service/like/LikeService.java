package com.example.service.like;

import com.example.dto.request.LikeRequest;
import com.example.entity.Like;
import com.example.mapper.LikeMapper;
import com.example.repository.like.LikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LikeService {
    private final LikeMapper mapper;
    private final LikeRepository repo;

    public Like like(LikeRequest request){
        Like like = mapper.toLike(request);
        return repo.save(like);
    }

    public void unlike(LikeRequest request) {
        repo.findByUserIdAndPostId(request.getUser_Id(), request.getPost_Id())
                .ifPresent(repo::delete);
    }
}
