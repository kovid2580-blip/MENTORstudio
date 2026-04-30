package com.drawmatrix.mentorplatform.session.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record CreateSessionRequest(
        @NotBlank String title,
        @NotBlank String mentorId,
        @NotBlank String studentId,
        @NotNull Instant scheduledAt
) {
}
