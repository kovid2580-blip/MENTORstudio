package com.drawmatrix.mentorplatform.chat;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatRestController {

    private final MessageRepository messageRepository;

    @GetMapping("/{sessionId}")
    public List<Message> history(@PathVariable String sessionId) {
        return messageRepository.findBySessionIdOrderBySentAtAsc(sessionId);
    }
}
