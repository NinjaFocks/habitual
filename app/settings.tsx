import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../store";
import { useTheme } from "../hooks/useTheme";
import { GRID_WEEK_OPTIONS, CATEGORY_COLORS, HABIT_ICONS } from "../constants";

export default function SettingsScreen() {
  const theme = useTheme();
  const { settings, updateSettings, categories, addCategory, deleteCategory } = useStore();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(CATEGORY_COLORS[0]);
  const [newCatIcon, setNewCatIcon] = useState("folder-outline");

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    addCategory({ name: newCatName.trim(), color: newCatColor, icon: newCatIcon });
    setNewCatName("");
    setNewCatColor(CATEGORY_COLORS[0]);
    setShowAddCategory(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

        {/* Appearance */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>APPEARANCE</Text>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {(["system", "light", "dark"] as const).map((t, i) => (
            <Pressable
              key={t}
              onPress={() => updateSettings({ theme: t })}
              style={[
                styles.row,
                i > 0 && { borderTopWidth: 1, borderTopColor: theme.border },
              ]}
            >
              <Text style={[styles.rowText, { color: theme.text }]}>
                {t === "system" ? "Follow System" : t === "light" ? "Light" : "Dark"}
              </Text>
              {settings.theme === t && (
                <Ionicons name="checkmark" size={18} color="#6C63FF" />
              )}
            </Pressable>
          ))}
        </View>

        {/* Grid weeks */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>GRID HISTORY</Text>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {GRID_WEEK_OPTIONS.map((opt, i) => (
            <Pressable
              key={opt.value}
              onPress={() => updateSettings({ gridWeeks: opt.value })}
              style={[
                styles.row,
                i > 0 && { borderTopWidth: 1, borderTopColor: theme.border },
              ]}
            >
              <Text style={[styles.rowText, { color: theme.text }]}>{opt.label}</Text>
              {settings.gridWeeks === opt.value && (
                <Ionicons name="checkmark" size={18} color="#6C63FF" />
              )}
            </Pressable>
          ))}
        </View>

        {/* Week start */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>WEEK STARTS ON</Text>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {([{ label: "Monday", value: 1 }, { label: "Sunday", value: 0 }] as const).map(
            (opt, i) => (
              <Pressable
                key={opt.value}
                onPress={() => updateSettings({ weekStartsOn: opt.value })}
                style={[
                  styles.row,
                  i > 0 && { borderTopWidth: 1, borderTopColor: theme.border },
                ]}
              >
                <Text style={[styles.rowText, { color: theme.text }]}>{opt.label}</Text>
                {settings.weekStartsOn === opt.value && (
                  <Ionicons name="checkmark" size={18} color="#6C63FF" />
                )}
              </Pressable>
            )
          )}
        </View>

        {/* Default reminder time */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          DEFAULT REMINDER TIME
        </Text>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.row}>
            <Text style={[styles.rowText, { color: theme.text }]}>Default Time</Text>
            <TextInput
              value={settings.defaultReminderTime}
              onChangeText={(t) => updateSettings({ defaultReminderTime: t })}
              placeholder="HH:MM"
              placeholderTextColor={theme.textTertiary}
              style={[styles.timeInput, { color: theme.text, borderColor: theme.border }]}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesHeader}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>CATEGORIES</Text>
          <Pressable onPress={() => setShowAddCategory(true)}>
            <Ionicons name="add-circle-outline" size={20} color="#6C63FF" />
          </Pressable>
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {categories.length === 0 ? (
            <View style={styles.row}>
              <Text style={[styles.rowSubtext, { color: theme.textSecondary }]}>
                No categories yet
              </Text>
            </View>
          ) : (
            categories.map((cat, i) => (
              <View
                key={cat.id}
                style={[
                  styles.row,
                  i > 0 && { borderTopWidth: 1, borderTopColor: theme.border },
                ]}
              >
                <View style={styles.catLeft}>
                  <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                  <Text style={[styles.rowText, { color: theme.text }]}>{cat.name}</Text>
                </View>
                <Pressable
                  onPress={() =>
                    Alert.alert("Delete Category", `Delete "${cat.name}"?`, [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => deleteCategory(cat.id),
                      },
                    ])
                  }
                >
                  <Ionicons name="trash-outline" size={16} color={theme.textTertiary} />
                </Pressable>
              </View>
            ))
          )}
        </View>

        {/* About */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>ABOUT</Text>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.row}>
            <Text style={[styles.rowText, { color: theme.text }]}>Habitual</Text>
            <Text style={[styles.rowSubtext, { color: theme.textSecondary }]}>v1.0.0</Text>
          </View>
          <View style={[styles.row, { borderTopWidth: 1, borderTopColor: theme.border }]}>
            <Text style={[styles.rowText, { color: theme.text }]}>Made with ❤️</Text>
            <Text style={[styles.rowSubtext, { color: theme.textSecondary }]}>
              No ads. No paywalls.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Category Modal */}
      <Modal
        visible={showAddCategory}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddCategory(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setShowAddCategory(false)}>
              <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: theme.text }]}>New Category</Text>
            <Pressable onPress={handleAddCategory}>
              <Text style={[styles.saveText, { color: "#6C63FF", opacity: newCatName.trim() ? 1 : 0.4 }]}>
                Save
              </Text>
            </Pressable>
          </View>

          <ScrollView style={{ padding: 20 }}>
            <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <TextInput
                value={newCatName}
                onChangeText={setNewCatName}
                placeholder="Category name"
                placeholderTextColor={theme.textTertiary}
                style={[styles.nameInput, { color: theme.text }]}
              />
            </View>

            <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: 20 }]}>COLOUR</Text>
            <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.colorGrid}>
                {CATEGORY_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setNewCatColor(color)}
                    style={[
                      styles.colorDot,
                      { backgroundColor: color },
                      newCatColor === color && { transform: [{ scale: 1.2 }] },
                    ]}
                  >
                    {newCatColor === color && (
                      <Ionicons name="checkmark" size={14} color="#FFF" />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 20 },
  title: { fontSize: 30, fontWeight: "700", letterSpacing: -0.5, marginBottom: 20 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 6,
    marginLeft: 4,
  },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  rowText: { fontSize: 15 },
  rowSubtext: { fontSize: 13 },
  timeInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 15,
    minWidth: 70,
    textAlign: "center",
  },
  categoriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    marginLeft: 4,
    marginTop: 8,
  },
  catLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  modalContainer: { flex: 1 },
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
  nameInput: { padding: 16, fontSize: 17, fontWeight: "500" },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 14,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
