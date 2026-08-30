import React, { useMemo } from "react";

import { ScrollView, StyleSheet, Text, View } from "react-native";

import QRCode from "react-native-qrcode-svg";

import { useCollection } from "../src/CollectionContext";

import {
  createSharePayload,
  getDuplicateStickerNumbers,
  getMissingStickers,
  groupBySection,
} from "../src/stickers";

import AppBackground from "../src/AppBackground";

function StickerList({ title, numbers }) {
  return (
    <View style={styles.listCard}>
      <Text style={styles.listTitle}>{title}</Text>

      <Text style={styles.listText}>
        {numbers.length > 0 ? numbers.join(", ") : "Nema"}
      </Text>
    </View>
  );
}

export default function ShareScreen() {
  const { selectedAlbum } = useCollection();

  const missing = useMemo(
    () =>
      selectedAlbum
        ? getMissingStickers(selectedAlbum.ownedStickers || [])
        : [],

    [selectedAlbum],
  );

  const duplicateNumbers = useMemo(
    () =>
      selectedAlbum
        ? getDuplicateStickerNumbers(selectedAlbum.duplicates || {})
        : [],

    [selectedAlbum],
  );

  const payload = useMemo(
    () => (selectedAlbum ? createSharePayload(selectedAlbum) : ""),

    [selectedAlbum],
  );

  const missingBySection = groupBySection(missing);

  const duplicatesBySection = groupBySection(duplicateNumbers);

  if (!selectedAlbum) {
    return (
      <View style={styles.emptyScreen}>
        <Text>Nije odabran album.</Text>
      </View>
    );
  }

  return (
    <AppBackground>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.albumName}>{selectedAlbum.name}</Text>

        {/* QR */}

        <View style={styles.qrContainer}>
          <QRCode
            value={payload}
            size={260}
            backgroundColor="#ffffff"
            color="#111111"
          />
        </View>

        {/* Summary */}

        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{missing.length}</Text>

            <Text style={styles.summaryLabel}>Nedostaju</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{duplicateNumbers.length}</Text>

            <Text style={styles.summaryLabel}>Duplići</Text>
          </View>
        </View>

        <Text style={styles.heading}>Nedostaju</Text>

        <StickerList title="Sekcija 1 · 1–80" numbers={missingBySection[1]} />

        <StickerList title="Sekcija 2 · 81–160" numbers={missingBySection[2]} />

        <StickerList
          title="Sekcija 3 · 161–250"
          numbers={missingBySection[3]}
        />

        <Text style={styles.heading}>Duplići</Text>

        <StickerList
          title="Sekcija 1 · 1–80"
          numbers={duplicatesBySection[1]}
        />

        <StickerList
          title="Sekcija 2 · 81–160"
          numbers={duplicatesBySection[2]}
        />

        <StickerList
          title="Sekcija 3 · 161–250"
          numbers={duplicatesBySection[3]}
        />

        <View style={styles.privacyCard}>
          <Text style={styles.privacyTitle}>Što sadrži ovaj QR kod?</Text>

          <Text style={styles.privacyText}>
            Samo naziv odabranog albuma te brojeve sličica koje nedostaju i
            brojeve duplih sličica.
          </Text>

          <Text style={styles.privacyText}>
            Ne sadrži e-mail adresu, broj telefona, lokaciju niti podatke
            korisničkog računa.
          </Text>
        </View>
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
    padding: 18,

    paddingBottom: 50,

    alignItems: "stretch",
  },

  emptyScreen: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",
  },

  albumName: {
    fontSize: 24,

    fontWeight: "bold",

    textAlign: "center",

    color: "#222",

    marginBottom: 8,
  },

  qrContainer: {
    alignSelf: "center",

    backgroundColor: "#ffffff",

    padding: 18,

    borderRadius: 16,

    marginBottom: 22,
  },

  summary: {
    flexDirection: "row",

    backgroundColor: "#ffffff",

    borderRadius: 14,

    paddingVertical: 15,

    marginBottom: 25,
  },

  summaryItem: {
    flex: 1,

    alignItems: "center",
  },

  summaryNumber: {
    fontSize: 25,

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

  heading: {
    fontSize: 20,

    fontWeight: "bold",

    color: "#222",

    marginBottom: 10,

    marginTop: 5,
  },

  listCard: {
    backgroundColor: "#ffffff",

    borderRadius: 12,

    padding: 14,

    marginBottom: 10,
  },

  listTitle: {
    fontSize: 15,

    fontWeight: "bold",

    color: "#333",

    marginBottom: 7,
  },

  listText: {
    fontSize: 14,

    color: "#555",

    lineHeight: 21,
  },

  privacyCard: {
    backgroundColor: "#e9f5ed",

    borderRadius: 14,

    padding: 15,

    marginTop: 15,
  },

  privacyTitle: {
    fontSize: 15,

    fontWeight: "bold",

    color: "#24653f",

    marginBottom: 7,
  },

  privacyText: {
    fontSize: 13,

    color: "#43634f",

    lineHeight: 19,

    marginBottom: 3,
  },
});
