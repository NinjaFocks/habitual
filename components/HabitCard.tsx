import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Habit } from "../types";
import { HabitGrid } from "./HabitGrid";
import { getCurrentStreak, isCompletedOnDate, today } from "../utils/habits";
import { useTheme } from "../hooks/useTheme";
import { useStore } from "../store";

type Props = {
  habit: Habit;
  onPress: () => void;
  onLongPress?: () => void;
  selectedDate?: string;
};

export const HabitCard: React.FC<Props> = ({ habit, onPress, onLongPress, selectedDate }) => {
  const theme = useTheme();
  const { toggleCompletion } = useStore();
  const todayStr = today();
  const activeDate = selectedDate ?? todayStr;
  const isCompleted = isCompletedOnDate(habit, activeDate);
  const streak = getCurrentStreak(habit);

  const handleToggle = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(
        isCompleted
          ? Haptics.ImpactFeedbackStyle.Light
          : Haptics.ImpactFeedbackStyle.Medium
      );
    }
    toggleCompletion(habit.id, activeDate , habit.type === "boolean" ? 1 : undefined);
  };

  const todayCompletion = habit.completions.find((c) => c.date === activeDate);

  const handleCountChange = async (delta: number) => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const current = todayCompletion?.value ?? 0;
    const newVal = Math.max(0, current + delta);
    toggleCompletion(habit.id, activeDate, newVal);
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      {/* Top row */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: habit.color + "22" },
            ]}
          >
            <Ionicons
              name={habit.icon as any}
              size={18}
              color={habit.color}
            />
          </View>
          <View style={styles.titleBlock}>
            <Text
              style={[styles.habitName, { color: theme.text }]}
              numberOfLines={1}
            >
              {habit.name}
            </Text>
            {streak > 0 && (
              <View style={styles.streakRow}>
                <Ionicons name="flame" size={11} color={habit.color} />
                <Text style={[styles.streakText, { color: habit.color }]}>
                  {streak} day streak
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Complete button (boolean) or value display */}
        {habit.type === "boolean" ? (
          <Pressable
            onPress={handleToggle}
            style={[
              styles.checkButton,
              {
                backgroundColor: isCompleted ? habit.color : "transparent",
                borderColor: isCompleted ? habit.color : theme.border,
              },
            ]}
          >
            {isCompleted && (
              <Ionicons name="checkmark" size={16} color="#FFF" />
            )}
          </Pressable>
        ) : (
          <View style={styles.counterRow}>
            <Pressable
              onPress={() => handleCountChange(-1)}
              style={[styles.counterBtn, { backgroundColor: theme.surfaceSecondary }]}
            >
              <Ionicons name="remove" size={16} color={theme.text} />
            </Pressable>
            <Text style={[styles.counterValue, { color: isCompleted ? habit.color : theme.textSecondary }]}>
              {todayCompletion?.value ?? 0}{habit.unit ? ` ${habit.unit}` : ""}
            </Text>
            <Pressable
              onPress={() => handleCountChange(1)}
              style={[styles.counterBtn, { backgroundColor: habit.color }]}
            >
              <Ionicons name="add" size={16} color="#FFF" />
            </Pressable>
          </View>
        )}
      </View>

      {/* Grid */}
      <View style={styles.gridContainer}>
        <HabitGrid
          habit={habit}
          onDayPress={(date) => {
            if (date === todayStr && habit.type === "boolean") {
              handleToggle();
            } else if (date === todayStr) {
              onPress();
            }
          }}
          compact
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    flex: 1,
  },
  habitName: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  streakText: {
    fontSize: 11,
    fontWeight: "500",
  },
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  valueButton: {
    minWidth: 44,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  valueText: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  gridContainer: {
    overflow: "hidden",
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  counterValue: {
    fontSize: 15,
    fontWeight: "700",
    minWidth: 40,
    textAlign: "center",
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
