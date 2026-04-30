package com.drawmatrix.mentorplatform.session.dto;

import jakarta.validation.constraints.NotBlank;

public record JoinSessionRequest(@NotBlank String participantId) {
}
