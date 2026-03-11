import { format, subDays, eachDayOfInterval, startOfWeek, parseISO, differenceInDays, isToday, isYesterday } from "date-fns";
import { Habit } from "../types";

export const formatDate = (date: Date): string => format(date, "yyyy-MM-dd");

export const today = (): string => formatDate(new Date());

export const getGridDates = (weeks: number, weekStartsOn: 0 | 1 = 1): string[] => {
  const end = new Date();
  const start = subDays(end, weeks * 7 - 1);
  return eachDayOfInterval({ start, end }).map(formatDate);
};

export const getGridColumns = (weeks: number, weekStartsOn: 0 | 1 = 1): string[][] => {
  const dates = getGridDates(weeks, weekStartsOn);
  const columns: string[][] = [];
  
  // Group into weeks (columns)
  for (let i = 0; i < weeks; i++) {
    const weekDates = dates.slice(i * 7, (i + 1) * 7);
    columns.push(weekDates);
  }
  return columns;
};

export const isCompletedOnDate = (habit: Habit, date: string): boolean => {
  const completion = habit.completions.find((c) => c.date === date);
  if (!completion) return false;
  if (habit.type === "boolean") return completion.value > 0;
  if (habit.targetValue) return completion.value >= habit.targetValue;
  return completion.value > 0;
};

export const getCompletionIntensity = (habit: Habit, date: string): number => {
  // Returns 0-1 for shading intensity
  const completion = habit.completions.find((c) => c.date === date);
  if (!completion) return 0;
  if (habit.type === "boolean") return completion.value > 0 ? 1 : 0;
  if (habit.targetValue && habit.targetValue > 0) {
    return Math.min(completion.value / habit.targetValue, 1);
  }
  return completion.value > 0 ? 1 : 0;
};

export const getCurrentStreak = (habit: Habit): number => {
  let streak = 0;
  let checkDate = new Date();
  
  // If today isn't completed, start from yesterday
  if (!isCompletedOnDate(habit, formatDate(checkDate))) {
    checkDate = subDays(checkDate, 1);
  }
  
  while (true) {
    const dateStr = formatDate(checkDate);
    if (isCompletedOnDate(habit, dateStr)) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }
  
  return streak;
};

export const getLongestStreak = (habit: Habit): number => {
  if (habit.completions.length === 0) return 0;
  
  const sortedDates = habit.completions
    .filter((c) => habit.type === "boolean" ? c.value > 0 : (habit.targetValue ? c.value >= habit.targetValue : c.value > 0))
    .map((c) => c.date)
    .sort();
  
  if (sortedDates.length === 0) return 0;
  
  let maxStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = parseISO(sortedDates[i - 1]);
    const curr = parseISO(sortedDates[i]);
    const diff = differenceInDays(curr, prev);
    
    if (diff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (diff > 1) {
      currentStreak = 1;
    }
  }
  
  return maxStreak;
};

export const getCompletionRate = (habit: Habit, days: number = 30): number => {
  const dates = Array.from({ length: days }, (_, i) =>
    formatDate(subDays(new Date(), i))
  );
  
  const createdDate = parseISO(habit.createdAt);
  const validDates = dates.filter((d) => parseISO(d) >= createdDate);
  if (validDates.length === 0) return 0;
  
  const completed = validDates.filter((d) => isCompletedOnDate(habit, d)).length;
  return Math.round((completed / validDates.length) * 100);
};

export const getTotalCompletions = (habit: Habit): number => {
  return habit.completions.filter((c) =>
    habit.type === "boolean"
      ? c.value > 0
      : habit.targetValue
      ? c.value >= habit.targetValue
      : c.value > 0
  ).length;
};

export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};
