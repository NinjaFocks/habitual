import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { AppSettings, Habit } from "../types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  
  if (existingStatus === "granted") return true;
  
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
};

// Accepts "H:MM" or "HH:MM" in 24-hour time, returns null for anything else
export const parseReminderTime = (
  time?: string
): { hours: number; minutes: number } | null => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time?.trim() ?? "");
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours <= 23 && minutes <= 59 ? { hours, minutes } : null;
};

export const scheduleHabitReminder = async (habit: Habit): Promise<void> => {
  const time = parseReminderTime(habit.reminderTime);
  if (!habit.reminderEnabled || !time) return;
  
  const granted = await requestNotificationPermissions();
  if (!granted) return;
  
  // Cancel any existing notifications for this habit
  await cancelHabitReminder(habit.id);
  
  const { hours, minutes } = time;
  
  // Schedule for each selected day
  for (const day of habit.reminderDays) {
    await Notifications.scheduleNotificationAsync({
      identifier: `habit-${habit.id}-day-${day}`,
      content: {
        title: "Time for your habit! 🎯",
        body: `Don't forget: ${habit.name}`,
        data: { habitId: habit.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: day === 0 ? 1 : day + 1, // Expo uses 1=Sun, 2=Mon, etc.
        hour: hours,
        minute: minutes,
      },
    });
  }
};

export const cancelHabitReminder = async (habitId: string): Promise<void> => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled
    .filter((n) => n.identifier.startsWith(`habit-${habitId}-day-`))
    .map((n) => n.identifier);
  
  for (const id of toCancel) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
};

// Make the scheduled notifications match a habit's current settings
export const syncHabitReminder = async (habit: Habit): Promise<void> => {
  if (habit.reminderEnabled && !habit.archived) {
    await scheduleHabitReminder(habit);
  } else {
    await cancelHabitReminder(habit.id);
  }
};

export const rescheduleAllReminders = async (habits: Habit[]): Promise<void> => {
  // Runs at launch, so it must never trigger a permission prompt
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") return;

  // Drop reminders for habits that no longer exist, including any that older
  // versions of the app scheduled under a placeholder id
  const knownIds = new Set(habits.map((h) => h.id));
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    const match = /^habit-(.+)-day-\d$/.exec(n.identifier);
    if (match && !knownIds.has(match[1])) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  for (const habit of habits) {
    await syncHabitReminder(habit);
  }
};

// One reminder a day, separate from the per-habit ones
const DAILY_REMINDER_ID = "daily-reminder";

export const syncDailyReminder = async (settings: AppSettings): Promise<void> => {
  // Replace whatever is scheduled with the current setting
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  if (scheduled.some((n) => n.identifier === DAILY_REMINDER_ID)) {
    await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
  }

  const time = parseReminderTime(settings.dailyReminderTime);
  if (!settings.dailyReminderEnabled || !time) return;

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: "Daily check-in",
      body: "Do you need to track anything for today?",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: time.hours,
      minute: time.minutes,
    },
  });
};
