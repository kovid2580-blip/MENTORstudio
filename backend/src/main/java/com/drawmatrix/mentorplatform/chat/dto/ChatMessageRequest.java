package com.drawmatrix.mentorplatform.chat.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatMessageRequest(
        @NotBlank String sessionId,
        @NotBlank String senderId,
        @NotBlank String senderName,
        @NotBlank String content
) {
}
