package com.drawmatrix.mentorplatform.session;

import com.drawmatrix.mentorplatform.session.dto.CreateSessionRequest;
import com.drawmatrix.mentorplatform.session.dto.JoinSessionRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping("/create")
    public Session create(@Valid @RequestBody CreateSessionRequest request) {
        return sessionService.createSession(request);
    }

    @PostMapping("/{sessionId}/join")
    public Session join(@PathVariable String sessionId, @Valid @RequestBody JoinSessionRequest request) {
        return sessionService.joinSession(sessionId, request.participantId());
    }

    @PostMapping("/{sessionId}/end")
    public Session end(@PathVariable String sessionId) {
        return sessionService.endSession(sessionId);
    }

    @GetMapping("/{sessionId}")
    public Session getById(@PathVariable String sessionId) {
        return sessionService.getSession(sessionId);
    }

    @GetMapping
    public List<Session> list(@RequestParam(required = false) String userId) {
        return userId == null || userId.isBlank() ? sessionService.listAll() : sessionService.listForUser(userId);
    }
}
