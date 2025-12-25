"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { LeetCodeProblem, FilterState, SortOption } from "@/types";
import ProblemCard from "@/components/ProblemCard";
import FilterBar from "@/components/FilterBar";
import ThemeToggle from "@/components/ThemeToggle";
import Login from "@/components/Login";
import UserProfile from "@/components/UserProfile";
import SubmissionHeatmap from "@/components/SubmissionHeatmap";
import TopicStats from "@/components/TopicStats";
import * as leetcodeApi from "@/lib/leetcode-api";

export default function Home() {
  const [problems, setProblems] = useState<LeetCodeProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());
  const [syncingSolved, setSyncingSolved] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    difficulty: "All",
    tags: [],
    searchQuery: "",
  });
  const [sortBy, setSortBy] = useState<SortOption>("likes");
  const [hideTags, setHideTags] = useState<boolean>(true); // Default to hiding tags
  const [hideSolved, setHideSolved] = useState<boolean>(false); // Default to showing solved
  const hasSyncedRef = useRef<Set<string>>(new Set()); // Track which usernames we've synced

  // Load filters from localStorage
  useEffect(() => {
    const storedFilters = localStorage.getItem("leetcode_filters");
    if (storedFilters) {
      try {
        const parsedFilters = JSON.parse(storedFilters);
        setFilters({
          difficulty: parsedFilters.difficulty || "All",
          tags: parsedFilters.tags || [],
          searchQuery: parsedFilters.searchQuery || "",
        });
      } catch (err) {
        console.error("Error loading filters:", err);
      }
    }
  }, []);

  // Save filters to localStorage
  useEffect(() => {
    localStorage.setItem("leetcode_filters", JSON.stringify(filters));
  }, [filters]);

  // Load sortBy from localStorage
  useEffect(() => {
    const storedSortBy = localStorage.getItem("leetcode_sort_by");
    if (storedSortBy) {
      try {
        setSortBy(storedSortBy as SortOption);
      } catch (err) {
        console.error("Error loading sortBy:", err);
      }
    }
  }, []);

  // Save sortBy to localStorage
  useEffect(() => {
    localStorage.setItem("leetcode_sort_by", sortBy);
  }, [sortBy]);

  // Load hideTags preference from localStorage
  useEffect(() => {
    const storedHideTags = localStorage.getItem("leetcode_hide_tags");
    if (storedHideTags !== null) {
      setHideTags(storedHideTags === "true");
    }
    // If no preference stored, default to true (hide tags)
  }, []);

  // Save hideTags preference to localStorage
  useEffect(() => {
    localStorage.setItem("leetcode_hide_tags", hideTags.toString());
  }, [hideTags]);

  // Load hideSolved preference from localStorage
  useEffect(() => {
    const storedHideSolved = localStorage.getItem("leetcode_hide_solved");
    if (storedHideSolved !== null) {
      setHideSolved(storedHideSolved === "true");
    }
    // If no preference stored, default to false (show solved)
  }, []);

  // Save hideSolved preference to localStorage
  useEffect(() => {
    localStorage.setItem("leetcode_hide_solved", hideSolved.toString());
  }, [hideSolved]);

  // Load solved problems from localStorage
  useEffect(() => {
    const storedSolved = localStorage.getItem("leetcode_solved_problems");
    if (storedSolved) {
      try {
        const solvedArray = JSON.parse(storedSolved);
        setSolvedProblems(new Set(solvedArray));
      } catch (err) {
        console.error("Error loading solved problems:", err);
      }
    }
  }, []);

  // Save solved problems to localStorage whenever it changes
  // Only save if not currently syncing to avoid conflicts
  useEffect(() => {
    if (username && solvedProblems.size > 0 && !syncingSolved) {
      localStorage.setItem(
        "leetcode_solved_problems",
        JSON.stringify(Array.from(solvedProblems))
      );
    }
  }, [solvedProblems, username, syncingSolved]);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data: LeetCodeProblem[]) => {
        setProblems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading data:", err);
        setLoading(false);
      });
  }, []);

  // Function to sync solved problems from LeetCode API
  // Memoized with useCallback to prevent infinite loops
  const syncSolvedProblems = useCallback(async () => {
    if (!username || problems.length === 0 || syncingSolved) return;

    // Check if we've already synced for this username and problems set
    const syncKey = `${username}-${problems.length}`;
    if (hasSyncedRef.current.has(syncKey)) return;

    setSyncingSolved(true);
    hasSyncedRef.current.add(syncKey);
    
    try {
      // Fetch solved problem slugs from LeetCode API
      const solvedSlugs = await leetcodeApi.getAllSolvedProblemSlugs(username);
      
      // Create a mapping of titleSlug to questionId for our problems
      const slugToIdMap = new Map<string, string>();
      problems.forEach((problem) => {
        slugToIdMap.set(problem.titleSlug, problem.questionId);
      });

      // Convert solved slugs to questionIds
      const solvedIds = new Set<string>();
      solvedSlugs.forEach((slug) => {
        const questionId = slugToIdMap.get(slug);
        if (questionId) {
          solvedIds.add(questionId);
        }
      });

      // Merge with existing solved problems (don't overwrite manually marked ones)
      setSolvedProblems((prev) => {
        const merged = new Set(prev);
        solvedIds.forEach((id) => merged.add(id));
        
        // Save to localStorage
        const mergedArray = Array.from(merged);
        if (mergedArray.length > 0) {
          localStorage.setItem(
            "leetcode_solved_problems",
            JSON.stringify(mergedArray)
          );
        }
        
        return merged;
      });
    } catch (err) {
      console.error("Error syncing solved problems:", err);
      // Remove from synced set on error so we can retry
      hasSyncedRef.current.delete(syncKey);
      // Fallback to localStorage if API fails
      const storedSolved = localStorage.getItem("leetcode_solved_problems");
      if (storedSolved) {
        try {
          const solvedArray = JSON.parse(storedSolved);
          setSolvedProblems(new Set(solvedArray));
        } catch (e) {
          console.error("Error loading from localStorage:", e);
        }
      }
    } finally {
      setSyncingSolved(false);
    }
  }, [username, problems.length, syncingSolved]);

  // Auto-sync solved problems from LeetCode API on login
  useEffect(() => {
    if (username && problems.length > 0 && !syncingSolved) {
      syncSolvedProblems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, problems.length]);

  const handleLogin = useCallback((newUsername: string) => {
    const newUser = newUsername || null;
    
    // Only proceed if username actually changed
    setUsername((prevUsername) => {
      if (prevUsername === newUser) {
        return prevUsername; // No change, return previous to prevent re-render
      }
      return newUser;
    });
    
    // Handle side effects after state update
    if (newUser) {
      // Clear sync tracking when username changes
      hasSyncedRef.current.clear();
      
      // Load solved problems for this user from localStorage (will be synced by useEffect)
      const storedSolved = localStorage.getItem("leetcode_solved_problems");
      if (storedSolved) {
        try {
          const solvedArray = JSON.parse(storedSolved);
          setSolvedProblems(new Set(solvedArray));
        } catch (err) {
          console.error("Error loading solved problems:", err);
        }
      }
    } else {
      // Clear solved problems on logout
      setSolvedProblems(new Set());
      setShowProfile(false);
      hasSyncedRef.current.clear();
      // Reset sort if it was set to "solved"
      setSortBy((prevSort) => (prevSort === "solved" ? "likes" : prevSort));
    }
  }, []);

  const handleToggleSolved = (questionId: string, isSolved: boolean) => {
    if (!username) {
      alert("Please login first to track your solved problems");
      return;
    }
    setSolvedProblems((prev) => {
      const newSet = new Set(prev);
      if (isSolved) {
        newSet.add(questionId);
      } else {
        newSet.delete(questionId);
      }
      return newSet;
    });
  };

  // Extract all unique tags
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    problems.forEach((problem) => {
      problem.topicTags
        .split(";")
        .filter((tag) => tag.trim())
        .forEach((tag) => tagSet.add(tag.trim()));
    });
    return Array.from(tagSet).sort();
  }, [problems]);

  // Filter problems
  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      // Difficulty filter
      if (
        filters.difficulty !== "All" &&
        problem.difficulty !== filters.difficulty
      ) {
        return false;
      }

      // Tags filter (OR logic - problem needs to have at least one of the selected tags)
      if (filters.tags.length > 0) {
        const problemTags = problem.topicTags
          .split(";")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
        const hasAnyTag = filters.tags.some((tag) =>
          problemTags.includes(tag)
        );
        if (!hasAnyTag) {
          return false;
        }
      }

      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = problem.title.toLowerCase().includes(query);
        const matchesId = problem.frontendQuestionId.includes(query);
        const matchesTags = problem.topicTags.toLowerCase().includes(query);
        if (!matchesTitle && !matchesId && !matchesTags) {
          return false;
        }
      }

      // Hide solved filter - if hideSolved is true, exclude solved problems
      if (hideSolved && solvedProblems.has(problem.questionId)) {
        return false;
      }

      return true;
    });
  }, [problems, filters, hideSolved, solvedProblems]);

  // Sort problems
  const sortedProblems = useMemo(() => {
    const sorted = [...filteredProblems];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case "likes":
          return b.likes - a.likes;
        case "acceptance-rate":
          return b.acRateRaw - a.acRateRaw;
        case "difficulty":
          const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
          return (
            difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
          );
        case "total-accepted":
          return b.totalAccepted - a.totalAccepted;
        case "title":
          return a.title.localeCompare(b.title);
        case "solved":
          if (!username) return 0;
          const aSolved = solvedProblems.has(a.questionId);
          const bSolved = solvedProblems.has(b.questionId);
          if (aSolved === bSolved) return 0;
          return aSolved ? -1 : 1; // Solved problems first
        case "access":
          // Sort Free problems first, then Premium
          if (a.isPaidOnly === b.isPaidOnly) return 0;
          return a.isPaidOnly ? 1 : -1; // Free (false) first
        default:
          return 0;
      }
    });
    return sorted;
  }, [filteredProblems, sortBy, solvedProblems, username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Loading problems...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                LeetCode Practice
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                Level up your coding skills with quality problems
              </p>
            </div>
            <div className="flex items-center gap-3">
              {username && (
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                >
                  {showProfile ? "Hide" : "Show"} Stats
                </button>
              )}
              <ThemeToggle />
              <Login onLogin={handleLogin} username={username} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex gap-6 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Stats Sidebar - Show when logged in and toggled */}
        {username && showProfile && (
          <aside className="w-96 flex-shrink-0 hidden xl:block">
            <div className="sticky top-24 space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <UserProfile username={username} />
              <SubmissionHeatmap username={username} />
              <TopicStats username={username} />
            </div>
          </aside>
        )}

        {/* Sidebar - Filters */}
        <aside className="w-80 flex-shrink-0 hidden lg:block">
          <div className="sticky top-24">
            <FilterBar
              filters={filters}
              sortBy={sortBy}
              onFiltersChange={setFilters}
              onSortChange={setSortBy}
              availableTags={availableTags}
              totalProblems={problems.length}
              filteredCount={filteredProblems.length}
              username={username}
              hideTags={hideTags}
              onHideTagsChange={setHideTags}
              hideSolved={hideSolved}
              onHideSolvedChange={setHideSolved}
            />
            {username && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                    {syncingSolved ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
                        Syncing solved problems...
                      </>
                    ) : (
                      <span>Auto-sync from LeetCode</span>
                    )}
                  </div>
                  <button
                    onClick={syncSolvedProblems}
                    disabled={syncingSolved}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sync Now
                  </button>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
                  Note: Only recent submissions (up to 50) can be synced via the public API
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area - Problems */}
        <div className="flex-1 min-w-0">
          {/* Mobile User Stats - Show when logged in and toggled */}
          {username && showProfile && (
            <div className="xl:hidden mb-6 space-y-6">
              <UserProfile username={username} />
              <SubmissionHeatmap username={username} />
              <TopicStats username={username} />
            </div>
          )}

          {/* Mobile Filters Toggle - Only show on small screens */}
          <div className="lg:hidden mb-6">
            <FilterBar
              filters={filters}
              sortBy={sortBy}
              onFiltersChange={setFilters}
              onSortChange={setSortBy}
              availableTags={availableTags}
              totalProblems={problems.length}
              filteredCount={filteredProblems.length}
              username={username}
              hideTags={hideTags}
              onHideTagsChange={setHideTags}
              hideSolved={hideSolved}
              onHideSolvedChange={setHideSolved}
            />
            {username && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                    {syncingSolved ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
                        Syncing solved problems...
                      </>
                    ) : (
                      <span>Auto-sync from LeetCode</span>
                    )}
                  </div>
                  <button
                    onClick={syncSolvedProblems}
                    disabled={syncingSolved}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sync Now
                  </button>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
                  Note: Only recent submissions (up to 50) can be synced via the public API
                </p>
              </div>
            )}
          </div>

          {/* Problems Grid */}
          {sortedProblems.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                No problems found
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your filters to see more problems
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedProblems.map((problem, index) => (
                <ProblemCard
                  key={problem.questionId}
                  problem={problem}
                  index={index}
                  isSolved={solvedProblems.has(problem.questionId)}
                  onToggleSolved={handleToggleSolved}
                  hideTags={hideTags}
                  hideSolved={hideSolved}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
          <p>Keep practicing! Every problem solved is a step closer to mastery 🎯</p>
        </div>
      </footer>
    </div>
  );
}
