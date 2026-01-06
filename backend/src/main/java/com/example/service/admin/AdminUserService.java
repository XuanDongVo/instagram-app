package com.example.service.admin;

import com.example.dto.response.admin.AdminUserResponse;
import com.example.entity.User;
import com.example.enums.Role;
import com.example.repository.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::map).toList();
    }

    public AdminUserResponse updateRole(String id, Role role) {
        User user = userRepository.findById(id).orElseThrow(EntityNotFoundException::new);
        user.setRole(role);
        userRepository.save(user);
        return map(user);
    }

    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) throw new EntityNotFoundException();
        userRepository.deleteById(id);
    }

    private AdminUserResponse map(User u) {
        return AdminUserResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .userName(u.getUserName())
                .fullName(u.getFullName())
                .role(u.getRole() != null ? u.getRole().name() : null)
                .build();
    }
}
