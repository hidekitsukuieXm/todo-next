import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoItem from "./TodoItem";
import {
  createTodo,
  createOverdueTodo,
  createCompletedTodo,
  getFutureDateString,
  resetTodoIdCounter,
} from "@/test/factories";

describe("TodoItem", () => {
  const mockOnToggle = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    resetTodoIdCounter();
    mockOnEdit.mockReturnValue(true);
  });

  describe("表示モード", () => {
    it("Todoのテキストが正しく表示される", () => {
      // Arrange
      const todo = createTodo({ text: "買い物に行く" });

      // Act
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Assert
      expect(screen.getByText("買い物に行く")).toBeInTheDocument();
    });

    it("期限が日本語形式で表示される", () => {
      // Arrange
      const todo = createTodo({ dueDate: "2025-03-15" });

      // Act
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Assert
      expect(screen.getByText(/2025\/03\/15/)).toBeInTheDocument();
    });

    it("作成日時が表示される", () => {
      // Arrange
      const fixedDate = new Date("2025-01-15T10:30:00").getTime();
      const todo = createTodo({ createdAt: fixedDate, updatedAt: fixedDate });

      // Act
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Assert
      expect(screen.getByText(/Created:/)).toBeInTheDocument();
    });

    it("更新日時が作成日時と異なる場合のみ表示される", () => {
      // Arrange
      const createdAt = new Date("2025-01-15T10:30:00").getTime();
      const updatedAt = new Date("2025-01-16T14:00:00").getTime();
      const todo = createTodo({ createdAt, updatedAt });

      // Act
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Assert
      expect(screen.getByText(/Updated:/)).toBeInTheDocument();
    });

    it("更新日時が作成日時と同じ場合は更新日時が表示されない", () => {
      // Arrange
      const sameTime = new Date("2025-01-15T10:30:00").getTime();
      const todo = createTodo({ createdAt: sameTime, updatedAt: sameTime });

      // Act
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Assert
      expect(screen.queryByText(/Updated:/)).not.toBeInTheDocument();
    });

    it("完了済みTodoはチェックボックスがチェック状態になる", () => {
      // Arrange
      const todo = createCompletedTodo();

      // Act
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Assert
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("未完了Todoはチェックボックスが未チェック状態になる", () => {
      // Arrange
      const todo = createTodo({ completed: false });

      // Act
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Assert
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });

    it("期限切れの未完了Todoには「Overdue」が表示される", () => {
      // Arrange
      const todo = createOverdueTodo();

      // Act
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Assert
      expect(screen.getByText(/Overdue/)).toBeInTheDocument();
    });

    it("期限切れでも完了済みTodoには「Overdue」が表示されない", () => {
      // Arrange
      const todo = createOverdueTodo({ completed: true });

      // Act
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Assert
      expect(screen.queryByText(/Overdue/)).not.toBeInTheDocument();
    });

    it("期限が未来の場合は「Overdue」が表示されない", () => {
      // Arrange
      const todo = createTodo({ dueDate: getFutureDateString(30) });

      // Act
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Assert
      expect(screen.queryByText(/Overdue/)).not.toBeInTheDocument();
    });
  });

  describe("操作", () => {
    it("チェックボックスをクリックするとonToggleが呼ばれる", async () => {
      // Arrange
      const user = userEvent.setup();
      const todo = createTodo();

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Act
      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      // Assert
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
      expect(mockOnToggle).toHaveBeenCalledWith(todo.id);
    });

    it("削除ボタンをクリックするとonDeleteが呼ばれる", async () => {
      // Arrange
      const user = userEvent.setup();
      const todo = createTodo();

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Act
      const deleteButton = screen.getByTitle("Delete");
      await user.click(deleteButton);

      // Assert
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledWith(todo.id);
    });

    it("編集ボタンをクリックすると編集モードに切り替わる", async () => {
      // Arrange
      const user = userEvent.setup();
      const todo = createTodo({ text: "元のタスク" });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Act
      const editButton = screen.getByTitle("Edit");
      await user.click(editButton);

      // Assert
      expect(screen.getByRole("textbox")).toHaveValue("元のタスク");
      expect(screen.getByText("Save")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });
  });

  describe("編集モード", () => {
    it("編集内容を保存するとonEditが呼ばれる", async () => {
      // Arrange
      const user = userEvent.setup();
      const todo = createTodo({ text: "元のタスク", dueDate: "2025-06-01" });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Act
      await user.click(screen.getByTitle("Edit"));
      const textInput = screen.getByRole("textbox");
      await user.clear(textInput);
      await user.type(textInput, "新しいタスク");
      await user.click(screen.getByText("Save"));

      // Assert
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).toHaveBeenCalledWith(todo.id, "新しいタスク", "2025-06-01");
    });

    it("Enterキーで編集内容を保存できる", async () => {
      // Arrange
      const user = userEvent.setup();
      const todo = createTodo({ text: "元のタスク" });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Act
      await user.click(screen.getByTitle("Edit"));
      const textInput = screen.getByRole("textbox");
      await user.clear(textInput);
      await user.type(textInput, "Enterで保存{Enter}");

      // Assert
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it("キャンセルボタンをクリックすると編集がキャンセルされる", async () => {
      // Arrange
      const user = userEvent.setup();
      const todo = createTodo({ text: "元のタスク" });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Act
      await user.click(screen.getByTitle("Edit"));
      const textInput = screen.getByRole("textbox");
      await user.clear(textInput);
      await user.type(textInput, "変更後のタスク");
      await user.click(screen.getByText("Cancel"));

      // Assert
      expect(mockOnEdit).not.toHaveBeenCalled();
      expect(screen.getByText("元のタスク")).toBeInTheDocument();
    });

    it("Escapeキーで編集をキャンセルできる", async () => {
      // Arrange
      const user = userEvent.setup();
      const todo = createTodo({ text: "元のタスク" });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Act
      await user.click(screen.getByTitle("Edit"));
      await user.keyboard("{Escape}");

      // Assert
      expect(mockOnEdit).not.toHaveBeenCalled();
      expect(screen.getByText("元のタスク")).toBeInTheDocument();
    });

    it("タスク名が空の場合はエラーが表示され保存されない", async () => {
      // Arrange
      const user = userEvent.setup();
      const todo = createTodo({ text: "元のタスク" });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Act
      await user.click(screen.getByTitle("Edit"));
      const textInput = screen.getByRole("textbox");
      await user.clear(textInput);
      await user.click(screen.getByText("Save"));

      // Assert
      expect(screen.getByText("Task name is required")).toBeInTheDocument();
      expect(mockOnEdit).not.toHaveBeenCalled();
    });

    it("タスク名が空白のみの場合はエラーが表示され保存されない", async () => {
      // Arrange
      const user = userEvent.setup();
      const todo = createTodo({ text: "元のタスク" });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Act
      await user.click(screen.getByTitle("Edit"));
      const textInput = screen.getByRole("textbox");
      await user.clear(textInput);
      await user.type(textInput, "   ");
      await user.click(screen.getByText("Save"));

      // Assert
      expect(screen.getByText("Task name is required")).toBeInTheDocument();
      expect(mockOnEdit).not.toHaveBeenCalled();
    });

    it("期限が空の場合はエラーが表示され保存されない", async () => {
      // Arrange
      const user = userEvent.setup();
      const todo = createTodo({ text: "タスク", dueDate: "2025-06-01" });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Act
      await user.click(screen.getByTitle("Edit"));
      const dateInput = screen.getByDisplayValue("2025-06-01");
      await user.clear(dateInput);
      await user.click(screen.getByText("Save"));

      // Assert
      expect(screen.getByText("Due date is required")).toBeInTheDocument();
      expect(mockOnEdit).not.toHaveBeenCalled();
    });

    it("入力中にエラーが表示されている場合、入力するとエラーがクリアされる", async () => {
      // Arrange
      const user = userEvent.setup();
      const todo = createTodo({ text: "元のタスク" });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Act
      await user.click(screen.getByTitle("Edit"));
      const textInput = screen.getByRole("textbox");
      await user.clear(textInput);
      await user.click(screen.getByText("Save"));
      expect(screen.getByText("Task name is required")).toBeInTheDocument();

      await user.type(textInput, "新しいタスク");

      // Assert
      expect(screen.queryByText("Task name is required")).not.toBeInTheDocument();
    });
  });

  describe("境界値", () => {
    it("期限が空文字列の場合は「-」が表示される", () => {
      // Arrange
      const todo = createTodo({ dueDate: "" });

      // Act
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Assert
      const dueDateElement = screen.getByText("-");
      expect(dueDateElement).toBeInTheDocument();
    });

    it("不正な日付形式の場合は「-」が表示される", () => {
      // Arrange
      const todo = createTodo({ dueDate: "invalid-date" });

      // Act
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Assert
      const dueDateElements = screen.getAllByText("-");
      expect(dueDateElements.length).toBeGreaterThan(0);
    });
  });
});
