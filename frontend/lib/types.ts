export type Role = "MENTOR" | "STUDENT";

export type Session = {
  id: string;
  title: string;
  mentorId: string;
  studentId: string;
  status: "SCHEDULED" | "LIVE" | "COMPLETED";
  scheduledAt: string;
  createdAt: string;
};
