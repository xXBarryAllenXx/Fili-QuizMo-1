import type { SearchEntity, SearchRow } from "./types";

type DemoTeacherSeed = {
  id: string;
  username: string;
  email: string;
  accountStatus: "active" | "inactive";
  createdAt: string;
};

type DemoStudentSeed = {
  id: string;
  teacherId: string;
  name: string;
  schoolId: string;
  email: string;
  enrollmentStatus: "active" | "inactive" | "graduated";
  accountStatus: "active" | "inactive";
  createdAt: string;
};

type DemoQuizSeed = {
  id: string;
  teacherId: string;
  title: string;
  status: "draft" | "published" | "archived";
  questionCount: number;
  createdAt: string;
};

type DemoSessionSeed = {
  id: string;
  quizId: string;
  code: string;
};

type DemoParticipantSeed = {
  id: string;
  sessionId: string;
  studentId: string | null;
  username: string;
  status: "not_started" | "in_progress" | "completed";
  score: number | null;
  joinedAt: string;
};

const TEACHER_SEEDS: readonly DemoTeacherSeed[] = [
  {
    id: "demo-teacher-a",
    username: "msantos",
    email: "maria.santos@littleeinstein.edu",
    accountStatus: "active",
    createdAt: "2026-01-08T08:00:00.000Z",
  },
  {
    id: "demo-teacher-b",
    username: "jdelacruz",
    email: "juan.delacruz@littleeinstein.edu",
    accountStatus: "inactive",
    createdAt: "2026-02-12T08:00:00.000Z",
  },
  {
    id: "demo-teacher-c",
    username: "areyes",
    email: "ana.reyes@littleeinstein.edu",
    accountStatus: "active",
    createdAt: "2026-03-05T08:00:00.000Z",
  },
];

const STUDENT_SEEDS: readonly DemoStudentSeed[] = [
  {
    id: "demo-student-01",
    teacherId: "demo-teacher-a",
    name: "Maria Santos",
    schoolId: "LES-2026-001",
    email: "maria.santos@student.edu",
    enrollmentStatus: "active",
    accountStatus: "active",
    createdAt: "2026-06-15T09:00:00.000Z",
  },
  {
    id: "demo-student-02",
    teacherId: "demo-teacher-a",
    name: "Carlo Mendoza",
    schoolId: "LES-2026-002",
    email: "carlo.mendoza@student.edu",
    enrollmentStatus: "active",
    accountStatus: "active",
    createdAt: "2026-06-18T09:00:00.000Z",
  },
  {
    id: "demo-student-03",
    teacherId: "demo-teacher-a",
    name: "Ana Reyes",
    schoolId: "LES-2026-003",
    email: "ana.reyes@student.edu",
    enrollmentStatus: "inactive",
    accountStatus: "inactive",
    createdAt: "2026-07-02T09:00:00.000Z",
  },
  {
    id: "demo-student-04",
    teacherId: "demo-teacher-a",
    name: "Joshua Lim",
    schoolId: "LES-2026-004",
    email: "joshua.lim@student.edu",
    enrollmentStatus: "active",
    accountStatus: "active",
    createdAt: "2026-07-10T09:00:00.000Z",
  },
  {
    id: "demo-student-05",
    teacherId: "demo-teacher-a",
    name: "Bea Villanueva",
    schoolId: "LES-2026-005",
    email: "bea.villanueva@student.edu",
    enrollmentStatus: "graduated",
    accountStatus: "inactive",
    createdAt: "2026-08-01T09:00:00.000Z",
  },
  {
    id: "demo-student-06",
    teacherId: "demo-teacher-b",
    name: "Juan Dela Cruz",
    schoolId: "LES-2026-006",
    email: "juan.delacruz@student.edu",
    enrollmentStatus: "active",
    accountStatus: "active",
    createdAt: "2026-06-20T09:00:00.000Z",
  },
  {
    id: "demo-student-07",
    teacherId: "demo-teacher-b",
    name: "Sofia Garcia",
    schoolId: "LES-2026-007",
    email: "sofia.garcia@student.edu",
    enrollmentStatus: "active",
    accountStatus: "active",
    createdAt: "2026-07-11T09:00:00.000Z",
  },
  {
    id: "demo-student-08",
    teacherId: "demo-teacher-b",
    name: "Miguel Torres",
    schoolId: "LES-2026-008",
    email: "miguel.torres@student.edu",
    enrollmentStatus: "inactive",
    accountStatus: "active",
    createdAt: "2026-07-19T09:00:00.000Z",
  },
  {
    id: "demo-student-09",
    teacherId: "demo-teacher-b",
    name: "Hannah Cruz",
    schoolId: "LES-2026-009",
    email: "hannah.cruz@student.edu",
    enrollmentStatus: "active",
    accountStatus: "inactive",
    createdAt: "2026-08-05T09:00:00.000Z",
  },
  {
    id: "demo-student-10",
    teacherId: "demo-teacher-c",
    name: "Liam Navarro",
    schoolId: "LES-2026-010",
    email: "liam.navarro@student.edu",
    enrollmentStatus: "active",
    accountStatus: "active",
    createdAt: "2026-08-12T09:00:00.000Z",
  },
  {
    id: "demo-student-11",
    teacherId: "demo-teacher-c",
    name: "Emma Dizon",
    schoolId: "LES-2026-011",
    email: "emma.dizon@student.edu",
    enrollmentStatus: "graduated",
    accountStatus: "inactive",
    createdAt: "2026-08-21T09:00:00.000Z",
  },
  {
    id: "demo-student-12",
    teacherId: "demo-teacher-c",
    name: "Noah Pascual",
    schoolId: "LES-2026-012",
    email: "noah.pascual@student.edu",
    enrollmentStatus: "active",
    accountStatus: "active",
    createdAt: "2026-09-03T09:00:00.000Z",
  },
  {
    id: "demo-student-13",
    teacherId: "demo-teacher-c",
    name: "Isabella Ramos",
    schoolId: "LES-2026-013",
    email: "isabella.ramos@student.edu",
    enrollmentStatus: "active",
    accountStatus: "active",
    createdAt: "2026-09-15T09:00:00.000Z",
  },
];

const QUIZ_SEEDS: readonly DemoQuizSeed[] = [
  {
    id: "demo-quiz-01",
    teacherId: "demo-teacher-a",
    title: "General Knowledge Quiz",
    status: "published",
    questionCount: 20,
    createdAt: "2026-05-10T08:00:00.000Z",
  },
  {
    id: "demo-quiz-02",
    teacherId: "demo-teacher-a",
    title: "Science Fundamentals",
    status: "published",
    questionCount: 15,
    createdAt: "2026-06-02T08:00:00.000Z",
  },
  {
    id: "demo-quiz-03",
    teacherId: "demo-teacher-a",
    title: "Math Essentials",
    status: "draft",
    questionCount: 25,
    createdAt: "2026-07-14T08:00:00.000Z",
  },
  {
    id: "demo-quiz-04",
    teacherId: "demo-teacher-a",
    title: "English Vocabulary",
    status: "published",
    questionCount: 10,
    createdAt: "2026-08-22T08:00:00.000Z",
  },
  {
    id: "demo-quiz-05",
    teacherId: "demo-teacher-a",
    title: "Filipino Culture Trivia",
    status: "archived",
    questionCount: 12,
    createdAt: "2026-09-05T08:00:00.000Z",
  },
  {
    id: "demo-quiz-06",
    teacherId: "demo-teacher-b",
    title: "Algebra Basics",
    status: "published",
    questionCount: 18,
    createdAt: "2026-06-11T08:00:00.000Z",
  },
  {
    id: "demo-quiz-07",
    teacherId: "demo-teacher-b",
    title: "Chemistry Lab Safety",
    status: "draft",
    questionCount: 8,
    createdAt: "2026-07-21T08:00:00.000Z",
  },
  {
    id: "demo-quiz-08",
    teacherId: "demo-teacher-b",
    title: "World History",
    status: "published",
    questionCount: 22,
    createdAt: "2026-08-30T08:00:00.000Z",
  },
  {
    id: "demo-quiz-09",
    teacherId: "demo-teacher-c",
    title: "Reading Comprehension",
    status: "published",
    questionCount: 14,
    createdAt: "2026-09-08T08:00:00.000Z",
  },
  {
    id: "demo-quiz-10",
    teacherId: "demo-teacher-c",
    title: "Earth Science",
    status: "draft",
    questionCount: 16,
    createdAt: "2026-09-28T08:00:00.000Z",
  },
];

const SESSION_SEEDS: readonly DemoSessionSeed[] = [
  { id: "demo-session-01", quizId: "demo-quiz-01", code: "SESS-GK-1042" },
  { id: "demo-session-02", quizId: "demo-quiz-02", code: "SESS-SCI-2081" },
  { id: "demo-session-03", quizId: "demo-quiz-03", code: "SESS-MATH-3004" },
  { id: "demo-session-04", quizId: "demo-quiz-06", code: "SESS-ALG-4102" },
  { id: "demo-session-05", quizId: "demo-quiz-08", code: "SESS-HIST-5077" },
  { id: "demo-session-06", quizId: "demo-quiz-09", code: "SESS-READ-6088" },
];

const PARTICIPANT_SEEDS: readonly DemoParticipantSeed[] = [
  {
    id: "demo-participant-01",
    sessionId: "demo-session-01",
    studentId: "demo-student-01",
    username: "maria.santos",
    status: "completed",
    score: 92,
    joinedAt: "2026-09-10T09:00:00.000Z",
  },
  {
    id: "demo-participant-02",
    sessionId: "demo-session-01",
    studentId: "demo-student-02",
    username: "carlo.mendoza",
    status: "completed",
    score: 78,
    joinedAt: "2026-09-10T09:10:00.000Z",
  },
  {
    id: "demo-participant-03",
    sessionId: "demo-session-01",
    studentId: null,
    username: "guest_star",
    status: "in_progress",
    score: null,
    joinedAt: "2026-09-11T09:20:00.000Z",
  },
  {
    id: "demo-participant-04",
    sessionId: "demo-session-02",
    studentId: "demo-student-04",
    username: "joshua.lim",
    status: "completed",
    score: 88,
    joinedAt: "2026-09-15T09:00:00.000Z",
  },
  {
    id: "demo-participant-05",
    sessionId: "demo-session-02",
    studentId: "demo-student-05",
    username: "bea.villanueva",
    status: "not_started",
    score: null,
    joinedAt: "2026-09-16T09:00:00.000Z",
  },
  {
    id: "demo-participant-06",
    sessionId: "demo-session-03",
    studentId: "demo-student-03",
    username: "ana.reyes",
    status: "completed",
    score: 64,
    joinedAt: "2026-09-20T09:00:00.000Z",
  },
  {
    id: "demo-participant-07",
    sessionId: "demo-session-03",
    studentId: null,
    username: "guest_echo",
    status: "in_progress",
    score: null,
    joinedAt: "2026-09-20T09:20:00.000Z",
  },
  {
    id: "demo-participant-08",
    sessionId: "demo-session-04",
    studentId: "demo-student-06",
    username: "juan.delacruz",
    status: "completed",
    score: 81,
    joinedAt: "2026-09-22T09:00:00.000Z",
  },
  {
    id: "demo-participant-09",
    sessionId: "demo-session-04",
    studentId: "demo-student-07",
    username: "sofia.garcia",
    status: "completed",
    score: 95,
    joinedAt: "2026-09-22T09:10:00.000Z",
  },
  {
    id: "demo-participant-10",
    sessionId: "demo-session-05",
    studentId: "demo-student-08",
    username: "miguel.torres",
    status: "not_started",
    score: null,
    joinedAt: "2026-09-25T09:00:00.000Z",
  },
  {
    id: "demo-participant-11",
    sessionId: "demo-session-05",
    studentId: "demo-student-09",
    username: "hannah.cruz",
    status: "completed",
    score: 73,
    joinedAt: "2026-09-25T09:10:00.000Z",
  },
  {
    id: "demo-participant-12",
    sessionId: "demo-session-06",
    studentId: "demo-student-10",
    username: "liam.navarro",
    status: "completed",
    score: 89,
    joinedAt: "2026-10-02T09:00:00.000Z",
  },
  {
    id: "demo-participant-13",
    sessionId: "demo-session-06",
    studentId: "demo-student-11",
    username: "emma.dizon",
    status: "completed",
    score: 91,
    joinedAt: "2026-10-02T09:10:00.000Z",
  },
  {
    id: "demo-participant-14",
    sessionId: "demo-session-06",
    studentId: "demo-student-12",
    username: "noah.pascual",
    status: "in_progress",
    score: null,
    joinedAt: "2026-10-03T09:00:00.000Z",
  },
  {
    id: "demo-participant-15",
    sessionId: "demo-session-06",
    studentId: "demo-student-13",
    username: "isabella.ramos",
    status: "not_started",
    score: null,
    joinedAt: "2026-10-04T09:00:00.000Z",
  },
];

function searchText(...values: Array<string | null | undefined>): string {
  return values.filter(Boolean).join(" ").toLowerCase();
}

function participantRows(): SearchRow[] {
  const sessionsById = new Map(
    SESSION_SEEDS.map((session) => [session.id, session]),
  );
  const quizzesById = new Map(QUIZ_SEEDS.map((quiz) => [quiz.id, quiz]));
  const studentsById = new Map(
    STUDENT_SEEDS.map((student) => [student.id, student]),
  );

  return PARTICIPANT_SEEDS.map((participant) => {
    const session = sessionsById.get(participant.sessionId);
    const quiz = session ? quizzesById.get(session.quizId) : undefined;
    const student = participant.studentId
      ? studentsById.get(participant.studentId)
      : undefined;

    return {
      participant_id: participant.id,
      session_id: participant.sessionId,
      session_code: session?.code ?? "",
      quiz_id: quiz?.id ?? "",
      quiz_title: quiz?.title ?? "",
      username: participant.username,
      status: participant.status,
      score: participant.score,
      joined_at: participant.joinedAt,
      student_school_id: student?.schoolId ?? "",
      student_email: student?.email ?? "",
      student_teacher_id: student?.teacherId ?? null,
      teacher_id: quiz?.teacherId ?? "",
      teacher_username: quiz
        ? TEACHER_SEEDS.find((teacher) => teacher.id === quiz.teacherId)
            ?.username ?? ""
        : "",
      // Quiz title is indexed separately so both trigram indexes can be used.
      search_text: searchText(participant.username, participant.status),
      quiz_search_text: searchText(quiz?.title, quiz?.status),
    };
  });
}

function teacherRows(): SearchRow[] {
  return TEACHER_SEEDS.map((teacher) => ({
    teacher_id: teacher.id,
    username: teacher.username,
    email: teacher.email,
    account_status: teacher.accountStatus,
    quiz_count: QUIZ_SEEDS.filter((quiz) => quiz.teacherId === teacher.id)
      .length,
    created_at: teacher.createdAt,
    search_text: searchText(
      teacher.username,
      teacher.email,
      teacher.accountStatus,
    ),
  }));
}

export function createDemoRows(input: {
  role: "teacher" | "admin";
  teacherId: string | null;
  teacherUsername: string | null;
}): Record<SearchEntity, SearchRow[]> {
  const activeTeacherId =
    input.role === "teacher" && input.teacherId
      ? input.teacherId
      : "demo-teacher-a";
  const activeTeacherUsername =
    input.role === "teacher" && input.teacherUsername
      ? input.teacherUsername
      : "msantos";

  const teacherNameById = new Map(
    TEACHER_SEEDS.map((teacher) => [
      teacher.id,
      teacher.id === "demo-teacher-a"
        ? activeTeacherUsername
        : teacher.username,
    ]),
  );

  const students: SearchRow[] = STUDENT_SEEDS.map((student) => {
    const teacherId =
      student.teacherId === "demo-teacher-a"
        ? activeTeacherId
        : student.teacherId;

    return {
      student_id: student.id,
      teacher_id: teacherId,
      teacher_username:
        teacherNameById.get(student.teacherId) ?? "",
      name: student.name,
      school_id: student.schoolId,
      email: student.email,
      enrollment_status: student.enrollmentStatus,
      account_status: student.accountStatus,
      created_at: student.createdAt,
      search_text: searchText(
        student.name,
        student.schoolId,
        student.email,
        student.enrollmentStatus,
        student.accountStatus,
      ),
    };
  });

  const quizzes: SearchRow[] = QUIZ_SEEDS.map((quiz) => {
    const teacherId =
      quiz.teacherId === "demo-teacher-a"
        ? activeTeacherId
        : quiz.teacherId;

    return {
      quiz_id: quiz.id,
      teacher_id: teacherId,
      teacher_username: teacherNameById.get(quiz.teacherId) ?? "",
      title: quiz.title,
      status: quiz.status,
      question_count: quiz.questionCount,
      created_at: quiz.createdAt,
      search_text: searchText(quiz.title, quiz.status),
    };
  });

  const participants = participantRows().map((participant) => {
    const teacherId =
      participant.teacher_id === "demo-teacher-a"
        ? activeTeacherId
        : participant.teacher_id;
    const studentTeacherId =
      participant.student_teacher_id === "demo-teacher-a"
        ? activeTeacherId
        : participant.student_teacher_id;

    return {
      ...participant,
      student_teacher_id: studentTeacherId,
      teacher_id: teacherId,
      teacher_username:
        typeof participant.teacher_username === "string"
          ? teacherNameById.get(participant.teacher_username) ??
            (participant.teacher_id === "demo-teacher-a"
              ? activeTeacherUsername
              : participant.teacher_username)
          : "",
    };
  });

  return {
    students,
    quizzes,
    participants,
    teachers: teacherRows(),
  };
}
