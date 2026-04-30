package com.drawmatrix.mentorplatform.collab;

import com.drawmatrix.mentorplatform.collab.dto.CodeSyncMessage;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class CodeSyncController {

    private final SimpMessagingTemplate messagingTemplate;

    public CodeSyncController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/code")
    public void syncCode(@Valid @Payload CodeSyncMessage message) {
        messagingTemplate.convertAndSend(
                "/topic/session/" + message.sessionId() + "/code",
                Map.of(
                        "sessionId", message.sessionId(),
                        "senderId", message.senderId(),
                        "language", message.language(),
                        "code", message.code()
                )
        );
    }
}
