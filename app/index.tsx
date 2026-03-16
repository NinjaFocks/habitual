import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  StatusBar,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../store";
import { useTheme } from "../hooks/useTheme";
import { HabitCard } from "../components/HabitCard";
import { isCompletedOnDate, today, formatDate } from "../utils/habits";
import { AddHabitModal } from "../components/AddHabitModal";
import { format, subDays, addDays, parseISO } from "date-fns";

export default function TodayScreen() {
  const theme = useTheme();
  const { habits, categories, archiveHabit, deleteHabit, toggleCompletion } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(today());

  const progressAnim = useRef(new Animated.Value(0)).current;

  const todayStr = today();

  const goToPrevDay = () => {
    setSelectedDate(formatDate(subDays(parseISO(selectedDate), 1)));
  };

  const goToNextDay = () => {
    const next = formatDate(addDays(parseISO(selectedDate), 1));
    if (next <= todayStr) setSelectedDate(next);
  };  

  const isToday = selectedDate === todayStr;

  const selectedDayOfWeek = parseISO(selectedDate).getDay();

  const activeHabits = habits
    .filter((h) => !h.archived)
    .filter((h) => !h.activeDays || h.activeDays.length === 0 || h.activeDays.includes(selectedDayOfWeek))
    .sort((a, b) => a.order - b.order);

  const filteredHabits = selectedCategory
    ? activeHabits.filter((h) => h.categoryId === selectedCategory)
    : activeHabits;

  const completedCount = activeHabits.filter((h) =>
    isCompletedOnDate(h, selectedDate)
  ).length;

  const completionPercent =
    activeHabits.length > 0
      ? Math.round((completedCount / activeHabits.length) * 100)
      : 0;

  const handleMarkAllDone = () => {
    activeHabits
      .filter((h) => !isCompletedOnDate(h, selectedDate) && h.type === "boolean")
      .forEach((h) => toggleCompletion(h.id, selectedDate, 1));
  };

  const allBooleanDone = activeHabits
    .filter((h) => h.type === "boolean")
    .every((h) => isCompletedOnDate(h, selectedDate));

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: activeHabits.length > 0 ? completionPercent : 0,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  }, [completionPercent, activeHabits.length]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={theme.text === "#F5F5F5" ? "light-content" : "dark-content"}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.dateText, { color: theme.textSecondary }]}>
              {format(parseISO(selectedDate), "EEEE, MMMM d")}
            </Text>
            <Text style={[styles.title, { color: theme.text }]}>
              {isToday ? "Today" : format(parseISO(selectedDate), "MMM d")}
            </Text>
          </View>
          <View style={styles.headerRight}>
            {!isToday && (
              <Pressable
                onPress={() => setSelectedDate(today())}
                style={[styles.navButton, { backgroundColor: theme.surfaceSecondary }]}
              >
                <Text style={[styles.todayButtonText, { color: theme.text }]}>Today</Text>
              </Pressable>
            )}
            <Pressable
              onPress={goToPrevDay}
              style={[styles.navButton, { backgroundColor: theme.surfaceSecondary }]}
            >
              <Ionicons name="chevron-back" size={18} color={theme.text} />
            </Pressable>
            <Pressable
              onPress={goToNextDay}
              style={[styles.navButton, {
                backgroundColor: theme.surfaceSecondary,
                opacity: isToday ? 0.3 : 1,
              }]}
              disabled={isToday}
            >
              <Ionicons name="chevron-forward" size={18} color={theme.text} />
            </Pressable>
            <Pressable
              onPress={() => setShowAdd(true)}
              style={[styles.addButton, { backgroundColor: "#6C63FF" }]}
            >
              <Ionicons name="add" size={22} color="#FFF" />
            </Pressable>
          </View>
        </View>

        {/* Mark all done row — always rendered to prevent layout jump */}
        <View style={styles.markAllRow}>
          {activeHabits.some((h) => h.type === "boolean") && !allBooleanDone ? (
            <Pressable
              onPress={handleMarkAllDone}
              style={[styles.markAllButton, { borderColor: "#6C63FF" }]}
            >
              <Ionicons name="checkmark-done-outline" size={15} color="#6C63FF" />
              <Text style={[styles.markAllText, { color: "#6C63FF" }]}>Mark all done</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Progress Bar */}
        {activeHabits.length > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                {completedCount} of {activeHabits.length} completed
              </Text>
              <Text style={[styles.progressPercent, { color: "#6C63FF" }]}>
                {completionPercent}%
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: theme.inactive }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }),
                    backgroundColor: "#6C63FF",
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Category Filter Pills */}
        {categories.length > 0 && activeHabits.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryContent}
          >
            <Pressable
              onPress={() => setSelectedCategory(null)}
              style={[
                styles.categoryPill,
                {
                  backgroundColor:
                    selectedCategory === null
                      ? "#6C63FF"
                      : theme.surfaceSecondary,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  {
                    color:
                      selectedCategory === null ? "#FFF" : theme.textSecondary,
                  },
                ]}
              >
                All
              </Text>
            </Pressable>
            {categories.map((cat) => {
              const hasHabits = activeHabits.some((h) => h.categoryId === cat.id);
              if (!hasHabits) return null;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() =>
                    setSelectedCategory(
                      selectedCategory === cat.id ? null : cat.id
                    )
                  }
                  style={[
                    styles.categoryPill,
                    {
                      backgroundColor:
                        selectedCategory === cat.id
                          ? cat.color
                          : theme.surfaceSecondary,
                    },
                  ]}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={12}
                    color={selectedCategory === cat.id ? "#FFF" : cat.color}
                  />
                  <Text
                    style={[
                      styles.categoryPillText,
                      {
                        color:
                          selectedCategory === cat.id
                            ? "#FFF"
                            : theme.textSecondary,
                      },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* Habit List */}
        <View style={styles.habitList}>
          {filteredHabits.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color={theme.inactive} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {activeHabits.length === 0
                  ? "No habits yet"
                  : "No habits in this category"}
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                {activeHabits.length === 0
                  ? "Tap + to add your first habit"
                  : "Try selecting a different filter"}
              </Text>
              {activeHabits.length === 0 && (
                <Pressable
                  onPress={() => setShowAdd(true)}
                  style={[styles.emptyButton, { backgroundColor: "#6C63FF" }]}
                >
                  <Text style={styles.emptyButtonText}>Add First Habit</Text>
                </Pressable>
              )}
            </View>
          )}

          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              selectedDate={selectedDate}
              onPress={() =>
                router.push({ pathname: "/habit/[id]", params: { id: habit.id } })
              }
              onLongPress={() =>
                Alert.alert(habit.name, undefined, [
                  {
                    text: "Edit",
                    onPress: () => router.push({ pathname: "/habit/[id]", params: { id: habit.id } }),
                  },
                  {
                    text: habit.archived ? "Unarchive" : "Archive",
                    onPress: () => archiveHabit(habit.id),
                  },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () =>
                      Alert.alert("Delete Habit", "Are you sure? This cannot be undone.", [
                        { text: "Cancel", style: "cancel" },
                        { text: "Delete", style: "destructive", onPress: () => deleteHabit(habit.id) },
                      ]),
                  },
                  { text: "Cancel", style: "cancel" },
                ])
              }
            />
          ))}
        </View>
      </ScrollView>

      <AddHabitModal visible={showAdd} onClose={() => setShowAdd(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  dateText: { fontSize: 13, fontWeight: "500", marginBottom: 2 },
  title: { fontSize: 30, fontWeight: "700", letterSpacing: -0.5 },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  progressSection: { marginBottom: 20 },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: { fontSize: 13, fontWeight: "500" },
  progressPercent: { fontSize: 13, fontWeight: "700" },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  categoryScroll: { marginBottom: 16 },
  categoryContent: { gap: 8, paddingRight: 20 },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  categoryPillText: { fontSize: 12, fontWeight: "600" },
  habitList: { gap: 0 },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", marginTop: 8 },
  emptySubtitle: { fontSize: 14, textAlign: "center" },
  emptyButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: { color: "#FFF", fontWeight: "600", fontSize: 15 },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  navButton: {
    height: 34,
    minWidth: 34,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  todayButton: {
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  todayButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  markAllRow: {
    height: 36,
    justifyContent: "center",
    alignItems: "flex-end",
    marginTop: -30,
    marginBottom: 8,
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
