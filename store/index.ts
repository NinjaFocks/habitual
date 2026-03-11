import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StoreState, Habit, HabitCategory, AppSettings } from "../types";
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from "../constants";
import { format } from "date-fns";

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      habits: [],
      categories: DEFAULT_CATEGORIES,
      settings: DEFAULT_SETTINGS,

      addHabit: (habitData) => {
        const habits = get().habits;
        const newHabit: Habit = {
          ...habitData,
          id: generateId(),
          completions: [],
          createdAt: new Date().toISOString(),
          order: habits.length,
        };
        set({ habits: [...habits, newHabit] });
      },

      updateHabit: (id, updates) => {
        set({
          habits: get().habits.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        });
      },

      deleteHabit: (id) => {
        set({ habits: get().habits.filter((h) => h.id !== id) });
      },

      archiveHabit: (id) => {
        set({
          habits: get().habits.map((h) =>
            h.id === id ? { ...h, archived: !h.archived } : h
          ),
        });
      },

      reorderHabits: (ids) => {
        const habits = get().habits;
        const reordered = ids
          .map((id, index) => {
            const habit = habits.find((h) => h.id === id);
            return habit ? { ...habit, order: index } : null;
          })
          .filter(Boolean) as Habit[];
        const notInList = habits.filter((h) => !ids.includes(h.id));
        set({ habits: [...reordered, ...notInList] });
      },

      toggleCompletion: (habitId, date, value) => {
        const habits = get().habits;
        const habit = habits.find((h) => h.id === habitId);
        if (!habit) return;

        const existing = habit.completions.find((c) => c.date === date);
        let newCompletions: typeof habit.completions;

        if (habit.type === "boolean") {
          if (existing) {
            // Toggle off
            newCompletions = habit.completions.filter((c) => c.date !== date);
          } else {
            newCompletions = [...habit.completions, { date, value: 1 }];
          }
        } else {
          // For count/timer, update the value
          const newValue = value ?? 0;
          if (newValue <= 0) {
            newCompletions = habit.completions.filter((c) => c.date !== date);
          } else if (existing) {
            newCompletions = habit.completions.map((c) =>
              c.date === date ? { ...c, value: newValue } : c
            );
          } else {
            newCompletions = [...habit.completions, { date, value: newValue }];
          }
        }

        set({
          habits: habits.map((h) =>
            h.id === habitId ? { ...h, completions: newCompletions } : h
          ),
        });
      },

      getCompletionForDate: (habitId, date) => {
        const habit = get().habits.find((h) => h.id === habitId);
        return habit?.completions.find((c) => c.date === date);
      },

      addCategory: (categoryData) => {
        const newCategory: HabitCategory = {
          ...categoryData,
          id: generateId(),
        };
        set({ categories: [...get().categories, newCategory] });
      },

      updateCategory: (id, updates) => {
        set({
          categories: get().categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        });
      },

      deleteCategory: (id) => {
        set({
          categories: get().categories.filter((c) => c.id !== id),
          habits: get().habits.map((h) =>
            h.categoryId === id ? { ...h, categoryId: undefined } : h
          ),
        });
      },

      updateSettings: (updates) => {
        set({ settings: { ...get().settings, ...updates } });
      },
    }),
    {
      name: "habitual-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
