package com.drawmatrix.mentorplatform.video.dto;

import jakarta.validation.constraints.NotBlank;

public record SignalMessage(
        @NotBlank String sessionId,
        @NotBlank String senderId,
        @NotBlank String type,
        @NotBlank String payload
) {
}
