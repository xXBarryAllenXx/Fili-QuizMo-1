import type { SearchEntity, SearchRow } from "./types";

type DemoTeacherSeed = {
  id: number;
  userId: string;
  username: string;
  email: string;
  status: "active" | "inactive";
  schoolId: string;
  createdAt: string;
};

type DemoQuizSeed = {
  sessionId: string;
  teacherId: number;
  title: string;
  status: "ready";
  shareCode: string;
  questionCount: number;
  createdAt: string;
};

type DemoParticipantSeed = {
  attemptId: string;
  sessionId: string;
  teacherId: number;
  participantUsername: string;
  correctCount: number;
  totalQuestions: number;
  answeredCount: number;
  percentage: number;
  finalScore: string;
  startedAt: string;
  completedAt: string;
  recordedAt: string;
};

const TEACHER_SEEDS: readonly DemoTeacherSeed[] = [
  {
    id: 1,
    userId: "00000000-0000-4000-8000-000000000001",
    username: "msantos",
    email: "maria.santos@littleeinstein.edu",
    status: "active",
    schoolId: "LES-2026-001",
    createdAt: "2026-01-08T08:00:00.000Z",
  },
  {
    id: 2,
    userId: "00000000-0000-4000-8000-000000000002",
    username: "jdelacruz",
    email: "juan.delacruz@littleeinstein.edu",
    status: "inactive",
    schoolId: "LES-2026-002",
    createdAt: "2026-02-12T08:00:00.000Z",
  },
  {
    id: 3,
    userId: "00000000-0000-4000-8000-000000000003",
    username: "areyes",
    email: "ana.reyes@littleeinstein.edu",
    status: "active",
    schoolId: "LES-2026-003",
    createdAt: "2026-03-05T08:00:00.000Z",
  },
];

const QUIZ_SEEDS: readonly DemoQuizSeed[] = [
  {
    sessionId: "demo-session-01",
    teacherId: 1,
    title: "Science Fundamentals",
    status: "ready",
    shareCode: "SCI-2081",
    questionCount: 5,
    createdAt: "2026-09-01T08:00:00.000Z",
  },
  {
    sessionId: "demo-session-02",
    teacherId: 1,
    title: "Math Warm-Up",
    status: "ready",
    shareCode: "MATH-1140",
    questionCount: 8,
    createdAt: "2026-09-08T08:00:00.000Z",
  },
  {
    sessionId: "demo-session-03",
    teacherId: 2,
    title: "Reading Comprehension",
    status: "ready",
    shareCode: "READ-3302",
    questionCount: 6,
    createdAt: "2026-09-12T08:00:00.000Z",
  },
  {
    sessionId: "demo-session-04",
    teacherId: 3,
    title: "World Geography",
    status: "ready",
    shareCode: "GEO-4410",
    questionCount: 7,
    createdAt: "2026-09-20T08:00:00.000Z",
  },
];

const PARTICIPANT_SEEDS: readonly DemoParticipantSeed[] = [
  {
    attemptId: "demo-attempt-01",
    sessionId: "demo-session-01",
    teacherId: 1,
    participantUsername: "maria.student",
    correctCount: 4,
    totalQuestions: 5,
    answeredCount: 5,
    percentage: 80,
    finalScore: "4/5",
    startedAt: "2026-09-10T09:00:00.000Z",
    completedAt: "2026-09-10T09:05:00.000Z",
    recordedAt: "2026-09-10T09:05:00.000Z",
  },
  {
    attemptId: "demo-attempt-02",
    sessionId: "demo-session-01",
    teacherId: 1,
    participantUsername: "jose.student",
    correctCount: 5,
    totalQuestions: 5,
    answeredCount: 5,
    percentage: 100,
    finalScore: "5/5",
    startedAt: "2026-09-10T10:00:00.000Z",
    completedAt: "2026-09-10T10:06:00.000Z",
    recordedAt: "2026-09-10T10:06:00.000Z",
  },
  {
    attemptId: "demo-attempt-03",
    sessionId: "demo-session-02",
    teacherId: 1,
    participantUsername: "ana.student",
    correctCount: 5,
    totalQuestions: 8,
    answeredCount: 8,
    percentage: 63,
    finalScore: "5/8",
    startedAt: "2026-09-11T09:00:00.000Z",
    completedAt: "2026-09-11T09:08:00.000Z",
    recordedAt: "2026-09-11T09:08:00.000Z",
  },
  {
    attemptId: "demo-attempt-04",
    sessionId: "demo-session-02",
    teacherId: 1,
    participantUsername: "leo.student",
    correctCount: 3,
    totalQuestions: 8,
    answeredCount: 4,
    percentage: 38,
    finalScore: "3/8",
    startedAt: "2026-09-11T10:00:00.000Z",
    completedAt: "2026-09-11T10:04:00.000Z",
    recordedAt: "2026-09-11T10:04:00.000Z",
  },
  {
    attemptId: "demo-attempt-05",
    sessionId: "demo-session-03",
    teacherId: 2,
    participantUsername: "mia.student",
    correctCount: 6,
    totalQuestions: 6,
    answeredCount: 6,
    percentage: 100,
    finalScore: "6/6",
    startedAt: "2026-09-13T09:00:00.000Z",
    completedAt: "2026-09-13T09:07:00.000Z",
    recordedAt: "2026-09-13T09:07:00.000Z",
  },
  {
    attemptId: "demo-attempt-06",
    sessionId: "demo-session-04",
    teacherId: 3,
    participantUsername: "noah.student",
    correctCount: 6,
    totalQuestions: 7,
    answeredCount: 7,
    percentage: 86,
    finalScore: "6/7",
    startedAt: "2026-09-21T09:00:00.000Z",
    completedAt: "2026-09-21T09:06:00.000Z",
    recordedAt: "2026-09-21T09:06:00.000Z",
  },
];

export function createDemoRows(input: {
  role: "teacher" | "admin";
  teacherId: string | null;
  teacherNumericId: number | null;
  teacherUsername: string | null;
}): Record<SearchEntity, SearchRow[]> {
  const activeTeacherId =
    input.role === "teacher" && input.teacherId
      ? input.teacherId
      : TEACHER_SEEDS[0].userId;
  const activeTeacherNumericId =
    input.role === "teacher" && input.teacherNumericId
      ? input.teacherNumericId
      : TEACHER_SEEDS[0].id;
  const activeTeacherUsername =
    input.role === "teacher" && input.teacherUsername
      ? input.teacherUsername
      : TEACHER_SEEDS[0].username;

  const numericIdBySeed = new Map(
    TEACHER_SEEDS.map((teacher) => [
      teacher.id,
      teacher.id === TEACHER_SEEDS[0].id
        ? activeTeacherNumericId
        : teacher.id,
    ]),
  );
  const authIdBySeed = new Map(
    TEACHER_SEEDS.map((teacher) => [
      teacher.id,
      teacher.id === TEACHER_SEEDS[0].id
        ? activeTeacherId
        : teacher.userId,
    ]),
  );
  const usernameBySeed = new Map(
    TEACHER_SEEDS.map((teacher) => [
      teacher.id,
      teacher.id === TEACHER_SEEDS[0].id
        ? activeTeacherUsername
        : teacher.username,
    ]),
  );

  const teachers: SearchRow[] = TEACHER_SEEDS.map((teacher) => ({
    id: numericIdBySeed.get(teacher.id) ?? teacher.id,
    user_id: authIdBySeed.get(teacher.id) ?? teacher.userId,
    username: usernameBySeed.get(teacher.id) ?? teacher.username,
    email: teacher.email,
    status: teacher.status,
    school_id: teacher.schoolId,
    created_at: teacher.createdAt,
    updated_at: teacher.createdAt,
    quizzes: [
      {
        count: QUIZ_SEEDS.filter((quiz) => quiz.teacherId === teacher.id)
          .length,
      },
    ],
  }));

  const quizzes: SearchRow[] = QUIZ_SEEDS.map((quiz) => ({
    session_id: quiz.sessionId,
    teacher_id: numericIdBySeed.get(quiz.teacherId) ?? quiz.teacherId,
    title: quiz.title,
    status: quiz.status,
    share_code: quiz.shareCode,
    requested_question_count: quiz.questionCount,
    created_at: quiz.createdAt,
    updated_at: quiz.createdAt,
    teachers: {
      username: usernameBySeed.get(quiz.teacherId) ?? "",
    },
  }));

  const participants: SearchRow[] = PARTICIPANT_SEEDS.map((participant) => {
    const quiz = QUIZ_SEEDS.find(
      (candidate) => candidate.sessionId === participant.sessionId,
    );

    return {
      attempt_id: participant.attemptId,
      session_id: participant.sessionId,
      title: quiz?.title ?? "",
      participant_username: participant.participantUsername,
      correct_count: participant.correctCount,
      total_questions: participant.totalQuestions,
      answered_count: participant.answeredCount,
      percentage: participant.percentage,
      final_score: participant.finalScore,
      share_code: quiz?.shareCode ?? "",
      started_at: participant.startedAt,
      completed_at: participant.completedAt,
      recorded_at: participant.recordedAt,
      teacher_id:
        authIdBySeed.get(participant.teacherId) ?? "",
      teacher_username:
        usernameBySeed.get(participant.teacherId) ?? "",
      attempt_number: 1,
    };
  });

  return { quizzes, participants, teachers };
}
