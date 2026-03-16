import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useStore } from "../../store";
import { useTheme } from "../../hooks/useTheme";
import { HabitGrid } from "../../components/HabitGrid";
import { AddHabitModal } from "../../components/AddHabitModal";
import {
  getCurrentStreak,
  getLongestStreak,
  getCompletionRate,
  getTotalCompletions,
  isCompletedOnDate,
  today,
  formatDuration,
} from "../../utils/habits";
import { format, parseISO } from "date-fns";

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { habits, toggleCompletion, deleteHabit, archiveHabit } = useStore();
  const [showEdit, setShowEdit] = useState(false);
  const [countInput, setCountInput] = useState("");

  const habit = habits.find((h) => h.id === id);

  if (!habit) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text, padding: 20 }}>Habit not found</Text>
      </SafeAreaView>
    );
  }

  const todayStr = today();
  const isCompleted = isCompletedOnDate(habit, todayStr);
  const currentStreak = getCurrentStreak(habit);
  const longestStreak = getLongestStreak(habit);
  const completionRate = getCompletionRate(habit, 30);
  const totalCompletions = getTotalCompletions(habit);
  const todayCompletion = habit.completions.find((c) => c.date === todayStr);
  const initialSeconds = todayCompletion?.value ?? 0;
  const [timerMinutes, setTimerMinutes] = useState(Math.floor(initialSeconds / 60).toString());
  const [timerSeconds, setTimerSeconds] = useState((initialSeconds % 60).toString());

  const handleToggle = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(
        isCompleted
          ? Haptics.ImpactFeedbackStyle.Light
          : Haptics.ImpactFeedbackStyle.Medium
      );
    }
    toggleCompletion(habit.id, todayStr, 1);
  };

  const handleCountChange = (delta: number) => {
    const current = todayCompletion?.value ?? 0;
    const newVal = Math.max(0, current + delta);
    toggleCompletion(habit.id, todayStr, newVal);
  };

  const handleDelete = () => {
    Alert.alert("Delete Habit", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteHabit(habit.id);
          router.back();
        },
      },
    ]);
  };

  const stats = [
    { label: "Current Streak", value: `${currentStreak}d`, icon: "flame" },
    { label: "Longest Streak", value: `${longestStreak}d`, icon: "trophy-outline" },
    { label: "30-day Rate", value: `${completionRate}%`, icon: "trending-up-outline" },
    { label: "Total Done", value: `${totalCompletions}`, icon: "checkmark-circle-outline" },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={[styles.headerIcon, { backgroundColor: habit.color + "22" }]}>
            <Ionicons name={habit.icon as any} size={20} color={habit.color} />
          </View>
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
            {habit.name}
          </Text>
        </View>
        <Pressable
          onPress={() =>
            Alert.alert(habit.name, undefined, [
              { text: "Edit", onPress: () => setShowEdit(true) },
              {
                text: habit.archived ? "Unarchive" : "Archive",
                onPress: () => {
                  archiveHabit(habit.id);
                  router.back();
                },
              },
              { text: "Delete", style: "destructive", onPress: handleDelete },
              { text: "Cancel", style: "cancel" },
            ])
          }
          style={styles.moreBtn}
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Today's action */}
        <View style={styles.todaySection}>
          {habit.type === "boolean" ? (
            <Pressable
              onPress={handleToggle}
              style={[
                styles.completeButton,
                {
                  backgroundColor: isCompleted ? habit.color : "transparent",
                  borderColor: isCompleted ? habit.color : theme.border,
                },
              ]}
            >
              <Ionicons
                name={isCompleted ? "checkmark-circle" : "ellipse-outline"}
                size={28}
                color={isCompleted ? "#FFF" : theme.textSecondary}
              />
              <Text
                style={[
                  styles.completeButtonText,
                  { color: isCompleted ? "#FFF" : theme.textSecondary },
                ]}
              >
                {isCompleted ? "Done today! ✓" : "Mark as done"}
              </Text>
            </Pressable>
          ) : (
            <View style={[styles.counterCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.counterLabel, { color: theme.textSecondary }]}>
              Today — {habit.targetValue ? `Target: ${habit.targetValue}${habit.unit ? ` ${habit.unit}` : ""}` : "No target set"}
            </Text>
            {habit.type === "timer" ? (
              <View style={styles.timerRow}>
                <View style={styles.timerInputGroup}>
                  <TextInput
                    value={timerMinutes}
                    onChangeText={(v) => {
                      setTimerMinutes(v.replace(/[^0-9]/g, ""));
                    }}
                    onBlur={() => {
                      const mins = parseInt(timerMinutes || "0");
                      const secs = parseInt(timerSeconds || "0");
                      toggleCompletion(habit.id, todayStr, mins * 60 + secs);
                    }}
                    keyboardType="number-pad"
                    maxLength={3}
                    style={[styles.timerInput, { color: habit.color, borderColor: theme.border, backgroundColor: theme.surfaceSecondary }]}
                  />
                  <Text style={[styles.timerLabel, { color: theme.textSecondary }]}>min</Text>
                </View>
                <Text style={[styles.timerColon, { color: theme.textSecondary }]}>:</Text>
                <View style={styles.timerInputGroup}>
                  <TextInput
                    value={timerSeconds}
                    onChangeText={(v) => {
                      const n = Math.min(59, parseInt(v.replace(/[^0-9]/g, "") || "0"));
                      setTimerSeconds(n.toString());
                    }}
                    onBlur={() => {
                      const mins = parseInt(timerMinutes || "0");
                      const secs = parseInt(timerSeconds || "0");
                      toggleCompletion(habit.id, todayStr, mins * 60 + secs);
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                    style={[styles.timerInput, { color: habit.color, borderColor: theme.border, backgroundColor: theme.surfaceSecondary }]}
                  />
                  <Text style={[styles.timerLabel, { color: theme.textSecondary }]}>sec</Text>
                </View>
              </View>
            ) : (
              <View style={styles.counterRow}>
                <Pressable
                  onPress={() => handleCountChange(-1)}
                  style={[styles.counterBtn, { backgroundColor: theme.surfaceSecondary }]}
                >
                  <Ionicons name="remove" size={24} color={theme.text} />
                </Pressable>
                <Text style={[styles.counterValue, { color: habit.color }]}>
                  {todayCompletion?.value ?? 0}
                  {habit.unit ? ` ${habit.unit}` : ""}
                </Text>
                <Pressable
                  onPress={() => handleCountChange(1)}
                  style={[styles.counterBtn, { backgroundColor: habit.color }]}
                >
                  <Ionicons name="add" size={24} color="#FFF" />
                </Pressable>
              </View>
            )}
            {habit.targetValue && (
              <View style={[styles.counterProgress, { backgroundColor: theme.inactive }]}>
                <View
                  style={[
                    styles.counterProgressFill,
                    {
                      backgroundColor: habit.color,
                      width: `${Math.min(
                        ((todayCompletion?.value ?? 0) / habit.targetValue) * 100,
                        100
                      )}%`,
                    },
                  ]}
                />
              </View>
            )}
          </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View
              key={stat.label}
              style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <Ionicons name={stat.icon as any} size={18} color={habit.color} />
              <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Full Grid */}
        <View style={[styles.gridCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.gridCardTitle, { color: theme.text }]}>History</Text>
          <Text style={[styles.gridCardSubtitle, { color: theme.textSecondary }]}>
            Tap a past day to toggle it
          </Text>
          <HabitGrid
            habit={habit}
            onDayPress={(date) => toggleCompletion(habit.id, date, 1)}
          />
        </View>

        {/* Recent completions */}
        <View style={[styles.recentCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.gridCardTitle, { color: theme.text }]}>Recent Activity</Text>
          {habit.completions.length === 0 ? (
            <Text style={[styles.noActivity, { color: theme.textSecondary }]}>
              No completions recorded yet
            </Text>
          ) : (
            [...habit.completions]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 7)
              .map((c, i) => (
                <View
                  key={c.date}
                  style={[
                    styles.activityRow,
                    i > 0 && { borderTopWidth: 1, borderTopColor: theme.border },
                  ]}
                >
                  <View style={[styles.activityDot, { backgroundColor: habit.color }]} />
                  <Text style={[styles.activityDate, { color: theme.text }]}>
                    {format(parseISO(c.date), "EEE, MMM d")}
                  </Text>
                  <Text style={[styles.activityValue, { color: habit.color }]}>
                    {habit.type === "boolean"
                      ? "✓"
                      : habit.type === "timer"
                      ? formatDuration(c.value)
                      : `${c.value}${habit.unit ? ` ${habit.unit}` : ""}`}
                  </Text>
                </View>
              ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <AddHabitModal
        visible={showEdit}
        onClose={() => setShowEdit(false)}
        editHabitId={habit.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 12,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "600", flex: 1 },
  moreBtn: { padding: 4 },
  scroll: { flex: 1 },
  todaySection: { padding: 20 },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
  },
  completeButtonText: { fontSize: 17, fontWeight: "600" },
  counterCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  counterLabel: { fontSize: 13, fontWeight: "500" },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counterBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  counterValue: { fontSize: 32, fontWeight: "700" },
  counterProgress: { height: 6, borderRadius: 3, overflow: "hidden" },
  counterProgressFill: { height: "100%", borderRadius: 3 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 4,
    alignItems: "flex-start",
  },
  statValue: { fontSize: 22, fontWeight: "700", marginTop: 4 },
  statLabel: { fontSize: 12 },
  gridCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 4,
    overflow: "hidden",
  },
  gridCardTitle: { fontSize: 16, fontWeight: "600" },
  gridCardSubtitle: { fontSize: 12, marginBottom: 8 },
  recentCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    overflow: "hidden",
  },
  noActivity: { fontSize: 14, marginTop: 8 },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  activityDot: { width: 8, height: 8, borderRadius: 4 },
  activityDate: { flex: 1, fontSize: 14 },
  activityValue: { fontSize: 14, fontWeight: "600" },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  timerInputGroup: {
    alignItems: "center",
    gap: 4,
  },
  timerInput: {
    width: 80,
    height: 64,
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  timerColon: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },
});
