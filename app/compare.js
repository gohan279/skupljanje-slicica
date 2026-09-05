import React, { useMemo, useState } from "react";

import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { useLocalSearchParams } from "expo-router";

import { useCollection } from "../src/CollectionContext";

import {
  getDuplicateStickerNumbers,
  getMissingStickers,
  groupBySection,
  sectionForSticker,
} from "../src/stickers";

import AppBackground from "../src/AppBackground";

import BottomNavigation from "../src/BottomNavigation";

function TradeList({ title, numbers, emptyText }) {
  return (
    <View style={styles.tradeCard}>
      <Text style={styles.tradeTitle}>{title}</Text>

      {numbers.length > 0 ? (
        <View style={styles.numberContainer}>
          {numbers.map((number) => (
            <View key={number} style={styles.numberBadge}>
              <Text style={styles.numberText}>{number}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>{emptyText}</Text>
      )}
    </View>
  );
}

export default function CompareScreen() {
  const params = useLocalSearchParams();

  const { selectedAlbum } = useCollection();

  /*
    Default is OFF.

    OFF:
    show all useful trades together.

    ON:
    show only same-section trades
    divided into sections.
  */
  const [sameSectionOnly, setSameSectionOnly] = useState(false);

  /*
    Read QR comparison data.
  */
  const sharedCollection = useMemo(() => {
    try {
      if (!params.shared) {
        return null;
      }

      const raw = Array.isArray(params.shared)
        ? params.shared[0]
        : params.shared;

      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, [params.shared]);

  /*
    Calculate ALL possible trades
    without section filtering.
  */
  const allTrades = useMemo(() => {
    if (!selectedAlbum || !sharedCollection) {
      return null;
    }

    const myMissing = getMissingStickers(selectedAlbum.ownedStickers || []);

    const myDuplicates = getDuplicateStickerNumbers(
      selectedAlbum.duplicates || {},
    );

    const theirMissing = sharedCollection.missing || [];

    const theirDuplicates = sharedCollection.duplicates || [];

    /*
        My duplicate stickers
        that they are missing.
      */
    const iCanGive = myDuplicates.filter((number) =>
      theirMissing.includes(number),
    );

    /*
        Their duplicate stickers
        that I am missing.
      */
    const theyCanGive = theirDuplicates.filter((number) =>
      myMissing.includes(number),
    );

    return {
      iCanGive,
      theyCanGive,
    };
  }, [selectedAlbum, sharedCollection]);

  /*
    Same-section version.

    Only sections where BOTH users
    have something useful for each
    other are retained.
  */
  const sectionTrades = useMemo(() => {
    if (!allTrades) {
      return null;
    }

    const myTradeSections = new Set(allTrades.iCanGive.map(sectionForSticker));

    const theirTradeSections = new Set(
      allTrades.theyCanGive.map(sectionForSticker),
    );

    /*
        Find sections that exist
        on both sides.
      */
    const commonSections = new Set(
      [...myTradeSections].filter((section) => theirTradeSections.has(section)),
    );

    /*
        Keep only trades belonging
        to those common sections.
      */
    const iCanGive = allTrades.iCanGive.filter((number) =>
      commonSections.has(sectionForSticker(number)),
    );

    const theyCanGive = allTrades.theyCanGive.filter((number) =>
      commonSections.has(sectionForSticker(number)),
    );

    return {
      iCanGive,

      theyCanGive,

      giveBySection: groupBySection(iCanGive),

      receiveBySection: groupBySection(theyCanGive),
    };
  }, [allTrades]);

  if (!selectedAlbum || !sharedCollection || !allTrades || !sectionTrades) {
    return (
      <AppBackground variant="green">
        <View style={styles.errorScreen}>
          <Text style={styles.errorText}>
            Nije moguće učitati podatke za usporedbu kolekcija.
          </Text>

          <BottomNavigation />
        </View>
      </AppBackground>
    );
  }

  const sections = [
    {
      id: 1,
      title: "Sekcija 1",
      range: "1–80",
    },

    {
      id: 2,
      title: "Sekcija 2",
      range: "81–160",
    },

    {
      id: 3,
      title: "Sekcija 3",
      range: "161–250",
    },
  ];

  /*
    Totals depend on the switch.

    OFF:
    count every useful trade.

    ON:
    count only same-section trades.
  */
  const displayedGive = sameSectionOnly
    ? sectionTrades.iCanGive
    : allTrades.iCanGive;

  const displayedReceive = sameSectionOnly
    ? sectionTrades.theyCanGive
    : allTrades.theyCanGive;

  return (
    <AppBackground variant="green">
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Razmjena</Text>

        <Text style={styles.albumComparison}>{selectedAlbum.name}</Text>

        <Text style={styles.arrow}>↕</Text>

        <Text style={styles.albumComparison}>{sharedCollection.albumName}</Text>

        {/* Same section switch */}

        <View style={styles.toggleCard}>
          <View style={styles.toggleText}>
            <Text style={styles.toggleTitle}>
              Zamjena sličica iz istih sekcija
            </Text>

            <Text style={styles.toggleDescription}>
              Prikaži razmjenu sličica po sekcijama.
            </Text>
          </View>

          <Switch value={sameSectionOnly} onValueChange={setSameSectionOnly} />
        </View>

        {/* Totals */}

        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{displayedGive.length}</Text>

            <Text style={styles.summaryLabel}>Možeš dati</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{displayedReceive.length}</Text>

            <Text style={styles.summaryLabel}>Mogu ti dati</Text>
          </View>
        </View>

        {/*
        SWITCH OFF

        Show only two overall lists.
        No Section 1 / 2 / 3 separation.
      */}

        {!sameSectionOnly && (
          <View>
            <TradeList
              title="Možeš dati"
              numbers={allTrades.iCanGive}
              emptyText="Ne postoje duplići za razmjenu."
            />

            <TradeList
              title="Mogu ti dati"
              numbers={allTrades.theyCanGive}
              emptyText="Ne postoje duplići za razmjenu."
            />
          </View>
        )}

        {/*
        SWITCH ON

        Show section-by-section trades.
      */}

        {sameSectionOnly && (
          <View>
            {sections
              .filter((section) => {
                const giveNumbers =
                  sectionTrades.giveBySection[section.id] || [];

                const receiveNumbers =
                  sectionTrades.receiveBySection[section.id] || [];

                return giveNumbers.length > 0 && receiveNumbers.length > 0;
              })
              .map((section) => {
                const giveNumbers =
                  sectionTrades.giveBySection[section.id] || [];

                const receiveNumbers =
                  sectionTrades.receiveBySection[section.id] || [];

                return (
                  <View key={section.id} style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>{section.title}</Text>

                      <Text style={styles.sectionRange}>{section.range}</Text>
                    </View>

                    <TradeList
                      title="Možeš dati"
                      numbers={giveNumbers}
                      emptyText="Nema duplića za zamjenu u ovoj sekciji."
                    />

                    <TradeList
                      title="Mogu ti dati"
                      numbers={receiveNumbers}
                      emptyText="Nemaju dupliće koje trebaš u ovoj sekciji."
                    />
                  </View>
                );
              })}
          </View>
        )}
      </ScrollView>
      <BottomNavigation />
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },

  content: {
    padding: 16,
    paddingBottom: 110,
  },

  errorScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  errorText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
  },

  heading: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 14,
  },

  albumComparison: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },

  arrow: {
    fontSize: 24,
    color: "#888",
    textAlign: "center",
    marginVertical: 2,
  },

  toggleCard: {
    backgroundColor: "#ffffff",

    borderRadius: 14,

    padding: 15,

    marginTop: 20,
    marginBottom: 18,

    flexDirection: "row",
    alignItems: "center",

    columnGap: 15,
  },

  toggleText: {
    flex: 1,
  },

  toggleTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
  },

  toggleDescription: {
    fontSize: 12,
    color: "#777",
    lineHeight: 17,
    marginTop: 4,
  },

  summary: {
    backgroundColor: "#ffffff",

    borderRadius: 14,

    paddingVertical: 15,

    flexDirection: "row",
    alignItems: "center",

    marginBottom: 20,
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
  },

  summaryNumber: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
  },

  summaryLabel: {
    fontSize: 13,
    color: "#777",
    marginTop: 3,
  },

  divider: {
    width: 1,
    height: 40,
    backgroundColor: "#dddddd",
  },

  section: {
    marginBottom: 20,
  },

  sectionHeader: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#222",
  },

  sectionRange: {
    fontSize: 13,
    color: "#777",
  },

  tradeCard: {
    backgroundColor: "#ffffff",

    borderRadius: 12,

    padding: 13,

    marginBottom: 10,
  },

  tradeTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },

  numberContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  numberBadge: {
    minWidth: 37,

    paddingVertical: 7,
    paddingHorizontal: 8,

    backgroundColor: "#e7f4eb",

    borderRadius: 8,

    alignItems: "center",
  },

  numberText: {
    color: "#23623d",
    fontWeight: "bold",
    fontSize: 14,
  },

  emptyText: {
    color: "#999",
    fontSize: 13,
    fontStyle: "italic",
  },
});
