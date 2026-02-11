import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";
import {
  createTodo,
  resetTodoIdCounter,
} from "@/test/factories";

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetTodoIdCounter();
    localStorage.clear();
  });

  describe("初期表示", () => {
    it("タイトルが表示される", () => {
      // Arrange & Act
      render(<Home />);

      // Assert
      expect(screen.getByText("TODO List")).toBeInTheDocument();
    });

    it("タスク入力欄が表示される", () => {
      // Arrange & Act
      render(<Home />);

      // Assert
      expect(
        screen.getByPlaceholderText("What needs to be done?")
      ).toBeInTheDocument();
    });

    it("期限入力欄が表示される", () => {
      // Arrange & Act
      render(<Home />);

      // Assert
      expect(screen.getByText(/Due date/)).toBeInTheDocument();
    });

    it("追加ボタンが表示される", () => {
      // Arrange & Act
      render(<Home />);

      // Assert
      expect(screen.getByText("Add")).toBeInTheDocument();
    });

    it("タスクがない場合は空状態メッセージが表示される", () => {
      // Arrange & Act
      render(<Home />);

      // Assert
      expect(
        screen.getByText("No tasks yet. Add one above!")
      ).toBeInTheDocument();
    });

    it("フィルタボタンが表示される", () => {
      // Arrange & Act
      render(<Home />);

      // Assert
      expect(screen.getByText("All")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("Done")).toBeInTheDocument();
    });

    it("ソート選択が表示される", () => {
      // Arrange & Act
      render(<Home />);

      // Assert
      expect(screen.getByText("Date Created")).toBeInTheDocument();
    });
  });

  describe("タスク追加", () => {
    it("タスク名と期限を入力して追加ボタンをクリックするとタスクが追加される", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<Home />);

      // Act
      const input = screen.getByPlaceholderText("What needs to be done?");
      await user.type(input, "新しいタスク");

      const dateInput = screen.getByDisplayValue("");
      await user.type(dateInput, "2025-06-01");

      await user.click(screen.getByText("Add"));

      // Assert
      expect(screen.getByText("新しいタスク")).toBeInTheDocument();
    });

    it("Enterキーでタスクを追加できる", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<Home />);

      // Act
      const input = screen.getByPlaceholderText("What needs to be done?");
      await user.type(input, "Enterで追加");

      const dateInput = screen.getByDisplayValue("");
      await user.type(dateInput, "2025-06-01");

      await user.type(input, "{Enter}");

      // Assert
      expect(screen.getByText("Enterで追加")).toBeInTheDocument();
    });

    it("タスク名が空の場合はエラーが表示される", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<Home />);

      // Act - 期限だけ入力してタスク名は空のまま追加
      const dateInputs = document.querySelectorAll('input[type="date"]');
      const mainDateInput = dateInputs[0] as HTMLInputElement;
      await user.type(mainDateInput, "2025-06-01");
      await user.click(screen.getByText("Add"));

      // Assert
      expect(screen.getByText("Task name is required")).toBeInTheDocument();
    });

    it("期限が空の場合はエラーが表示される", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<Home />);

      // Act
      const input = screen.getByPlaceholderText("What needs to be done?");
      await user.type(input, "期限なしタスク");
      await user.click(screen.getByText("Add"));

      // Assert
      expect(screen.getByText("Due date is required")).toBeInTheDocument();
    });

    it("タスク名と期限の両方が空の場合はタスク名エラーが表示される", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<Home />);

      // Act
      await user.click(screen.getByText("Add"));

      // Assert
      expect(screen.getByText("Task name is required")).toBeInTheDocument();
    });

    it("タスク追加後に入力欄がクリアされる", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<Home />);

      // Act
      const input = screen.getByPlaceholderText("What needs to be done?");
      await user.type(input, "クリアされるタスク");

      const dateInput = screen.getByDisplayValue("");
      await user.type(dateInput, "2025-06-01");

      await user.click(screen.getByText("Add"));

      // Assert
      expect(input).toHaveValue("");
    });

    it("入力中にエラーがクリアされる", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<Home />);

      // Act - エラーを表示
      await user.click(screen.getByText("Add"));
      expect(screen.getByText("Task name is required")).toBeInTheDocument();

      // Act - 入力開始
      const input = screen.getByPlaceholderText("What needs to be done?");
      await user.type(input, "a");

      // Assert
      expect(
        screen.queryByText("Task name is required")
      ).not.toBeInTheDocument();
    });
  });

  describe("タスク操作", () => {
    it("チェックボックスをクリックするとタスクの完了状態が切り替わる", async () => {
      // Arrange
      const user = userEvent.setup();
      const todos = [createTodo({ text: "トグルテスト", completed: false })];
      localStorage.setItem("todos", JSON.stringify(todos));
      render(<Home />);

      // Act
      const checkbox = await screen.findByRole("checkbox");
      await user.click(checkbox);

      // Assert
      expect(checkbox).toBeChecked();
    });

    it("削除ボタンをクリックするとタスクが削除される", async () => {
      // Arrange
      const user = userEvent.setup();
      const todos = [createTodo({ text: "削除されるタスク" })];
      localStorage.setItem("todos", JSON.stringify(todos));
      render(<Home />);

      // Assert - タスクが表示されている
      expect(await screen.findByText("削除されるタスク")).toBeInTheDocument();

      // Act
      const deleteButton = screen.getByTitle("Delete");
      await user.click(deleteButton);

      // Assert
      expect(screen.queryByText("削除されるタスク")).not.toBeInTheDocument();
    });
  });

  describe("フィルタ機能", () => {
    it("「Active」フィルタをクリックすると未完了タスクのみ表示される", async () => {
      // Arrange
      const user = userEvent.setup();
      const todos = [
        createTodo({ text: "未完了タスク", completed: false }),
        createTodo({ text: "完了タスク", completed: true }),
      ];
      localStorage.setItem("todos", JSON.stringify(todos));
      render(<Home />);

      // Assert - 初期状態では両方表示
      expect(await screen.findByText("未完了タスク")).toBeInTheDocument();
      expect(screen.getByText("完了タスク")).toBeInTheDocument();

      // Act
      await user.click(screen.getByText("Active"));

      // Assert
      expect(screen.getByText("未完了タスク")).toBeInTheDocument();
      expect(screen.queryByText("完了タスク")).not.toBeInTheDocument();
    });

    it("「Done」フィルタをクリックすると完了タスクのみ表示される", async () => {
      // Arrange
      const user = userEvent.setup();
      const todos = [
        createTodo({ text: "未完了タスク", completed: false }),
        createTodo({ text: "完了タスク", completed: true }),
      ];
      localStorage.setItem("todos", JSON.stringify(todos));
      render(<Home />);

      // Act
      await screen.findByText("未完了タスク");
      await user.click(screen.getByText("Done"));

      // Assert
      expect(screen.queryByText("未完了タスク")).not.toBeInTheDocument();
      expect(screen.getByText("完了タスク")).toBeInTheDocument();
    });

    it("「All」フィルタをクリックすると全タスクが表示される", async () => {
      // Arrange
      const user = userEvent.setup();
      const todos = [
        createTodo({ text: "未完了タスク", completed: false }),
        createTodo({ text: "完了タスク", completed: true }),
      ];
      localStorage.setItem("todos", JSON.stringify(todos));
      render(<Home />);

      // フィルタを適用
      await screen.findByText("未完了タスク");
      await user.click(screen.getByText("Active"));

      // Act
      await user.click(screen.getByText("All"));

      // Assert
      expect(screen.getByText("未完了タスク")).toBeInTheDocument();
      expect(screen.getByText("完了タスク")).toBeInTheDocument();
    });

    it("Activeフィルタで全タスク完了時はメッセージが表示される", async () => {
      // Arrange
      const user = userEvent.setup();
      const todos = [createTodo({ text: "完了タスク", completed: true })];
      localStorage.setItem("todos", JSON.stringify(todos));
      render(<Home />);

      // Act
      await screen.findByText("完了タスク");
      await user.click(screen.getByText("Active"));

      // Assert
      expect(screen.getByText("All tasks completed!")).toBeInTheDocument();
    });
  });

  describe("ソート機能", () => {
    it("期限でソートできる", async () => {
      // Arrange
      const user = userEvent.setup();
      const todos = [
        createTodo({ text: "タスクA", dueDate: "2025-12-01" }),
        createTodo({ text: "タスクB", dueDate: "2025-01-01" }),
      ];
      localStorage.setItem("todos", JSON.stringify(todos));
      render(<Home />);

      // Act
      await screen.findByText("タスクA");
      const sortSelect = screen.getByRole("combobox");
      await user.selectOptions(sortSelect, "dueDate");

      // 昇順に切り替え
      const sortOrderButton = screen.getByTitle("Descending");
      await user.click(sortOrderButton);

      // Assert - 期限が早いものが先（昇順）
      const items = document.querySelectorAll(".todo-item");
      expect(within(items[0] as HTMLElement).getByText("タスクB")).toBeInTheDocument();
    });

    it("アルファベット順でソートできる", async () => {
      // Arrange
      const user = userEvent.setup();
      const todos = [
        createTodo({ text: "Banana" }),
        createTodo({ text: "Apple" }),
      ];
      localStorage.setItem("todos", JSON.stringify(todos));
      render(<Home />);

      // Act
      await screen.findByText("Banana");
      const sortSelect = screen.getByRole("combobox");
      await user.selectOptions(sortSelect, "alphabetical");

      // 昇順に切り替え
      const sortOrderButton = screen.getByTitle("Descending");
      await user.click(sortOrderButton);

      // Assert - A-Z順（昇順）
      const items = document.querySelectorAll(".todo-item");
      expect(within(items[0] as HTMLElement).getByText("Apple")).toBeInTheDocument();
    });

    it("ソート順序を切り替えられる", async () => {
      // Arrange
      const user = userEvent.setup();
      const todos = [
        createTodo({ text: "先に作成", createdAt: 1000 }),
        createTodo({ text: "後に作成", createdAt: 2000 }),
      ];
      localStorage.setItem("todos", JSON.stringify(todos));
      render(<Home />);

      // Assert - デフォルトは降順（新しいものが先）
      await screen.findByText("後に作成");
      const sortOrderButton = screen.getByTitle("Descending");
      expect(sortOrderButton).toBeInTheDocument();

      // Act - 昇順に切り替え
      await user.click(sortOrderButton);

      // Assert
      expect(screen.getByTitle("Ascending")).toBeInTheDocument();
    });
  });

  describe("進捗表示", () => {
    it("タスクがある場合は進捗が表示される", async () => {
      // Arrange
      const todos = [
        createTodo({ completed: true }),
        createTodo({ completed: false }),
      ];
      localStorage.setItem("todos", JSON.stringify(todos));

      // Act
      render(<Home />);

      // Assert
      expect(await screen.findByText("Progress")).toBeInTheDocument();
      expect(screen.getByText("1 / 2")).toBeInTheDocument();
    });

    it("タスクがない場合は進捗が表示されない", () => {
      // Arrange & Act
      render(<Home />);

      // Assert
      expect(screen.queryByText("Progress")).not.toBeInTheDocument();
    });
  });

  describe("localStorage連携", () => {
    it("ページ読み込み時にlocalStorageからタスクが復元される", async () => {
      // Arrange
      const todos = [createTodo({ text: "保存されたタスク" })];
      localStorage.setItem("todos", JSON.stringify(todos));

      // Act
      render(<Home />);

      // Assert
      expect(await screen.findByText("保存されたタスク")).toBeInTheDocument();
    });

    it("タスク追加時にlocalStorageに保存される", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<Home />);

      // Act
      const input = screen.getByPlaceholderText("What needs to be done?");
      await user.type(input, "保存テスト");

      const dateInput = screen.getByDisplayValue("");
      await user.type(dateInput, "2025-06-01");

      await user.click(screen.getByText("Add"));

      // Assert
      const stored = JSON.parse(localStorage.getItem("todos") || "[]");
      expect(stored).toHaveLength(1);
      expect(stored[0].text).toBe("保存テスト");
    });

    it("不正なJSONがlocalStorageにある場合はエラーにならない", () => {
      // Arrange
      localStorage.setItem("todos", "invalid json");

      // Act & Assert - エラーが発生しないこと
      expect(() => render(<Home />)).not.toThrow();
    });

    it("古い形式のTodoデータがマイグレーションされる", async () => {
      // Arrange - updatedAtとdueDateがない古い形式
      const oldTodos = [
        { id: "old-1", text: "古いタスク", completed: false, createdAt: 1000 },
      ];
      localStorage.setItem("todos", JSON.stringify(oldTodos));

      // Act
      render(<Home />);

      // Assert
      expect(await screen.findByText("古いタスク")).toBeInTheDocument();
    });
  });

  describe("編集機能", () => {
    it("タスクを編集できる", async () => {
      // Arrange
      const user = userEvent.setup();
      const todos = [createTodo({ text: "編集前", dueDate: "2025-06-01" })];
      localStorage.setItem("todos", JSON.stringify(todos));
      render(<Home />);

      // Act
      await screen.findByText("編集前");
      const editButton = screen.getByTitle("Edit");
      await user.click(editButton);

      // 編集フォームのテキスト入力を取得（プレースホルダーで特定）
      const textInput = screen.getByPlaceholderText("Task name");
      await user.clear(textInput);
      await user.type(textInput, "編集後");
      await user.click(screen.getByText("Save"));

      // Assert
      expect(screen.getByText("編集後")).toBeInTheDocument();
      expect(screen.queryByText("編集前")).not.toBeInTheDocument();
    });
  });
});
