package com.example.controller.admin;

import com.example.dto.request.LoginRequest;
import com.example.dto.response.user.AuthResponse;
import com.example.entity.User;
import com.example.enums.Role;
import com.example.repository.user.UserRepository;
import com.example.service.user.UserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/admin/auth")
@RequiredArgsConstructor

public class AdminAuthController {

    private final UserService userService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> adminLogin(@RequestBody LoginRequest request,
                                                   HttpServletResponse response) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email không tồn tại"));

        if (user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản không có quyền quản trị");
        }

        return ResponseEntity.ok(userService.login(request.getEmail(), request.getPassword(), response));
    }
}
