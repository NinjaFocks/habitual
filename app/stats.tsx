import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../store";
import { useTheme } from "../hooks/useTheme";
import {
  getCurrentStreak,
  getLongestStreak,
  getCompletionRate,
  getTotalCompletions,
  isCompletedOnDate,
  today,
} from "../utils/habits";

export default function StatsScreen() {
  const theme = useTheme();
  const { habits, categories } = useStore();
  const todayStr = today();

  const activeHabits = habits.filter((h) => !h.archived);
  const completedToday = activeHabits.filter((h) =>
    isCompletedOnDate(h, todayStr)
  ).length;

  // Best streaks across all habits
  const topStreaks = [...activeHabits]
    .map((h) => ({ habit: h, streak: getCurrentStreak(h) }))
    .filter((s) => s.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 5);

  // Overall 30-day rate
  const overallRate =
    activeHabits.length > 0
      ? Math.round(
          activeHabits.reduce((sum, h) => sum + getCompletionRate(h, 30), 0) /
            activeHabits.length
        )
      : 0;

  // Most consistent habit
  const mostConsistent = activeHabits.length > 0
    ? [...activeHabits].sort(
        (a, b) => getCompletionRate(b, 30) - getCompletionRate(a, 30)
      )[0]
    : null;

  // Per category completion rate
  const categoryStats = categories
    .map((cat) => {
      const catHabits = activeHabits.filter((h) => h.categoryId === cat.id);
      if (catHabits.length === 0) return null;
      const rate =
        catHabits.length > 0
          ? Math.round(
              catHabits.reduce((sum, h) => sum + getCompletionRate(h, 30), 0) /
                catHabits.length
            )
          : 0;
      return { category: cat, rate, count: catHabits.length };
    })
    .filter(Boolean);

    const allTimeLongestStreak = activeHabits.length > 0
    ? Math.max(...activeHabits.map((h) => getLongestStreak(h)))
    : 0;

    const allTimeTotalCompletions = activeHabits.reduce(
      (sum, h) => sum + getTotalCompletions(h), 0
    );

    const habitWithLongestStreak = activeHabits.length > 0
      ? [...activeHabits].sort((a, b) => getLongestStreak(b) - getLongestStreak(a))[0]
      : null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.text }]}>Stats</Text>

        {activeHabits.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="bar-chart-outline" size={48} color={theme.inactive} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Add some habits to see your stats
            </Text>
          </View>
        ) : (
          <>
            {/* Summary cards */}
            <View style={styles.summaryGrid}>
              <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Ionicons name="today-outline" size={20} color="#6C63FF" />
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  {completedToday}/{activeHabits.length}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Done Today
                </Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Ionicons name="trending-up-outline" size={20} color="#43BCCD" />
                <Text style={[styles.summaryValue, { color: theme.text }]}>{overallRate}%</Text>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  30-day Average
                </Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Ionicons name="list-outline" size={20} color="#F9844A" />
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  {activeHabits.length}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Active Habits
                </Text>
              </View>
            </View>

            {/* Most Consistent */}
            {mostConsistent && (
              <>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>⭐ Most Consistent</Text>
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, marginBottom: 24 }]}>
                  <View style={styles.streakRow}>
                    <View style={[styles.streakIcon, { backgroundColor: mostConsistent.color + "22" }]}>
                      <Ionicons name={mostConsistent.icon as any} size={16} color={mostConsistent.color} />
                    </View>
                    <Text style={[styles.streakName, { color: theme.text }]}>{mostConsistent.name}</Text>
                    <Text style={[styles.streakDays, { color: mostConsistent.color }]}>
                      {getCompletionRate(mostConsistent, 30)}%
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* Top Streaks */}
            {topStreaks.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  🔥 Active Streaks
                </Text>
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  {topStreaks.map((item, i) => (
                    <View
                      key={item.habit.id}
                      style={[
                        styles.streakRow,
                        i > 0 && { borderTopWidth: 1, borderTopColor: theme.border },
                      ]}
                    >
                      <View style={[styles.streakIcon, { backgroundColor: item.habit.color + "22" }]}>
                        <Ionicons
                          name={item.habit.icon as any}
                          size={16}
                          color={item.habit.color}
                        />
                      </View>
                      <Text style={[styles.streakName, { color: theme.text }]} numberOfLines={1}>
                        {item.habit.name}
                      </Text>
                      <View style={styles.streakBadge}>
                        <Ionicons name="flame" size={14} color={item.habit.color} />
                        <Text style={[styles.streakDays, { color: item.habit.color }]}>
                          {item.streak}d
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Per-habit 30-day rates */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              📊 30-day Completion
            </Text>
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {activeHabits.map((habit, i) => {
                const rate = getCompletionRate(habit, 30);
                return (
                  <View
                    key={habit.id}
                    style={[
                      styles.rateRow,
                      i > 0 && { borderTopWidth: 1, borderTopColor: theme.border },
                    ]}
                  >
                    <View style={styles.rateLeft}>
                      <View style={[styles.rateDot, { backgroundColor: habit.color }]} />
                      <Text style={[styles.rateName, { color: theme.text }]} numberOfLines={1}>
                        {habit.name}
                      </Text>
                    </View>
                    <View style={styles.rateRight}>
                      <View style={[styles.rateTrack, { backgroundColor: theme.inactive }]}>
                        <View
                          style={[
                            styles.rateFill,
                            { backgroundColor: habit.color, width: `${rate}%` },
                          ]}
                        />
                      </View>
                      <Text style={[styles.ratePercent, { color: theme.textSecondary }]}>
                        {rate}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* By category */}
            {categoryStats.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  🗂️ By Category
                </Text>
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  {categoryStats.map((cs, i) => (
                    <View
                      key={cs!.category.id}
                      style={[
                        styles.catRow,
                        i > 0 && { borderTopWidth: 1, borderTopColor: theme.border },
                      ]}
                    >
                      <View style={[styles.catIcon, { backgroundColor: cs!.category.color + "22" }]}>
                        <Ionicons
                          name={cs!.category.icon as any}
                          size={16}
                          color={cs!.category.color}
                        />
                      </View>
                      <Text style={[styles.catName, { color: theme.text }]}>
                        {cs!.category.name}
                      </Text>
                      <Text style={[styles.catCount, { color: theme.textSecondary }]}>
                        {cs!.count} habit{cs!.count !== 1 ? "s" : ""}
                      </Text>
                      <Text style={[styles.catRate, { color: cs!.category.color }]}>
                        {cs!.rate}%
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        )}

        {/* All time */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>🏆 All time</Text>
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, marginBottom: 24 }]}>
              <View style={styles.streakRow}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#6C63FF" />
                <Text style={[styles.streakName, { color: theme.text }]}>Total completions</Text>
                <Text style={[styles.streakDays, { color: "#6C63FF" }]}>{allTimeTotalCompletions}</Text>
              </View>
              {habitWithLongestStreak && (
                <View style={[styles.streakRow, { borderTopWidth: 1, borderTopColor: theme.border }]}>
                  <Ionicons name="trophy-outline" size={18} color={habitWithLongestStreak.color} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.streakName, { color: theme.text }]}>Longest ever streak</Text>
                    <Text style={[styles.streakDays, { color: habitWithLongestStreak.color, fontSize: 12 }]}>
                      {habitWithLongestStreak.name}
                    </Text>
                  </View>
                  <Text style={[styles.streakDays, { color: habitWithLongestStreak.color }]}>
                    {allTimeLongestStreak}d
                  </Text>
                </View>
              )}
            </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 20 },
  title: { fontSize: 30, fontWeight: "700", letterSpacing: -0.5, marginBottom: 20 },
  empty: { alignItems: "center", paddingVertical: 80, gap: 12 },
  emptyText: { fontSize: 16, textAlign: "center" },
  summaryGrid: { flexDirection: "row", gap: 10, marginBottom: 24 },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  summaryValue: { fontSize: 20, fontWeight: "700" },
  summaryLabel: { fontSize: 11, textAlign: "center" },
  sectionTitle: { fontSize: 17, fontWeight: "600", marginBottom: 10 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 24,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  streakIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  streakName: { flex: 1, fontSize: 15 },
  streakBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
  streakDays: { fontSize: 14, fontWeight: "700" },
  rateRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  rateLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  rateDot: { width: 8, height: 8, borderRadius: 4 },
  rateName: { flex: 1, fontSize: 14 },
  rateRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  rateTrack: { width: 80, height: 5, borderRadius: 3, overflow: "hidden" },
  rateFill: { height: "100%", borderRadius: 3 },
  ratePercent: { fontSize: 12, width: 32, textAlign: "right" },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  catIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  catName: { flex: 1, fontSize: 15 },
  catCount: { fontSize: 12 },
  catRate: { fontSize: 15, fontWeight: "700", minWidth: 38, textAlign: "right" },
});
