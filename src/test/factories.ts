import type { Todo } from "@/components/TodoItem";

let todoIdCounter = 0;

/**
 * テスト用のTodoオブジェクトを生成するファクトリ関数
 * 各フィールドはオプションで上書き可能
 */
export function createTodo(overrides: Partial<Todo> = {}): Todo {
  const now = Date.now();
  todoIdCounter += 1;

  return {
    id: `test-todo-${todoIdCounter}`,
    text: `テストタスク ${todoIdCounter}`,
    completed: false,
    createdAt: now,
    updatedAt: now,
    dueDate: formatDateForInput(new Date(now + 7 * 24 * 60 * 60 * 1000)), // 1週間後
    ...overrides,
  };
}

/**
 * 期限切れのTodoを生成
 */
export function createOverdueTodo(overrides: Partial<Todo> = {}): Todo {
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 7); // 1週間前

  return createTodo({
    dueDate: formatDateForInput(pastDate),
    completed: false,
    ...overrides,
  });
}

/**
 * 完了済みのTodoを生成
 */
export function createCompletedTodo(overrides: Partial<Todo> = {}): Todo {
  return createTodo({
    completed: true,
    ...overrides,
  });
}

/**
 * 日付をYYYY-MM-DD形式の文字列に変換
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 今日の日付をYYYY-MM-DD形式で取得
 */
export function getTodayString(): string {
  return formatDateForInput(new Date());
}

/**
 * 指定日数後の日付をYYYY-MM-DD形式で取得
 */
export function getFutureDateString(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return formatDateForInput(date);
}

/**
 * 指定日数前の日付をYYYY-MM-DD形式で取得
 */
export function getPastDateString(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return formatDateForInput(date);
}

/**
 * テストカウンターをリセット
 */
export function resetTodoIdCounter(): void {
  todoIdCounter = 0;
}
