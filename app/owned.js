import React from "react";

import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import Svg, { Line, Polygon } from "react-native-svg";

import { useCollection } from "../src/CollectionContext";

import AppBackground from "../src/AppBackground";

const SECTIONS = [
  {
    id: 1,
    title: "",
    range: "1 – 80",
    start: 1,
    end: 80,
  },
  {
    id: 2,
    title: "",
    range: "81 – 160",
    start: 81,
    end: 160,
  },
  {
    id: 3,
    title: "",
    range: "161 – 250",
    start: 161,
    end: 250,
  },
];

const PAIRS_PER_ROW = 5;

/*
  One visual tile contains two stickers.

  Example:

  upper-left = 1
  lower-right = 2

  next tile:
  upper-left = 3
  lower-right = 4
*/
function StickerPair({ first, second, ownedStickers, onToggle }) {
  const firstSelected = first !== null && ownedStickers.includes(first);

  const secondSelected = second !== null && ownedStickers.includes(second);

  return (
    <View style={styles.pairTile}>
      {/* Visual diagonal tile */}
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 80"
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        {/* Upper-left triangle */}
        <Polygon
          points="0,0 100,0 0,80"
          fill={firstSelected ? "#2e9f57" : "#ffffff"}
        />

        {/* Lower-right triangle */}
        <Polygon
          points="100,0 100,80 0,80"
          fill={secondSelected ? "#2e9f57" : "#ffffff"}
        />

        {/* Outer border */}
        <Polygon
          points="0,0 100,0 100,80 0,80"
          fill="none"
          stroke="#aaaaaa"
          strokeWidth="1"
        />

        {/* Diagonal */}
        <Line x1="0" y1="80" x2="100" y2="0" stroke="#aaaaaa" strokeWidth="1" />
      </Svg>

      {/* Upper-left sticker button */}
      {first !== null && (
        <Pressable
          style={styles.firstPressArea}
          onPress={() => onToggle(first)}
        >
          <Text
            style={[styles.firstNumber, firstSelected && styles.selectedNumber]}
          >
            {first}
          </Text>
        </Pressable>
      )}

      {/* Lower-right sticker button */}
      {second !== null && (
        <Pressable
          style={styles.secondPressArea}
          onPress={() => onToggle(second)}
        >
          <Text
            style={[
              styles.secondNumber,

              secondSelected && styles.selectedNumber,
            ]}
          >
            {second}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function StickerGrid({ pairs, ownedStickers, onToggle }) {
  const rows = [];

  for (let i = 0; i < pairs.length; i += PAIRS_PER_ROW) {
    rows.push(pairs.slice(i, i + PAIRS_PER_ROW));
  }

  return (
    <View style={styles.grid}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.gridRow}>
          {row.map((pair) => (
            <StickerPair
              key={pair.first}
              first={pair.first}
              second={pair.second}
              ownedStickers={ownedStickers}
              onToggle={onToggle}
            />
          ))}

          {/*
              Section 3 last row:

              241–250

              That's only 5 tiles.

              Add 5 invisible spacer tiles
              so the existing five stay the
              same size as every other row.
            */}

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

export default function OwnedScreen() {
  const {
    ownedStickers,
    toggleOwnedSticker,
    ownedCount,
    missingCount,
    selectAllOwned,
    clearAllOwned,
  } = useCollection();

  const allSelected = ownedStickers.length === 250;

  /*
    Convert:

    1,2,3,4,5,6...

    into:

    { first: 1, second: 2 }
    { first: 3, second: 4 }
    { first: 5, second: 6 }
  */
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

  return (
    <AppBackground>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {/* Collection summary */}

        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{ownedCount}</Text>

            <Text style={styles.summaryLabel}>Posjedujem</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{missingCount}</Text>

            <Text style={styles.summaryLabel}>Nedostaju</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>250</Text>

            <Text style={styles.summaryLabel}>Ukupno</Text>
          </View>
        </View>

        <Pressable
          style={styles.selectAllRow}
          onPress={() => {
            if (allSelected) {
              clearAllOwned();
            } else {
              selectAllOwned();
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

        {/* Sticker sections */}

        {SECTIONS.map((section) => {
          const pairs = createPairs(section);

          return (
            <View key={section.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>

                <Text style={styles.sectionRange}>{section.range}</Text>
              </View>

              <StickerGrid
                pairs={pairs}
                ownedStickers={ownedStickers}
                onToggle={toggleOwnedSticker}
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

  /*
      Summary
    */

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

  /*
      Sections
    */

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

  /*
      Sticker grid
    */

  grid: {
    width: "100%",
  },

  /*
      Important:

      Every row contains exactly
      ten children.

      Each child gets flex: 1.

      Therefore every row always has
      exactly ten equal-width tiles.
    */

  gridRow: {
    width: "100%",

    flexDirection: "row",

    columnGap: 2,

    marginBottom: 2,
  },

  /*
      One pair tile.

      aspectRatio 1.25 gives us
      a rectangle similar to the
      physical sticker album layout.
    */

  pairTile: {
    flex: 1,

    aspectRatio: 1.25,

    position: "relative",

    backgroundColor: "#ffffff",

    minWidth: 0,
  },

  /*
      Invisible placeholders used
      only for the last row of
      Section 3.
    */

  emptyTile: {
    flex: 1,

    aspectRatio: 1.25,

    minWidth: 0,
  },

  /*
      Upper-left button.

      We intentionally position the
      touch zone near the upper-left
      number.

      Tapping 1 toggles sticker 1.
      Tapping 3 toggles sticker 3.
      etc.
    */

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

  /*
      Lower-right button.

      Tapping 2 toggles sticker 2.
      Tapping 4 toggles sticker 4.
      etc.
    */

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

  /*
      Numbers
    */

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
    backgroundColor: "#2e9f57",
    borderColor: "#2e9f57",
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
