import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView, Text, Pressable } from "react-native";
import { Habit } from "../types";
import { getGridColumns, getCompletionIntensity, formatDate, today } from "../utils/habits";
import { useTheme } from "../hooks/useTheme";
import { useStore } from "../store";

type Props = {
  habit: Habit;
  onDayPress?: (date: string) => void;
  compact?: boolean;
};

const CELL_SIZE = 11;
const CELL_GAP = 2;
const COMPACT_CELL_SIZE = 8;
const COMPACT_CELL_GAP = 2;

export const HabitGrid: React.FC<Props> = ({ habit, onDayPress, compact = false }) => {
  const theme = useTheme();
  const { settings } = useStore();
  const todayStr = today();
  
  const size = compact ? COMPACT_CELL_SIZE : CELL_SIZE;
  const gap = compact ? COMPACT_CELL_GAP : CELL_GAP;

  const columns = useMemo(
    () => getGridColumns(settings.gridWeeks, settings.weekStartsOn),
    [settings.gridWeeks, settings.weekStartsOn]
  );

  const getCellColor = (date: string) => {
    const intensity = getCompletionIntensity(habit, date);
    if (intensity === 0) {
      return theme.inactive;
    }
    // Blend habit color with opacity based on intensity
    return habit.color + Math.round(intensity * 255).toString(16).padStart(2, "0");
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, { gap }]}
    >
      {columns.map((week, colIndex) => (
        <View key={colIndex} style={[styles.column, { gap }]}>
          {week.map((date, rowIndex) => {
            const isToday = date === todayStr;
            const isFuture = date > todayStr;
            const cellColor = isFuture ? "transparent" : getCellColor(date);

            return (
              <Pressable
                key={date}
                onPress={() => !isFuture && onDayPress?.(date)}
                style={({ pressed }) => [
                  styles.cell,
                  {
                    width: size,
                    height: size,
                    borderRadius: compact ? 2 : 3,
                    backgroundColor: isFuture ? "transparent" : cellColor,
                    borderWidth: isToday ? 1.5 : isFuture ? 1 : 0,
                    borderColor: isToday
                      ? habit.color
                      : isFuture
                      ? theme.border
                      : "transparent",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              />
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  column: {
    flexDirection: "column",
  },
  cell: {
    // base style, overridden inline
  },
});
