// LeetCode GraphQL API Service
// Uses Next.js API route as proxy to avoid CORS issues

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

async function graphqlRequest<T>(
  query: string,
  variables: Record<string, any> = {}
): Promise<T> {
  // Use our Next.js API route as a proxy to avoid CORS issues
  const response = await fetch('/api/leetcode', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors && result.errors.length > 0) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}

// 1. Public Profile
export async function getUserPublicProfile(username: string) {
  const query = `
    query userPublicProfile($username: String!) {
      matchedUser(username: $username) {
        username
        githubUrl
        twitterUrl
        linkedinUrl
        profile {
          ranking
          userAvatar
          realName
          aboutMe
          school
          countryName
          company
          jobTitle
          skillTags
          reputation
          solutionCount
        }
      }
    }
  `;

  return graphqlRequest<{
    matchedUser: {
      username: string;
      githubUrl: string | null;
      twitterUrl: string | null;
      linkedinUrl: string | null;
      profile: {
        ranking: number;
        userAvatar: string;
        realName: string;
        aboutMe: string;
        school: string;
        countryName: string;
        company: string;
        jobTitle: string;
        skillTags: string[];
        reputation: number;
        solutionCount: number;
      } | null;
    } | null;
  }>(query, { username });
}

// 2. Problems Solved (By Difficulty)
export async function getUserProblemsSolved(username: string) {
  const query = `
    query userProblemsSolved($username: String!) {
      allQuestionsCount {
        difficulty
        count
      }
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
          totalSubmissionNum {
            difficulty
            count
            submissions
          }
        }
      }
    }
  `;

  return graphqlRequest<{
    allQuestionsCount: Array<{ difficulty: string; count: number }>;
    matchedUser: {
      submitStats: {
        acSubmissionNum: Array<{
          difficulty: string;
          count: number;
          submissions: number;
        }>;
        totalSubmissionNum: Array<{
          difficulty: string;
          count: number;
          submissions: number;
        }>;
      } | null;
    } | null;
  }>(query, { username });
}

// 3. Submission Heatmap (Calendar)
export async function getUserProfileCalendar(username: string, year?: number) {
  const query = `
    query userProfileCalendar($username: String!, $year: Int) {
      matchedUser(username: $username) {
        userCalendar(year: $year) {
          activeYears
          streak
          totalActiveDays
          dccBadges {
            timestamp
            badge {
              name
              icon
            }
          }
          submissionCalendar
        }
      }
    }
  `;

  return graphqlRequest<{
    matchedUser: {
      userCalendar: {
        activeYears: number[];
        streak: number;
        totalActiveDays: number;
        dccBadges: Array<{
          timestamp: string;
          badge: {
            name: string;
            icon: string;
          };
        }>;
        submissionCalendar: string; // JSON string
      } | null;
    } | null;
  }>(query, { username, year });
}

// 4. Topic-Wise Problems Solved
export async function getSkillStats(username: string) {
  const query = `
    query skillStats($username: String!) {
      matchedUser(username: $username) {
        tagProblemCounts {
          advanced {
            tagName
            tagSlug
            problemsSolved
          }
          intermediate {
            tagName
            tagSlug
            problemsSolved
          }
          fundamental {
            tagName
            tagSlug
            problemsSolved
          }
        }
      }
    }
  `;

  return graphqlRequest<{
    matchedUser: {
      tagProblemCounts: {
        advanced: Array<{
          tagName: string;
          tagSlug: string;
          problemsSolved: number;
        }>;
        intermediate: Array<{
          tagName: string;
          tagSlug: string;
          problemsSolved: number;
        }>;
        fundamental: Array<{
          tagName: string;
          tagSlug: string;
          problemsSolved: number;
        }>;
      } | null;
    } | null;
  }>(query, { username });
}

// 5. Contest Rating & History
export async function getUserContestRankingInfo(username: string) {
  const query = `
    query userContestRankingInfo($username: String!) {
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
        topPercentage
        badge {
          name
        }
      }
      userContestRankingHistory(username: $username) {
        attended
        trendDirection
        problemsSolved
        totalProblems
        finishTimeInSeconds
        rating
        ranking
        contest {
          title
          startTime
        }
      }
    }
  `;

  return graphqlRequest<{
    userContestRanking: {
      attendedContestsCount: number;
      rating: number;
      globalRanking: number;
      topPercentage: number;
      badge: {
        name: string;
      } | null;
    } | null;
    userContestRankingHistory: Array<{
      attended: boolean;
      trendDirection: string;
      problemsSolved: number;
      totalProblems: number;
      finishTimeInSeconds: number;
      rating: number;
      ranking: number;
      contest: {
        title: string;
        startTime: number;
      };
    }>;
  }>(query, { username });
}

// 6. Recent Submissions
export async function getRecentAcSubmissions(username: string, limit: number = 15) {
  const query = `
    query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        id
        title
        titleSlug
        timestamp
      }
    }
  `;

  return graphqlRequest<{
    recentAcSubmissionList: Array<{
      id: string;
      title: string;
      titleSlug: string;
      timestamp: string;
    }>;
  }>(query, { username, limit });
}

// Helper: Get solved problem slugs from recent submissions
// Note: LeetCode's public API only provides recent submissions (up to ~50),
// not the complete list of all solved problems. This will sync recent solves.
export async function getAllSolvedProblemSlugs(username: string): Promise<Set<string>> {
  const solvedSlugs = new Set<string>();
  
  try {
    // Fetch recent AC submissions (LeetCode typically allows up to 50)
    const data = await getRecentAcSubmissions(username, 50);
    data.recentAcSubmissionList.forEach((submission) => {
      solvedSlugs.add(submission.titleSlug);
    });
  } catch (err) {
    console.error("Error fetching solved problems:", err);
    throw err;
  }

  return solvedSlugs;
}

