export type AdminDashboardStats = {
  totalQuizzes: number;
  readyQuizzes: number;
  totalResults: number;
};

export type AdminDashboardData = {
  email: string;
  stats: AdminDashboardStats;
  errors: string[];
};

export type TeacherQuiz = {
  sessionId: string;
  title: string;
  status: string;
  shareCode: string | null;
  questionCount: number;
  createdAt: string | null;
};

export type TeacherResultStatus = "completed" | "in_progress";

export type TeacherResult = {
  attemptId: string;
  sessionId: string;
  title: string;
  participantUsername: string;
  correctCount: number;
  totalQuestions: number;
  answeredCount: number;
  percentage: number;
  finalScore: string | null;
  shareCode: string | null;
  status: TeacherResultStatus;
  completedAt: string;
  recordedAt: string;
};

export type ScoreBand = {
  label: string;
  value: number;
  color: string;
};

export type ScoreDistribution = {
  quiz: string;
  average: number;
  bands: ScoreBand[];
};

export type TeacherDashboardStats = {
  totalQuizzes: number;
  totalResults: number;
  completedResults: number;
  averageScore: number;
};

export type TeacherDashboardData = {
  teacherId: string;
  teacherNumericId: number | null;
  username: string;
  email: string;
  stats: TeacherDashboardStats;
  quizzes: TeacherQuiz[];
  results: TeacherResult[];
  distributions: ScoreDistribution[];
  errors: string[];
};
