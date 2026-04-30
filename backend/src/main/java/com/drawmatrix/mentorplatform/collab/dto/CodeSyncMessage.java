package com.drawmatrix.mentorplatform.collab.dto;

import jakarta.validation.constraints.NotBlank;

public record CodeSyncMessage(
        @NotBlank String sessionId,
        @NotBlank String senderId,
        @NotBlank String language,
        @NotBlank String code
) {
}
