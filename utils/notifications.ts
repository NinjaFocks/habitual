import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Habit } from "../types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
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

export const scheduleHabitReminder = async (habit: Habit): Promise<void> => {
  if (!habit.reminderEnabled || !habit.reminderTime) return;
  
  const granted = await requestNotificationPermissions();
  if (!granted) return;
  
  // Cancel any existing notifications for this habit
  await cancelHabitReminder(habit.id);
  
  const [hours, minutes] = habit.reminderTime.split(":").map(Number);
  
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
        weekday: day === 0 ? 1 : day + 1, // Expo uses 1=Sun, 2=Mon, etc.
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });
  }
};

export const cancelHabitReminder = async (habitId: string): Promise<void> => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled
    .filter((n) => n.identifier.startsWith(`habit-${habitId}`))
    .map((n) => n.identifier);
  
  for (const id of toCancel) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
};

export const rescheduleAllReminders = async (habits: Habit[]): Promise<void> => {
  for (const habit of habits) {
    if (habit.reminderEnabled && !habit.archived) {
      await scheduleHabitReminder(habit);
    } else {
      await cancelHabitReminder(habit.id);
    }
  }
};
