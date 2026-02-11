"use client";

import { useState, useEffect, useMemo } from "react";
import TodoItem, { Todo } from "@/components/TodoItem";

const STORAGE_KEY = "todos";

type FilterType = "all" | "active" | "completed";
type SortType = "createdAt" | "dueDate" | "alphabetical";
type SortOrder = "asc" | "desc";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const migrated = parsed.map((todo: Todo & { updatedAt?: number; dueDate?: string }) => ({
          ...todo,
          updatedAt: todo.updatedAt || todo.createdAt,
          dueDate: todo.dueDate || "",
        }));
        setTodos(migrated);
      } catch {
        console.error("Failed to parse stored todos");
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  const addTodo = () => {
    const text = inputValue.trim();
    if (!text) {
      setError("Task name is required");
      return;
    }
    if (!dueDate) {
      setError("Due date is required");
      return;
    }

    const now = Date.now();
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: now,
      updatedAt: now,
      dueDate,
    };

    setTodos((prev) => [newTodo, ...prev]);
    setInputValue("");
    setDueDate("");
    setError("");
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed, updatedAt: Date.now() }
          : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const editTodo = (id: string, text: string, newDueDate: string): boolean => {
    if (!newDueDate) {
      return false;
    }
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, text, dueDate: newDueDate, updatedAt: Date.now() }
          : todo
      )
    );
    return true;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const filteredAndSortedTodos = useMemo(() => {
    let result = [...todos];

    if (filter === "active") {
      result = result.filter((t) => !t.completed);
    } else if (filter === "completed") {
      result = result.filter((t) => t.completed);
    }

    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "createdAt":
          comparison = a.createdAt - b.createdAt;
          break;
        case "dueDate":
          if (!a.dueDate && !b.dueDate) {
            comparison = a.createdAt - b.createdAt;
          } else if (!a.dueDate) {
            return 1;
          } else if (!b.dueDate) {
            return -1;
          } else {
            comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          }
          break;
        case "alphabetical":
          comparison = a.text.localeCompare(b.text, "ja");
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [todos, filter, sortBy, sortOrder]);

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen py-8 px-4">
      <main className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
            TODO List
          </h1>
          <p className="text-white/80 text-lg">Stay organized, stay productive</p>
        </div>

        {/* Main Card */}
        <div className="glass-card rounded-3xl p-8 animate-fade-in">
          {/* Input Section */}
          <div className="mb-8">
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="What needs to be done?"
                className="input-modern flex-1 text-gray-800 dark:text-gray-200 placeholder-gray-400"
              />
              <button onClick={addTodo} className="btn-primary whitespace-nowrap">
                <span className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add
                </span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Due date<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  setError("");
                }}
                className="input-modern text-gray-800 dark:text-gray-200"
              />
            </div>
            {error && (
              <p className="mt-3 text-sm text-red-500 flex items-center gap-2 animate-fade-in">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </p>
            )}
          </div>

          {/* Progress Bar */}
          {totalCount > 0 && (
            <div className="mb-6 animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Progress
                </span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {completedCount} / {totalCount}
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  }}
                />
              </div>
            </div>
          )}

          {/* Filter and Sort Controls */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl">
            {/* Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Filter:</span>
              <div className="flex gap-1 bg-white/50 dark:bg-gray-700/50 rounded-xl p-1">
                {(["all", "active", "completed"] as FilterType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      filter === f
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50"
                    }`}
                  >
                    {f === "all" ? "All" : f === "active" ? "Active" : "Done"}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border-0 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="createdAt">Date Created</option>
                <option value="dueDate">Due Date</option>
                <option value="alphabetical">A-Z</option>
              </select>
              <button
                onClick={toggleSortOrder}
                className="p-2 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 transition-all duration-200"
                title={sortOrder === "asc" ? "Ascending" : "Descending"}
              >
                {sortOrder === "asc" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12l7-7 7 7" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Todo List */}
          <div className="space-y-3">
            {!isLoaded ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500">Loading...</p>
              </div>
            ) : todos.length === 0 ? (
              <div className="text-center py-12 animate-fade-in">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No tasks yet. Add one above!
                </p>
              </div>
            ) : filteredAndSortedTodos.length === 0 ? (
              <div className="text-center py-12 animate-fade-in">
                <div className="text-6xl mb-4">{filter === "active" ? "🎉" : "📋"}</div>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {filter === "active" ? "All tasks completed!" : "No completed tasks yet."}
                </p>
              </div>
            ) : (
              filteredAndSortedTodos.map((todo, index) => (
                <div
                  key={todo.id}
                  className="animate-slide-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <TodoItem
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    onEdit={editTodo}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 text-sm mt-8 animate-fade-in">
          {totalCount > 0 && filter !== "all" && (
            <span>Showing {filteredAndSortedTodos.length} of {totalCount} tasks</span>
          )}
        </p>
      </main>
    </div>
  );
}
