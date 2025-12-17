"use client";

import { useState, useEffect } from "react";
import { LeetCodeUserProfile, ProblemsSolvedStats, ContestRanking } from "@/types";
import * as leetcodeApi from "@/lib/leetcode-api";

interface UserProfileProps {
  username: string;
}

export default function UserProfile({ username }: UserProfileProps) {
  const [profile, setProfile] = useState<LeetCodeUserProfile | null>(null);
  const [stats, setStats] = useState<ProblemsSolvedStats | null>(null);
  const [contestRanking, setContestRanking] = useState<ContestRanking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch profile
        const profileData = await leetcodeApi.getUserPublicProfile(username);
        if (profileData.matchedUser?.profile) {
          setProfile({
            username: profileData.matchedUser.username,
            ranking: profileData.matchedUser.profile.ranking,
            userAvatar: profileData.matchedUser.profile.userAvatar,
            realName: profileData.matchedUser.profile.realName,
            countryName: profileData.matchedUser.profile.countryName,
            company: profileData.matchedUser.profile.company,
            jobTitle: profileData.matchedUser.profile.jobTitle,
            reputation: profileData.matchedUser.profile.reputation,
            solutionCount: profileData.matchedUser.profile.solutionCount,
          });
        }

        // Fetch problems solved stats
        const problemsData = await leetcodeApi.getUserProblemsSolved(username);
        if (problemsData.matchedUser?.submitStats) {
          const allCounts = problemsData.allQuestionsCount.reduce((acc, item) => {
            acc[item.difficulty] = item.count;
            return acc;
          }, {} as Record<string, number>);

          const acCounts = problemsData.matchedUser.submitStats.acSubmissionNum.reduce((acc, item) => {
            acc[item.difficulty] = item.count;
            return acc;
          }, {} as Record<string, number>);

          setStats({
            easy: {
              solved: acCounts.Easy || 0,
              total: allCounts.Easy || 0,
            },
            medium: {
              solved: acCounts.Medium || 0,
              total: allCounts.Medium || 0,
            },
            hard: {
              solved: acCounts.Hard || 0,
              total: allCounts.Hard || 0,
            },
            total: {
              solved: (acCounts.Easy || 0) + (acCounts.Medium || 0) + (acCounts.Hard || 0),
              total: (allCounts.Easy || 0) + (allCounts.Medium || 0) + (allCounts.Hard || 0),
            },
          });
        }

        // Fetch contest ranking
        const contestData = await leetcodeApi.getUserContestRankingInfo(username);
        if (contestData.userContestRanking) {
          setContestRanking({
            attendedContestsCount: contestData.userContestRanking.attendedContestsCount,
            rating: contestData.userContestRanking.rating,
            globalRanking: contestData.userContestRanking.globalRanking,
            topPercentage: contestData.userContestRanking.topPercentage,
            badge: contestData.userContestRanking.badge?.name || null,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user data");
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      fetchUserData();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Make sure the username is correct and try again.
        </p>
      </div>
    );
  }

  if (!profile && !stats) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-4 mb-6">
        {profile?.userAvatar && (
          <img
            src={profile.userAvatar}
            alt={profile.realName || username}
            className="w-16 h-16 rounded-full border-2 border-blue-500"
          />
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {profile?.realName || username}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">@{username}</p>
          {profile && (
            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              {profile.countryName && (
                <span className="text-gray-600 dark:text-gray-400">
                  🌍 {profile.countryName}
                </span>
              )}
              {profile.company && (
                <span className="text-gray-600 dark:text-gray-400">
                  🏢 {profile.company}
                </span>
              )}
              {profile.ranking > 0 && (
                <span className="text-blue-600 dark:text-blue-400 font-semibold">
                  Rank #{profile.ranking.toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Problems Solved Stats */}
      {stats && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Problems Solved
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="text-sm text-green-700 dark:text-green-400 font-medium mb-1">
                Easy
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.easy.solved}
              </div>
              <div className="text-xs text-green-600 dark:text-green-500">
                / {stats.easy.total}
              </div>
              <div className="mt-2 h-2 bg-green-200 dark:bg-green-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: `${(stats.easy.solved / stats.easy.total) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
              <div className="text-sm text-yellow-700 dark:text-yellow-400 font-medium mb-1">
                Medium
              </div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.medium.solved}
              </div>
              <div className="text-xs text-yellow-600 dark:text-yellow-500">
                / {stats.medium.total}
              </div>
              <div className="mt-2 h-2 bg-yellow-200 dark:bg-yellow-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full"
                  style={{
                    width: `${(stats.medium.solved / stats.medium.total) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="text-sm text-red-700 dark:text-red-400 font-medium mb-1">
                Hard
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.hard.solved}
              </div>
              <div className="text-xs text-red-600 dark:text-red-500">
                / {stats.hard.total}
              </div>
              <div className="mt-2 h-2 bg-red-200 dark:bg-red-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{
                    width: `${(stats.hard.solved / stats.hard.total) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="text-sm text-blue-700 dark:text-blue-400 font-medium mb-1">
                Total
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.total.solved}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-500">
                / {stats.total.total}
              </div>
              <div className="mt-2 h-2 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${(stats.total.solved / stats.total.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contest Rating */}
      {contestRanking && contestRanking.rating > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Contest Rating
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rating</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(contestRanking.rating)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Global Rank</div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white">
                #{contestRanking.globalRanking.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Top %</div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white">
                {contestRanking.topPercentage.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Contests</div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white">
                {contestRanking.attendedContestsCount}
              </div>
            </div>
          </div>
          {contestRanking.badge && (
            <div className="mt-4 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg text-white font-semibold inline-block">
              🏆 {contestRanking.badge}
            </div>
          )}
        </div>
      )}

      {/* Additional Stats */}
      {profile && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600 dark:text-gray-400 mb-1">Reputation</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {profile.reputation.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 mb-1">Solutions</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {profile.solutionCount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

