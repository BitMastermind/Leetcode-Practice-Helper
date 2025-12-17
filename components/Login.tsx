"use client";

import { useState, useEffect } from "react";

interface LoginProps {
  onLogin: (username: string) => void;
  username: string | null;
}

export default function Login({ onLogin, username }: LoginProps) {
  const [inputUsername, setInputUsername] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    // Only run once on mount, and only if not already logged in
    if (!username) {
      const storedUsername = localStorage.getItem("leetcode_username");
      if (storedUsername) {
        onLogin(storedUsername);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - we intentionally don't include onLogin or username

  const handleLogin = () => {
    if (inputUsername.trim()) {
      localStorage.setItem("leetcode_username", inputUsername.trim());
      onLogin(inputUsername.trim());
      setInputUsername("");
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("leetcode_username");
    localStorage.removeItem("leetcode_solved_problems");
    onLogin("");
    setIsOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  if (username) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="hidden sm:inline">{username}</span>
        </button>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-2">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Logged in
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
          />
        </svg>
        <span className="hidden sm:inline">Login</span>
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Login
            </h3>
            <input
              type="text"
              placeholder="Enter your username"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
              autoFocus
            />
            <button
              onClick={handleLogin}
              disabled={!inputUsername.trim()}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Login
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              Your progress will be saved locally
            </p>
          </div>
        </>
      )}
    </div>
  );
}

