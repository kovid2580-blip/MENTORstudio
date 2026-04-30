package com.drawmatrix.mentorplatform.session;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionRepository extends JpaRepository<Session, String> {
    List<Session> findByMentorIdOrStudentIdOrderByCreatedAtDesc(String mentorId, String studentId);
}
