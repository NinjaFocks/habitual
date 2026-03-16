export type HabitType = "boolean" | "count" | "timer";

export type HabitCategory = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

export type HabitCompletion = {
  date: string; // YYYY-MM-DD
  value: number; // 1 for boolean, count for count, seconds for timer
};

export type Habit = {
  id: string;
  name: string;
  description?: string;
  type: HabitType;
  categoryId?: string;
  color: string;
  icon: string;
  targetValue?: number; // for count/timer types
  unit?: string; // e.g. "glasses", "minutes"
  completions: HabitCompletion[];
  activeDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat — empty array means every day
  reminderEnabled: boolean;
  reminderTime?: string; // HH:MM
  reminderDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  createdAt: string;
  archived: boolean;
  order: number;
};

export type AppSettings = {
  gridWeeks: number; // 13, 26, or 52
  theme: "light" | "dark" | "system";
  weekStartsOn: 0 | 1; // 0=Sunday, 1=Monday
  defaultReminderTime: string;
};

export type StoreState = {
  habits: Habit[];
  categories: HabitCategory[];
  settings: AppSettings;

  // Habit actions
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "completions" | "order">) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string) => void;
  reorderHabits: (ids: string[]) => void;

  // Completion actions
  toggleCompletion: (habitId: string, date: string, value?: number) => void;
  getCompletionForDate: (habitId: string, date: string) => HabitCompletion | undefined;

  // Category actions
  addCategory: (category: Omit<HabitCategory, "id">) => void;
  updateCategory: (id: string, updates: Partial<HabitCategory>) => void;
  deleteCategory: (id: string) => void;

  // Settings actions
  updateSettings: (updates: Partial<AppSettings>) => void;
};
