export interface LeetCodeProblem {
  questionId: string;
  title: string;
  titleSlug: string;
  isPaidOnly: boolean;
  difficulty: "Easy" | "Medium" | "Hard";
  likes: number;
  dislikes: number;
  categoryTitle: string;
  acRate: string;
  frontendQuestionId: string;
  paidOnly: boolean;
  topicTags: string;
  hasSolution: boolean;
  hasVideoSolution: boolean;
  acRateRaw: number;
  totalAccepted: number;
  totalSubmission: number;
}

export type SortOption =
  | "likes"
  | "acceptance-rate"
  | "difficulty"
  | "total-accepted"
  | "title"
  | "solved"
  | "access";

export type DifficultyFilter = "All" | "Easy" | "Medium" | "Hard";

export interface FilterState {
  difficulty: DifficultyFilter;
  tags: string[];
  searchQuery: string;
}

// LeetCode API Types
export interface LeetCodeUserProfile {
  username: string;
  ranking: number;
  userAvatar: string;
  realName: string;
  countryName: string;
  company: string;
  jobTitle: string;
  reputation: number;
  solutionCount: number;
}

export interface ProblemsSolvedStats {
  easy: { solved: number; total: number };
  medium: { solved: number; total: number };
  hard: { solved: number; total: number };
  total: { solved: number; total: number };
}

export interface SubmissionCalendarData {
  [timestamp: string]: number;
}

export interface TopicStats {
  tagName: string;
  tagSlug: string;
  problemsSolved: number;
}

export interface ContestRanking {
  attendedContestsCount: number;
  rating: number;
  globalRanking: number;
  topPercentage: number;
  badge: string | null;
}

export interface RecentSubmission {
  id: string;
  title: string;
  titleSlug: string;
  timestamp: string;
}

