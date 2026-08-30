import React from "react";

import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import Svg, { Line, Polygon } from "react-native-svg";

import { useCollection } from "../src/CollectionContext";

import AppBackground from "../src/AppBackground";

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

function DuplicatePair({ first, second, duplicates, onCycle }) {
  const firstCount = Number(duplicates[first] || 0);

  const secondCount = second !== null ? Number(duplicates[second] || 0) : 0;

  const firstSelected = firstCount > 0;

  const secondSelected = secondCount > 0;

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
          style={[styles.firstNumber, firstSelected && styles.selectedNumber]}
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

function DuplicateGrid({ pairs, duplicates, onCycle }) {
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
    cycleDuplicate,
    duplicateCount,
    selectAllDuplicates,
    clearAllDuplicates,
  } = useCollection();

  const allSelected = Array.from(
    { length: 250 },
    (_, index) => index + 1,
  ).every((number) => Number(duplicates[number] || 0) > 0);

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
    <AppBackground>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
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

        <Pressable
          style={styles.selectAllRow}
          onPress={() => {
            if (allSelected) {
              clearAllDuplicates();
            } else {
              selectAllDuplicates();
            }
          }}
        >
          <View
            style={[styles.checkbox, allSelected && styles.checkboxChecked]}
          >
            {allSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>

          <Text style={styles.selectAllText}>Odaberi sve</Text>
        </Pressable>

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
                onCycle={cycleDuplicate}
              />
            </View>
          );
        })}
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },

  content: {
    padding: 10,
    paddingBottom: 50,
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

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },

  sectionRange: {
    fontSize: 13,
    color: "#777",
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
