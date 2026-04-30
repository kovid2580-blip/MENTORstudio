package com.drawmatrix.mentorplatform.video;

import com.drawmatrix.mentorplatform.video.dto.SignalMessage;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class SignalController {

    private final SimpMessagingTemplate messagingTemplate;

    public SignalController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/signal")
    public void signal(@Valid @Payload SignalMessage message) {
        messagingTemplate.convertAndSend(
                "/topic/session/" + message.sessionId() + "/signal",
                Map.of(
                        "sessionId", message.sessionId(),
                        "senderId", message.senderId(),
                        "type", message.type(),
                        "payload", message.payload()
                )
        );
    }
}
