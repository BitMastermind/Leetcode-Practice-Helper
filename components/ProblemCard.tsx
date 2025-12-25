"use client";

import { LeetCodeProblem } from "@/types";
import Link from "next/link";
import { useState, useEffect } from "react";

interface ProblemCardProps {
  problem: LeetCodeProblem;
  index: number;
  isSolved: boolean;
  onToggleSolved: (questionId: string, isSolved: boolean) => void;
  hideTags?: boolean;
  hideSolved?: boolean;
}

export default function ProblemCard({ problem, index, isSolved, onToggleSolved, hideTags = false, hideSolved = false }: ProblemCardProps) {
  const difficultyColors = {
    Easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  const tags = problem.topicTags
    .split(";")
    .filter((tag) => tag.trim())
    .slice(0, 3);

  const handleSolvedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleSolved(problem.questionId, !isSolved);
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl border ${
        isSolved && !hideSolved
          ? "border-green-300 dark:border-green-700 bg-green-50/30 dark:bg-green-900/10"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5" />
      
      {/* Solved badge */}
      {isSolved && !hideSolved && (
        <div className="absolute top-4 right-4 z-20">
          <div className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-lg">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Solved
          </div>
        </div>
      )}
      
      <Link
        href={`https://leetcode.com/problems/${problem.titleSlug}/`}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-6 relative z-10"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-sm font-mono text-gray-500 dark:text-gray-400 flex-shrink-0">
              #{problem.frontendQuestionId}
            </span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
              {problem.title}
            </h3>
            {problem.isPaidOnly && (
              <span className="flex-shrink-0 px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                Premium
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${difficultyColors[problem.difficulty]}`}
          >
            {problem.difficulty}
          </span>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-5.834a1.5 1.5 0 00-1.5-1.5h-1a1.5 1.5 0 00-1.5 1.5zM15.5 9.5a1.5 1.5 0 00-1.5 1.5v5a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-5a1.5 1.5 0 00-1.5-1.5h-1z" />
              </svg>
              {problem.likes.toLocaleString()}
            </span>
            
            <span className="text-xs">
              {problem.acRate} acceptance
            </span>
          </div>
        </div>

        {!hideTags && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
              >
                {tag.trim()}
              </span>
            ))}
            {problem.topicTags.split(";").filter((t) => t.trim()).length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                +{problem.topicTags.split(";").filter((t) => t.trim()).length - 3}
              </span>
            )}
          </div>
        )}

        <div className={`flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 ${hideTags ? 'pt-0' : 'pt-2 border-t border-gray-200 dark:border-gray-700'}`}>
          <div className="flex items-center gap-3">
            {problem.hasSolution && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Solution
              </span>
            )}
            {problem.hasVideoSolution && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                Video
              </span>
            )}
          </div>
          
          <span className="text-gray-400 dark:text-gray-500">
            {problem.totalAccepted.toLocaleString()} solved
          </span>
        </div>

        {/* Mark as solved button */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSolvedClick}
            className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isSolved
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {isSolved ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Mark as Unsolved
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark as Solved
              </span>
            )}
          </button>
        </div>

        {/* Arrow indicator */}
        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100">
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </Link>
    </div>
  );
}

