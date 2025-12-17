"use client";

import { useState, useEffect, useMemo } from "react";
import * as leetcodeApi from "@/lib/leetcode-api";
import { TopicStats as TopicStatsType } from "@/types";

interface TopicStatsProps {
  username: string;
}

export default function TopicStats({ username }: TopicStatsProps) {
  const [topics, setTopics] = useState<{
    advanced: TopicStatsType[];
    intermediate: TopicStatsType[];
    fundamental: TopicStatsType[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"fundamental" | "intermediate" | "advanced">("fundamental");

  useEffect(() => {
    async function fetchTopicStats() {
      setLoading(true);
      setError(null);
      try {
        const data = await leetcodeApi.getSkillStats(username);
        if (data.matchedUser?.tagProblemCounts) {
          setTopics({
            advanced: data.matchedUser.tagProblemCounts.advanced,
            intermediate: data.matchedUser.tagProblemCounts.intermediate,
            fundamental: data.matchedUser.tagProblemCounts.fundamental,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch topic stats");
        console.error("Error fetching topic stats:", err);
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      fetchTopicStats();
    }
  }, [username]);

  const activeTopics = useMemo(() => {
    if (!topics) return [];
    return topics[activeTab].sort((a, b) => b.problemsSolved - a.problemsSolved);
  }, [topics, activeTab]);

  const totalByLevel = useMemo(() => {
    if (!topics) return { fundamental: 0, intermediate: 0, advanced: 0 };
    return {
      fundamental: topics.fundamental.reduce((sum, t) => sum + t.problemsSolved, 0),
      intermediate: topics.intermediate.reduce((sum, t) => sum + t.problemsSolved, 0),
      advanced: topics.advanced.reduce((sum, t) => sum + t.problemsSolved, 0),
    };
  }, [topics]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (!topics) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Topic-Wise Performance
      </h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("fundamental")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "fundamental"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Fundamental ({totalByLevel.fundamental})
        </button>
        <button
          onClick={() => setActiveTab("intermediate")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "intermediate"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Intermediate ({totalByLevel.intermediate})
        </button>
        <button
          onClick={() => setActiveTab("advanced")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "advanced"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Advanced ({totalByLevel.advanced})
        </button>
      </div>

      {/* Topics List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activeTopics.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No topics found for this level
          </p>
        ) : (
          activeTopics.map((topic) => (
            <div
              key={topic.tagSlug}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {topic.tagName}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {topic.tagSlug}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {topic.problemsSolved}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  solved
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

