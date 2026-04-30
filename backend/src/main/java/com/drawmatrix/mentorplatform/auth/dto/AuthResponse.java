package com.drawmatrix.mentorplatform.auth.dto;

import com.drawmatrix.mentorplatform.auth.Role;

public record AuthResponse(
        String token,
        String userId,
        String fullName,
        String email,
        Role role
) {
}
