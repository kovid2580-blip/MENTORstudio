package com.drawmatrix.mentorplatform.session;

import com.drawmatrix.mentorplatform.session.dto.CreateSessionRequest;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;

    public Session createSession(CreateSessionRequest request) {
        Session session = Session.builder()
                .id(UUID.randomUUID().toString())
                .title(request.title())
                .mentorId(request.mentorId())
                .studentId(request.studentId())
                .scheduledAt(request.scheduledAt())
                .status(SessionStatus.SCHEDULED)
                .createdAt(Instant.now())
                .build();
        return sessionRepository.save(session);
    }

    public Session joinSession(String sessionId, String participantId) {
        Session session = getSession(sessionId);
        if (!participantId.equals(session.getMentorId()) && !participantId.equals(session.getStudentId())) {
            throw new IllegalArgumentException("Participant is not part of this session");
        }
        session.setStatus(SessionStatus.LIVE);
        return sessionRepository.save(session);
    }

    public Session endSession(String sessionId) {
        Session session = getSession(sessionId);
        session.setStatus(SessionStatus.COMPLETED);
        return sessionRepository.save(session);
    }

    public Session getSession(String sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
    }

    public List<Session> listAll() {
        return sessionRepository.findAll();
    }

    public List<Session> listForUser(String userId) {
        return sessionRepository.findByMentorIdOrStudentIdOrderByCreatedAtDesc(userId, userId);
    }
}
