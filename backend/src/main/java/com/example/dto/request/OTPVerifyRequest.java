package com.example.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OTPVerifyRequest {
    private String email;
    private String otp;
}
