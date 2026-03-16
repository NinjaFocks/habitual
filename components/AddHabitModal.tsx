import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  Switch,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../store";
import { useTheme } from "../hooks/useTheme";
import { HABIT_COLORS, HABIT_ICONS } from "../constants";
import { HabitType } from "../types";
import { scheduleHabitReminder } from "../utils/notifications";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onClose: () => void;
  editHabitId?: string;
};

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export const AddHabitModal: React.FC<Props> = ({
  visible,
  onClose,
  editHabitId,
}) => {
  const theme = useTheme();
  const { addHabit, updateHabit, habits, categories, settings } = useStore();

  const editHabit = editHabitId ? habits.find((h) => h.id === editHabitId) : null;

  const [name, setName] = useState(editHabit?.name ?? "");
  const [description, setDescription] = useState(editHabit?.description ?? "");
  const [type, setType] = useState<HabitType>(editHabit?.type ?? "boolean");
  const [selectedColor, setSelectedColor] = useState(editHabit?.color ?? HABIT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(editHabit?.icon ?? HABIT_ICONS[0]);
  const [categoryId, setCategoryId] = useState(editHabit?.categoryId ?? "");
  const [targetValue, setTargetValue] = useState(
    editHabit?.targetValue?.toString() ?? ""
  );
  const [unit, setUnit] = useState(editHabit?.unit ?? "");
  const [reminderEnabled, setReminderEnabled] = useState(
    editHabit?.reminderEnabled ?? false
  );
  const [reminderTime, setReminderTime] = useState(
    editHabit?.reminderTime ?? settings.defaultReminderTime
  );
  const [reminderDays, setReminderDays] = useState<number[]>(
    editHabit?.reminderDays ?? [1, 2, 3, 4, 5]
  );

  const toggleDay = (day: number) => {
    setReminderDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    const habitData = {
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      color: selectedColor,
      icon: selectedIcon,
      categoryId: categoryId || undefined,
      targetValue: targetValue ? parseInt(targetValue) : undefined,
      unit: unit.trim() || undefined,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
      reminderDays,
      archived: false,
    };

    if (editHabitId) {
      updateHabit(editHabitId, habitData);
    } else {
      addHabit(habitData);
    }

    if (reminderEnabled) {
      const tempHabit = {
        ...habitData,
        id: editHabitId ?? "temp",
        completions: [],
        createdAt: new Date().toISOString(),
        order: 0,
      };
      await scheduleHabitReminder(tempHabit);
    }

    onClose();
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setType("boolean");
    setSelectedColor(HABIT_COLORS[0]);
    setSelectedIcon(HABIT_ICONS[0]);
    setCategoryId("");
    setTargetValue("");
    setUnit("");
    setReminderEnabled(false);
    setReminderTime(settings.defaultReminderTime);
    setReminderDays([1, 2, 3, 4, 5]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Modal Header */}
        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
          <Pressable onPress={() => { onClose(); resetForm(); }}>
            <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
          </Pressable>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            {editHabitId ? "Edit Habit" : "New Habit"}
          </Text>
          <Pressable onPress={handleSave}>
            <Text style={[styles.saveText, { color: "#6C63FF", opacity: name.trim() ? 1 : 0.4 }]}>
              Save
            </Text>
          </Pressable>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Name */}
          <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Habit name"
              placeholderTextColor={theme.textTertiary}
              style={[styles.nameInput, { color: theme.text }]}
              maxLength={50}
            />
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Description (optional)"
              placeholderTextColor={theme.textTertiary}
              style={[styles.descInput, { color: theme.text }]}
              maxLength={120}
            />
          </View>

          {/* Type */}
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>TYPE</Text>
          <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {(["boolean", "count", "timer"] as HabitType[]).map((t, i) => (
              <Pressable
                key={t}
                onPress={() => setType(t)}
                style={[
                  styles.typeRow,
                  i < 2 && { borderBottomWidth: 1, borderBottomColor: theme.border },
                ]}
              >
                <View style={styles.typeLeft}>
                  <Ionicons
                    name={
                      t === "boolean"
                        ? "checkmark-circle-outline"
                        : t === "count"
                        ? "add-circle-outline"
                        : "timer-outline"
                    }
                    size={20}
                    color={type === t ? "#6C63FF" : theme.textSecondary}
                  />
                  <View>
                    <Text style={[styles.typeTitle, { color: theme.text }]}>
                      {t === "boolean" ? "Yes / No" : t === "count" ? "Count" : "Timer"}
                    </Text>
                    <Text style={[styles.typeSubtitle, { color: theme.textSecondary }]}>
                      {t === "boolean"
                        ? "Did you do it today?"
                        : t === "count"
                        ? "Track a number (e.g. glasses of water)"
                        : "Track time (e.g. reading minutes)"}
                    </Text>
                  </View>
                </View>
                {type === t && (
                  <Ionicons name="checkmark" size={18} color="#6C63FF" />
                )}
              </Pressable>
            ))}
          </View>

          {/* Target (for count/timer) */}
          {type !== "boolean" && (
            <>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>TARGET</Text>
              <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.targetRow}>
                  <TextInput
                    value={targetValue}
                    onChangeText={setTargetValue}
                    placeholder={type === "timer" ? "Target seconds" : "Target count"}
                    placeholderTextColor={theme.textTertiary}
                    keyboardType="number-pad"
                    style={[styles.targetInput, { color: theme.text }]}
                  />
                  <TextInput
                    value={unit}
                    onChangeText={setUnit}
                    placeholder={type === "timer" ? "mins" : "unit"}
                    placeholderTextColor={theme.textTertiary}
                    style={[styles.unitInput, { color: theme.text, borderColor: theme.border }]}
                  />
                </View>
              </View>
            </>
          )}

          {/* Color */}
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>COLOUR</Text>
          <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.colorGrid}>
              {HABIT_COLORS.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorDot,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorDotSelected,
                  ]}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Icon */}
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>ICON</Text>
          <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.iconGrid}>
              {HABIT_ICONS.map((icon) => (
                <Pressable
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  style={[
                    styles.iconDot,
                    {
                      backgroundColor:
                        selectedIcon === icon
                          ? selectedColor + "22"
                          : theme.surfaceSecondary,
                    },
                  ]}
                >
                  <Ionicons
                    name={icon as any}
                    size={20}
                    color={selectedIcon === icon ? selectedColor : theme.textSecondary}
                  />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Category */}
          {categories.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>CATEGORY</Text>
              <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Pressable
                  onPress={() => setCategoryId("")}
                  style={[styles.categoryRow, !categoryId && styles.categoryRowSelected]}
                >
                  <Text style={[styles.categoryRowText, { color: theme.text }]}>None</Text>
                  {!categoryId && <Ionicons name="checkmark" size={18} color="#6C63FF" />}
                </Pressable>
                {categories.map((cat, i) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategoryId(cat.id)}
                    style={[
                      styles.categoryRow,
                      { borderTopWidth: 1, borderTopColor: theme.border },
                      categoryId === cat.id && styles.categoryRowSelected,
                    ]}
                  >
                    <View style={styles.catLeft}>
                      <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                      <Text style={[styles.categoryRowText, { color: theme.text }]}>{cat.name}</Text>
                    </View>
                    {categoryId === cat.id && (
                      <Ionicons name="checkmark" size={18} color="#6C63FF" />
                    )}
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Reminder */}
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>REMINDER</Text>
          <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.reminderToggle}>
              <Text style={[styles.reminderLabel, { color: theme.text }]}>Enable reminder</Text>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ true: "#6C63FF" }}
              />
            </View>
            {reminderEnabled && (
              <>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <View style={styles.reminderDays}>
                  {DAYS.map((day, index) => (
                    <Pressable
                      key={index}
                      onPress={() => toggleDay(index)}
                      style={[
                        styles.dayDot,
                        {
                          backgroundColor: reminderDays.includes(index)
                            ? "#6C63FF"
                            : theme.surfaceSecondary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          {
                            color: reminderDays.includes(index)
                              ? "#FFF"
                              : theme.textSecondary,
                          },
                        ]}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <View style={styles.timeRow}>
                  <Text style={[styles.reminderLabel, { color: theme.text }]}>Time</Text>
                  <TextInput
                    value={reminderTime}
                    onChangeText={setReminderTime}
                    placeholder="HH:MM"
                    placeholderTextColor={theme.textTertiary}
                    style={[styles.timeInput, { color: theme.text, borderColor: theme.border }]}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
              </>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  cancelText: { fontSize: 16 },
  modalTitle: { fontSize: 17, fontWeight: "600" },
  saveText: { fontSize: 16, fontWeight: "600" },
  scroll: { flex: 1, padding: 20 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 20,
    marginLeft: 4,
  },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  nameInput: {
    padding: 16,
    fontSize: 17,
    fontWeight: "500",
  },
  descInput: {
    padding: 16,
    fontSize: 15,
  },
  divider: { height: 1 },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  typeLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  typeTitle: { fontSize: 15, fontWeight: "500" },
  typeSubtitle: { fontSize: 12, marginTop: 1 },
  targetRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  targetInput: { flex: 1, fontSize: 15 },
  unitInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    minWidth: 60,
    textAlign: "center",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 14,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  colorDotSelected: {
    transform: [{ scale: 1.15 }],
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 14,
  },
  iconDot: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  categoryRowSelected: {},
  categoryRowText: { fontSize: 15 },
  catLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  reminderToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  reminderLabel: { fontSize: 15 },
  reminderDays: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 14,
  },
  dayDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: { fontSize: 12, fontWeight: "600" },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  timeInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 15,
    minWidth: 70,
    textAlign: "center",
  },
});
