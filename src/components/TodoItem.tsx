"use client";

import { useState, useEffect } from "react";

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
  dueDate: string;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string, dueDate: string) => boolean;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatDateTime(timestamp: number): string {
  if (!timestamp || isNaN(timestamp)) return "-";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isOverdue(dueDate: string, completed: boolean): boolean {
  if (!dueDate || completed) return false;
  const due = new Date(dueDate);
  if (isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editDueDate, setEditDueDate] = useState(todo.dueDate);
  const [error, setError] = useState("");

  useEffect(() => {
    setEditText(todo.text);
    setEditDueDate(todo.dueDate);
  }, [todo.text, todo.dueDate]);

  const handleSave = () => {
    const trimmedText = editText.trim();
    if (!trimmedText) {
      setError("Task name is required");
      return;
    }
    if (!editDueDate) {
      setError("Due date is required");
      return;
    }
    const success = onEdit(todo.id, trimmedText, editDueDate);
    if (success) {
      setError("");
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setEditDueDate(todo.dueDate);
    setError("");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const overdue = isOverdue(todo.dueDate, todo.completed);

  if (isEditing) {
    return (
      <div className="p-5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-indigo-300 dark:border-indigo-500 animate-fade-in">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={editText}
            onChange={(e) => {
              setEditText(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            className="input-modern w-full text-gray-800 dark:text-gray-200"
            autoFocus
            placeholder="Task name"
          />
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Due<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={editDueDate}
              onChange={(e) => {
                setEditDueDate(e.target.value);
                setError("");
              }}
              className="input-modern text-gray-800 dark:text-gray-200"
            />
          </div>
          {error && (
            <p className="text-sm text-red-500 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </p>
          )}
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`todo-item flex items-start gap-4 p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/50 dark:border-slate-700/50 group ${todo.completed ? "opacity-75" : ""}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="mt-1 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-gray-800 dark:text-gray-200 font-medium ${
            todo.completed ? "line-through text-gray-400 dark:text-gray-500" : ""
          }`}
        >
          {todo.text}
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
              overdue
                ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {formatDate(todo.dueDate)}
            {overdue && " (Overdue)"}
          </span>
          <span className="inline-flex items-center gap-1 text-gray-400 dark:text-gray-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
            Created: {formatDateTime(todo.createdAt)}
          </span>
          {todo.updatedAt !== todo.createdAt && (
            <span className="inline-flex items-center gap-1 text-gray-400 dark:text-gray-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Updated: {formatDateTime(todo.updatedAt)}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => setIsEditing(true)}
          className="p-2 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all duration-200"
          title="Edit"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
          title="Delete"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}
