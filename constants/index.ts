export const HABIT_COLORS = [
  "#6C63FF", // Purple
  "#FF6584", // Pink
  "#43BCCD", // Cyan
  "#F9844A", // Orange
  "#4CC9F0", // Sky
  "#7BDE89", // Green
  "#FFD166", // Yellow
  "#EF476F", // Red
  "#06D6A0", // Teal
  "#118AB2", // Blue
  "#9B5DE5", // Violet
  "#F15BB5", // Hot pink
];

export const HABIT_ICONS = [
  "fitness-outline",
  "book-outline",
  "water-outline",
  "bed-outline",
  "bicycle-outline",
  "musical-notes-outline",
  "leaf-outline",
  "heart-outline",
  "barbell-outline",
  "pizza-outline",
  "cafe-outline",
  "journal-outline",
  "walk-outline",
  "moon-outline",
  "sunny-outline",
  "medkit-outline",
  "school-outline",
  "brush-outline",
  "code-slash-outline",
  "camera-outline",
  "people-outline",
  "call-outline",
  "desktop-outline",
  "dice-outline",
];

export const CATEGORY_COLORS = [
  "#6C63FF",
  "#FF6584",
  "#43BCCD",
  "#F9844A",
  "#7BDE89",
  "#FFD166",
  "#EF476F",
  "#9B5DE5",
];

export const DEFAULT_CATEGORIES = [
  { id: "health", name: "Health", color: "#7BDE89", icon: "heart-outline" },
  { id: "mind", name: "Mind", color: "#6C63FF", icon: "book-outline" },
  { id: "fitness", name: "Fitness", color: "#F9844A", icon: "barbell-outline" },
  { id: "social", name: "Social", color: "#43BCCD", icon: "people-outline" },
];

export const DEFAULT_SETTINGS = {
  gridWeeks: 13,
  theme: "system" as const,
  weekStartsOn: 1 as const,
  defaultReminderTime: "09:00",
};

export const GRID_WEEK_OPTIONS = [
  { label: "3 months", value: 13 },
  { label: "6 months", value: 26 },
  { label: "1 year", value: 52 },
];
