import { useState } from "react";

import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Svg, { Line, Polygon } from "react-native-svg";

import { useCollection } from "../src/CollectionContext";

import AppBackground from "../src/AppBackground";

import BottomNavigation from "../src/BottomNavigation";

const SECTIONS = [
  {
    id: 1,
    range: "1 – 80",
    start: 1,
    end: 80,
  },
  {
    id: 2,
    range: "81 – 160",
    start: 81,
    end: 160,
  },
  {
    id: 3,
    range: "161 – 250",
    start: 161,
    end: 250,
  },
];

const PAIRS_PER_ROW = 5;

function DuplicatePair({ first, second, duplicates, ownedStickers, onCycle }) {
  const firstCount = Number(duplicates[first] || 0);

  const secondCount = second !== null ? Number(duplicates[second] || 0) : 0;

  const firstSelected = firstCount > 0;
  const secondSelected = secondCount > 0;

  const firstOwned = ownedStickers.includes(first);

  const secondOwned = second !== null ? ownedStickers.includes(second) : false;

  return (
    <View style={styles.pairTile}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 80"
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        {/* Upper-left */}
        <Polygon
          points="0,0 100,0 0,80"
          fill={firstSelected ? "#d9822b" : "#ffffff"}
        />

        {/* Lower-right */}
        <Polygon
          points="100,0 100,80 0,80"
          fill={secondSelected ? "#d9822b" : "#ffffff"}
        />

        {/* Border */}
        <Polygon
          points="0,0 100,0 100,80 0,80"
          fill="none"
          stroke="#aaaaaa"
          strokeWidth="1"
        />

        {/* Diagonal */}
        <Line x1="0" y1="80" x2="100" y2="0" stroke="#aaaaaa" strokeWidth="1" />
      </Svg>

      {/* Upper-left duplicate */}
      <Pressable style={styles.firstPressArea} onPress={() => onCycle(first)}>
        <Text
          style={[
            styles.firstNumber,
            firstSelected && styles.selectedNumber,
            !firstOwned && styles.notOwnedNumber,
          ]}
        >
          {first}
        </Text>

        {firstCount > 0 && <Text style={styles.firstCount}>×{firstCount}</Text>}
      </Pressable>

      {/* Lower-right duplicate */}
      {second !== null && (
        <Pressable
          style={styles.secondPressArea}
          onPress={() => onCycle(second)}
        >
          <Text
            style={[
              styles.secondNumber,
              secondSelected && styles.selectedNumber,
              !secondOwned && styles.notOwnedNumber,
            ]}
          >
            {second}
          </Text>

          {secondCount > 0 && (
            <Text style={styles.secondCount}>×{secondCount}</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

function DuplicateGrid({ pairs, duplicates, ownedStickers, onCycle }) {
  const rows = [];

  for (let i = 0; i < pairs.length; i += PAIRS_PER_ROW) {
    rows.push(pairs.slice(i, i + PAIRS_PER_ROW));
  }

  return (
    <View style={styles.grid}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.gridRow}>
          {row.map((pair) => (
            <DuplicatePair
              key={pair.first}
              first={pair.first}
              second={pair.second}
              duplicates={duplicates}
              ownedStickers={ownedStickers}
              onCycle={onCycle}
            />
          ))}

          {Array.from({
            length: PAIRS_PER_ROW - row.length,
          }).map((_, index) => (
            <View key={`empty-${index}`} style={styles.emptyTile} />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function DuplicatesScreen() {
  const {
    duplicates,
    ownedStickers,
    setDuplicateQuantity,
    duplicateCount,
    selectAllDuplicates,
    clearAllDuplicates,
  } = useCollection();

  /*
    "All selected" now means:
    every sticker that exists in
    "Moje sličice" has at least
    one duplicate.

    Stickers that are not owned
    are ignored.
  */
  const allSelected =
    ownedStickers.length > 0 &&
    ownedStickers.every((number) => Number(duplicates[number] || 0) > 0);

  /*
    Handle one duplicate press.

    cycleDuplicate returns false
    when the sticker is not owned.
  */
  const [editingNumber, setEditingNumber] = useState(null);
  const [quantityText, setQuantityText] = useState("0");

  function handleCycleDuplicate(number) {
    if (!ownedStickers.includes(number)) {
      Alert.alert(
        "Sličica nije u albumu",
        `Sličica ${number} nije označena kao sakupljena.\n\nPrvo je označite u "Moje sličice".`,
      );
      return;
    }
    setEditingNumber(number);
    setQuantityText(String(duplicates[number] || 0));
  }

  function adjustQuantity(delta) {
    const current = Number.parseInt(quantityText, 10) || 0;
    setQuantityText(String(Math.max(0, Math.min(100, current + delta))));
  }

  function saveQuantity() {
    const value = Number(quantityText);
    if (
      !/^\d+$/.test(quantityText) ||
      !Number.isInteger(value) ||
      value < 0 ||
      value > 100
    ) {
      Alert.alert("Neispravna količina", "Unesite cijeli broj od 0 do 100.");
      return;
    }
    setDuplicateQuantity(editingNumber, value);
    setEditingNumber(null);
  }

  function handleSelectAll() {
    if (ownedStickers.length === 0) {
      Alert.alert(
        "Nema sličica u albumu",
        'Prvo označite sličice koje posjedujete u "Moje sličice".',
        [
          {
            text: "U redu",
          },
        ],
      );

      return;
    }

    if (allSelected) {
      clearAllDuplicates();
    } else {
      selectAllDuplicates();
    }
  }

  function createPairs(section) {
    const pairs = [];

    for (let number = section.start; number <= section.end; number += 2) {
      pairs.push({
        first: number,

        second: number + 1 <= section.end ? number + 1 : null,
      });
    }

    return pairs;
  }

  const differentDuplicateStickers = Object.values(duplicates).filter(
    (count) => Number(count) > 0,
  ).length;

  return (
    <AppBackground variant="green">
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {/* SUMMARY */}
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {differentDuplicateStickers}
            </Text>

            <Text style={styles.summaryLabel}>Vrste duplića</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{duplicateCount}</Text>

            <Text style={styles.summaryLabel}>Ukupno duplića</Text>
          </View>
        </View>

        {/* SELECT ALL */}
        <Pressable style={styles.selectAllRow} onPress={handleSelectAll}>
          <View
            style={[styles.checkbox, allSelected && styles.checkboxChecked]}
          >
            {allSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>

          <Text style={styles.selectAllText}>
            {allSelected ? "Poništi sve" : "Odaberi sve"}
          </Text>
        </Pressable>

        {/* SECTIONS */}
        {SECTIONS.map((section) => {
          const pairs = createPairs(section);

          return (
            <View key={section.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionRange}>{section.range}</Text>
              </View>

              <DuplicateGrid
                pairs={pairs}
                duplicates={duplicates}
                ownedStickers={ownedStickers}
                onCycle={handleCycleDuplicate}
              />
            </View>
          );
        })}
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={editingNumber !== null}
        onRequestClose={() => setEditingNumber(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Duplići – sličica {editingNumber}
            </Text>
            <View style={styles.quantityRow}>
              <Pressable
                style={styles.stepButton}
                onPress={() => adjustQuantity(-1)}
              >
                <Text style={styles.stepText}>−</Text>
              </Pressable>
              <TextInput
                style={styles.quantityInput}
                keyboardType="number-pad"
                maxLength={3}
                selectTextOnFocus
                value={quantityText}
                onChangeText={setQuantityText}
              />
              <Pressable
                style={styles.stepButton}
                onPress={() => adjustQuantity(1)}
              >
                <Text style={styles.stepText}>+</Text>
              </Pressable>
            </View>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelModal}
                onPress={() => setEditingNumber(null)}
              >
                <Text style={styles.cancelText}>Odustani</Text>
              </Pressable>
              <Pressable style={styles.saveModal} onPress={saveQuantity}>
                <Text style={styles.saveText}>Spremi</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <BottomNavigation />
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 25,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#222",
    marginBottom: 22,
  },
  quantityRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  stepButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#f47b20",
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { color: "#fff", fontSize: 30, fontWeight: "700" },
  quantityInput: {
    width: 85,
    height: 55,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 13,
    textAlign: "center",
    fontSize: 24,
    color: "#222",
  },
  rangeText: { color: "#777", marginTop: 12, marginBottom: 24 },
  modalActions: { flexDirection: "row", gap: 12, width: "100%", marginTop: 24 },
  cancelModal: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
  },
  saveModal: {
    flex: 1,
    padding: 14,
    backgroundColor: "#2e9f57",
    borderRadius: 12,
  },
  cancelText: { textAlign: "center", color: "#555", fontWeight: "700" },
  saveText: { textAlign: "center", color: "#fff", fontWeight: "800" },
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },

  content: {
    padding: 10,
    paddingBottom: 110,
  },

  summary: {
    backgroundColor: "#ffffff",

    borderRadius: 14,

    paddingVertical: 14,

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 20,
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
  },

  summaryNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
  },

  summaryLabel: {
    marginTop: 3,
    fontSize: 13,
    color: "#777",
  },

  divider: {
    width: 1,
    height: 40,
    backgroundColor: "#dddddd",
  },

  section: {
    backgroundColor: "#ffffff",

    borderRadius: 14,

    padding: 10,

    marginBottom: 18,
  },

  sectionHeader: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 12,
  },

  sectionRange: {
    fontSize: 13,
    color: "#2e7d4f",
    fontWeight: "700",
  },

  grid: {
    width: "100%",
  },

  gridRow: {
    width: "100%",

    flexDirection: "row",

    columnGap: 2,

    marginBottom: 2,
  },

  pairTile: {
    flex: 1,

    aspectRatio: 1.25,

    position: "relative",

    backgroundColor: "#ffffff",

    minWidth: 0,
  },

  emptyTile: {
    flex: 1,

    aspectRatio: 1.25,

    minWidth: 0,
  },

  firstPressArea: {
    position: "absolute",

    top: 0,
    left: 0,

    width: "58%",
    height: "58%",

    zIndex: 20,

    justifyContent: "flex-start",

    alignItems: "flex-start",

    paddingTop: 2,
    paddingLeft: 3,
  },

  secondPressArea: {
    position: "absolute",

    right: 0,
    bottom: 0,

    width: "58%",
    height: "58%",

    zIndex: 20,

    justifyContent: "flex-end",

    alignItems: "flex-end",

    paddingRight: 3,
    paddingBottom: 2,
  },

  firstNumber: {
    fontSize: 13,
    fontWeight: "700",
    color: "#222",
  },

  secondNumber: {
    fontSize: 13,
    fontWeight: "700",
    color: "#222",
  },

  selectedNumber: {
    color: "#ffffff",
  },

  /*
    Stickers that are not owned are
    slightly lighter on the duplicates
    screen.

    They can still be pressed, but
    pressing them displays the warning.
  */
  notOwnedNumber: {
    color: "#999999",
  },

  firstCount: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: -1,
  },

  secondCount: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: -1,
  },

  selectAllRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingLeft: 4,
  },

  checkbox: {
    width: 24,
    height: 24,

    borderWidth: 2,
    borderColor: "#777",

    borderRadius: 4,

    backgroundColor: "#ffffff",

    justifyContent: "center",
    alignItems: "center",
  },

  checkboxChecked: {
    backgroundColor: "#d9822b",
    borderColor: "#d9822b",
  },

  checkmark: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "bold",
    lineHeight: 19,
  },

  selectAllText: {
    marginLeft: 9,

    fontSize: 15,
    fontWeight: "600",

    color: "#333",
  },
});
