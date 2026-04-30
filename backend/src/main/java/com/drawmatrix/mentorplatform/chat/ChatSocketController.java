package com.drawmatrix.mentorplatform.chat;

import com.drawmatrix.mentorplatform.chat.dto.ChatMessageRequest;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.handler.annotation.MessageMapping;

@Controller
@RequiredArgsConstructor
public class ChatSocketController {

    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat")
    public void sendMessage(@Valid @Payload ChatMessageRequest request) {
        Message message = Message.builder()
                .id(UUID.randomUUID().toString())
                .sessionId(request.sessionId())
                .senderId(request.senderId())
                .senderName(request.senderName())
                .content(request.content())
                .sentAt(Instant.now())
                .build();

        Message saved = messageRepository.save(message);
        messagingTemplate.convertAndSend("/topic/session/" + request.sessionId() + "/chat", saved);
    }
}
