import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useStore } from "../store";
import { useTheme } from "../hooks/useTheme";
import { HabitCard } from "../components/HabitCard";
import { isCompletedOnDate, today } from "../utils/habits";
import { AddHabitModal } from "../components/AddHabitModal";

export default function TodayScreen() {
  const theme = useTheme();
  const { habits, categories } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const todayStr = today();
  const activeHabits = habits
    .filter((h) => !h.archived)
    .sort((a, b) => a.order - b.order);

  const filteredHabits = selectedCategory
    ? activeHabits.filter((h) => h.categoryId === selectedCategory)
    : activeHabits;

  const completedCount = activeHabits.filter((h) =>
    isCompletedOnDate(h, todayStr)
  ).length;

  const completionPercent =
    activeHabits.length > 0
      ? Math.round((completedCount / activeHabits.length) * 100)
      : 0;

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
              {format(new Date(), "EEEE, MMMM d")}
            </Text>
            <Text style={[styles.title, { color: theme.text }]}>Today</Text>
          </View>
          <Pressable
            onPress={() => setShowAdd(true)}
            style={[styles.addButton, { backgroundColor: "#6C63FF" }]}
          >
            <Ionicons name="add" size={22} color="#FFF" />
          </Pressable>
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
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${completionPercent}%`,
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
              onPress={() =>
                router.push({ pathname: "/habit/[id]", params: { id: habit.id } })
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
});
