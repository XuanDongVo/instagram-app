package com.example.controller.user;

import com.example.dto.ApiResponse;
import com.example.dto.request.UpdateProfileRequest;
import com.example.dto.response.user.UserProfileResponse;
import com.example.dto.response.user.UserResponse;
import com.example.entity.User;
import com.example.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse> getUserById(@RequestParam("id") String id) {
        UserResponse userResponse = userService.findById(id);
        if (userResponse == null) {
            return ResponseEntity.ok(ApiResponse.error(HttpStatus.NOT_FOUND.value(), "Không tìm thấy user"));
        }
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), null, userResponse));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getUserProfile(
            @RequestParam("id") String id,
            @AuthenticationPrincipal Jwt jwt) {
        String currentUserId = userService.getIdByEmail(jwt.getSubject());
        UserProfileResponse profileResponse = userService.getUserProfile(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), null, profileResponse));
    }

    @PutMapping("/updateProfile")
    public ResponseEntity<ApiResponse> updateProfile(
            @RequestParam("id") String id,
            @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(HttpStatus.UNAUTHORIZED.value(), "Không tìm thấy thông tin xác thực"));
        }
        String authenticatedUserId = userService.getIdByEmail(jwt.getSubject());
        if (!id.equals(authenticatedUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(HttpStatus.FORBIDDEN.value(), "Bạn chỉ có thể cập nhật hồ sơ của chính mình"));
        }
        try {
            UserResponse userResponse = userService.updateProfile(id, request);
            return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Cập nhật hồ sơ thành công", userResponse));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(ApiResponse.error(e.getStatusCode().value(), e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Lỗi server: " + e.getMessage()));
        }
    }

    @PostMapping("/uploadProfileImage")
    public ResponseEntity<ApiResponse> uploadProfileImage(
            @RequestParam("id") String id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(HttpStatus.UNAUTHORIZED.value(), "Không tìm thấy thông tin xác thực"));
        }
        String authenticatedUserId = userService.getIdByEmail(jwt.getSubject());
        if (!id.equals(authenticatedUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(HttpStatus.FORBIDDEN.value(), "Bạn chỉ có thể cập nhật ảnh hồ sơ của chính mình"));
        }
        try {
            String imageUrl = userService.uploadAndSetProfileImage(id, file);
            return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Cập nhật ảnh hồ sơ thành công", imageUrl));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(ApiResponse.error(e.getStatusCode().value(), e.getReason()));
        } catch (Exception e) {
            System.err.println("Lỗi khi tải ảnh lên: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Lỗi server khi tải ảnh lên: " + e.getMessage()));
        }
    }

    @PostMapping("/follow")
    public ResponseEntity<ApiResponse> followUser(
            @RequestParam("id") String id,
            @RequestParam("targetId") String targetId,
            @AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getSubject();
        String idGet = userService.getIdByEmail(email);
        if (!id.equals(idGet)) {
            return ResponseEntity.ok(ApiResponse.error(HttpStatus.FORBIDDEN.value(), "Bạn chỉ có thể theo dõi dưới danh nghĩa chính mình"));
        }
        userService.follow(id, targetId);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Theo dõi thành công", null));
    }

    @PostMapping("/unfollow")
    public ResponseEntity<ApiResponse> unfollowUser(
            @RequestParam("id") String id,
            @RequestParam("targetId") String targetId,
            @AuthenticationPrincipal Jwt jwt) {
        String authenticatedUserId = jwt.getSubject();
        String idGet = userService.getIdByEmail(authenticatedUserId);
        if (!id.equals(idGet)) {
            return ResponseEntity.ok(ApiResponse.error(HttpStatus.FORBIDDEN.value(), "Bạn chỉ có thể bỏ theo dõi dưới danh nghĩa chính mình"));
        }
        userService.unfollow(id, targetId);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Bỏ theo dõi thành công", null));
    }


    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse> getSuggestions(@RequestParam  String id) {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                null,
                userService.suggestUsersToFollow(id, 10)
        ));
    }

    @GetMapping("/followers")
    public ResponseEntity<ApiResponse> getFollowers(@RequestParam String id) {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                null,
                userService.getFollowers(id)
        ));
    }

    @GetMapping("/following")
    public ResponseEntity<ApiResponse> getFollowing(@RequestParam String id) {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                null,
                userService.getFollowing(id)
        ));
    }

    @GetMapping("/posts")
    public ResponseEntity<ApiResponse> getUserPosts(@RequestParam String id) {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                null,
                userService.getUserPosts(id)
        ));
    }

    @GetMapping("search")
    public ResponseEntity<ApiResponse> searchUsers(@RequestParam("name") String name){
        List<UserResponse> userResponses = userService.searchChatUsers(name);
        if(userResponses.isEmpty()){
            return ResponseEntity.ok(ApiResponse.error(HttpStatus.NOT_FOUND.value(), "Không tìm thấy user"));
        }else {
            return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), null, userResponses));
        }
    }

}
