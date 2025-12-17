"use client";

import { useState, useEffect, useMemo } from "react";
import * as leetcodeApi from "@/lib/leetcode-api";
import { SubmissionCalendarData } from "@/types";

interface SubmissionHeatmapProps {
  username: string;
}

export default function SubmissionHeatmap({ username }: SubmissionHeatmapProps) {
  const [calendarData, setCalendarData] = useState<SubmissionCalendarData | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [totalActiveDays, setTotalActiveDays] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCalendarData() {
      setLoading(true);
      setError(null);
      try {
        const data = await leetcodeApi.getUserProfileCalendar(username);
        if (data.matchedUser?.userCalendar) {
          const calendar = data.matchedUser.userCalendar;
          setStreak(calendar.streak);
          setTotalActiveDays(calendar.totalActiveDays);
          
          // Parse the submissionCalendar JSON string
          if (calendar.submissionCalendar) {
            try {
              const parsed = JSON.parse(calendar.submissionCalendar);
              setCalendarData(parsed);
            } catch (e) {
              console.error("Error parsing submission calendar:", e);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch calendar data");
        console.error("Error fetching calendar data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      fetchCalendarData();
    }
  }, [username]);

  // Generate calendar grid for the last 53 weeks (1 year)
  const calendarGrid = useMemo(() => {
    if (!calendarData) return [];

    const weeks: Array<Array<{ date: Date; count: number }>> = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start from 53 weeks ago
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 53 * 7);

    // Align to Sunday
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    for (let week = 0; week < 53; week++) {
      const weekData: Array<{ date: Date; count: number }> = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + week * 7 + day);
        
        // Get timestamp in seconds (LeetCode format)
        const timestamp = Math.floor(date.getTime() / 1000).toString();
        const count = calendarData[timestamp] || 0;
        
        weekData.push({ date, count });
      }
      weeks.push(weekData);
    }

    return weeks;
  }, [calendarData]);

  const getIntensity = (count: number): string => {
    if (count === 0) return "bg-gray-100 dark:bg-gray-800";
    if (count >= 10) return "bg-green-600 dark:bg-green-500";
    if (count >= 5) return "bg-green-500 dark:bg-green-600";
    if (count >= 2) return "bg-green-400 dark:bg-green-700";
    return "bg-green-300 dark:bg-green-800";
  };

  const maxCount = useMemo(() => {
    if (!calendarData) return 0;
    return Math.max(...Object.values(calendarData), 0);
  }, [calendarData]);

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Submission Heatmap
        </h3>
        <div className="flex items-center gap-4 text-sm">
          {streak > 0 && (
            <div className="text-orange-600 dark:text-orange-400 font-semibold">
              🔥 {streak} day streak
            </div>
          )}
          <div className="text-gray-600 dark:text-gray-400">
            {totalActiveDays} active days
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {calendarGrid.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {week.map((day, dayIdx) => {
                const isToday =
                  day.date.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={dayIdx}
                    className={`w-3 h-3 rounded-sm ${getIntensity(day.count)} ${
                      isToday ? "ring-2 ring-blue-500 ring-offset-1" : ""
                    } transition-all hover:scale-125 cursor-pointer`}
                    title={`${day.date.toLocaleDateString()}: ${day.count} submission${day.count !== 1 ? "s" : ""}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-gray-600 dark:text-gray-400">
        <span>Less</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
          <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-800"></div>
          <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700"></div>
          <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600"></div>
          <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

