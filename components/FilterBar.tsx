"use client";

import { FilterState, SortOption, DifficultyFilter } from "@/types";
import { useState, useRef, useEffect } from "react";

interface FilterBarProps {
  filters: FilterState;
  sortBy: SortOption;
  onFiltersChange: (filters: FilterState) => void;
  onSortChange: (sort: SortOption) => void;
  availableTags: string[];
  totalProblems: number;
  filteredCount: number;
  username?: string | null;
  hideTags?: boolean;
  onHideTagsChange?: (hideTags: boolean) => void;
}

export default function FilterBar({
  filters,
  sortBy,
  onFiltersChange,
  onSortChange,
  availableTags,
  totalProblems,
  filteredCount,
  username,
  hideTags = false,
  onHideTagsChange,
}: FilterBarProps) {
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const addTagButtonRef = useRef<HTMLButtonElement>(null);

  const difficultyOptions: DifficultyFilter[] = ["All", "Easy", "Medium", "Hard"];
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "likes", label: "Most Liked" },
    { value: "acceptance-rate", label: "Acceptance Rate" },
    { value: "difficulty", label: "Difficulty" },
    { value: "total-accepted", label: "Most Solved" },
    { value: "title", label: "Title (A-Z)" },
    { value: "access", label: "Access (Free First)" },
    ...(username ? [{ value: "solved" as SortOption, label: "Solved Status" }] : []),
  ];

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    updateFilter("tags", newTags);
  };

  const handleAddTagClick = () => {
    if (addTagButtonRef.current) {
      const rect = addTagButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
    setShowTagDropdown(!showTagDropdown);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (showTagDropdown && addTagButtonRef.current) {
        const rect = addTagButtonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
        });
      }
    };

    const handleResize = () => {
      if (showTagDropdown && addTagButtonRef.current) {
        const rect = addTagButtonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
        });
      }
    };

    if (showTagDropdown) {
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [showTagDropdown]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
      {/* Stats Bar */}
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {filteredCount.toLocaleString()}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            / {totalProblems.toLocaleString()}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">problems found</p>
        {filters.tags.length > 0 && (
          <button
            onClick={() => updateFilter("tags", [])}
            className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Clear {filters.tags.length} tag{filters.tags.length > 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search problems..."
          value={filters.searchQuery}
          onChange={(e) => updateFilter("searchQuery", e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
        />
      </div>

      {/* Filters - Single Column for Sidebar */}
      <div className="space-y-4 mb-6">
        {/* Difficulty Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Difficulty
          </label>
          <select
            value={filters.difficulty}
            onChange={(e) =>
              updateFilter("difficulty", e.target.value as DifficultyFilter)
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            {difficultyOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Show Tags Checkbox */}
      {onHideTagsChange && (
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={!hideTags}
                onChange={(e) => onHideTagsChange(!e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                  !hideTags
                    ? "bg-blue-500 border-blue-500"
                    : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 group-hover:border-blue-400"
                }`}
              >
                {!hideTags && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
              Show tags
            </span>
          </label>
        </div>
      )}

      {/* Tags Filter */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Topic Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {filters.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className="px-2.5 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors flex items-center gap-1.5"
            >
              {tag}
              <span className="text-xs font-bold">×</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <button
            ref={addTagButtonRef}
            onClick={handleAddTagClick}
            className="w-full px-3 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-xs rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors text-center"
          >
            + Add Tag
          </button>
          {showTagDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowTagDropdown(false)}
              />
              <div
                className="fixed z-50 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-2"
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`,
                  maxHeight: `min(16rem, calc(100vh - ${dropdownPosition.top}px - 1rem))`,
                }}
              >
                {availableTags
                  .filter((tag) => !filters.tags.includes(tag))
                  .map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        toggleTag(tag);
                        setShowTagDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

