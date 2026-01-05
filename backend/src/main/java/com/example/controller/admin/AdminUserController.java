package com.example.controller.admin;

import com.example.dto.ApiResponse;
import com.example.dto.request.UpdateUserRoleRequest;
import com.example.dto.response.admin.AdminUserResponse;
import com.example.enums.Role;
import com.example.service.admin.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(), "OK", adminUserService.getAllUsers()
        ));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateRole(
            @PathVariable String id,
            @RequestBody UpdateUserRoleRequest req
    ) {
        Role role = Role.valueOf(req.getRole().toUpperCase());
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(), "Cập nhật quyền thành công", adminUserService.updateRole(id, role)
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(), "Xóa người dùng thành công", null
        ));
    }
}
