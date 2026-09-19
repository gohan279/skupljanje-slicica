import React, { useRef } from "react";

import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Share,
} from "react-native";

import QRCode from "react-native-qrcode-svg";

import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppBackground from "../src/AppBackground";
import BottomNavigation from "../src/BottomNavigation";

import { useCollection } from "../src/CollectionContext";

import {
  createSharePayload,
  getMissingStickers,
  getDuplicateStickerNumbers,
} from "../src/stickers";

export default function ShareScreen() {
  const { selectedAlbum } = useCollection();

  const qrRef = useRef(null);

  // ---------------------------------------------------------
  // SHARE COLLECTION AS TEXT
  // ---------------------------------------------------------

  async function shareAsText() {
    if (!selectedAlbum) {
      return;
    }

    const missing = getMissingStickers(selectedAlbum.ownedStickers || []);

    const duplicates = getDuplicateStickerNumbers(
      selectedAlbum.duplicates || {},
    );

    const missingText =
      missing.length > 0 ? missing.join(", ") : "Nemam sličica koje tražim.";

    const duplicatesText =
      duplicates.length > 0
        ? duplicates.join(", ")
        : "Nemam duplića za zamjenu.";

    const message = `Tražim: ${missingText}\n\n` + `Duplići: ${duplicatesText}`;

    try {
      await Share.share({
        message,
      });
    } catch (error) {
      console.error(error);

      Alert.alert("Greška", "Nije moguće podijeliti popis sličica.");
    }
  }

  // ---------------------------------------------------------
  // NO SELECTED ALBUM
  // ---------------------------------------------------------

  if (!selectedAlbum) {
    return (
      <AppBackground variant="green">
        <SafeAreaView style={styles.screen}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nije odabran album.</Text>
          </View>

          <BottomNavigation />
        </SafeAreaView>
      </AppBackground>
    );
  }

  // ---------------------------------------------------------
  // QR PAYLOAD
  // ---------------------------------------------------------

  const qrPayload = createSharePayload(selectedAlbum);

  // ---------------------------------------------------------
  // SHARE QR CODE
  // ---------------------------------------------------------

  function shareQrCode() {
    if (!qrRef.current) {
      return;
    }

    qrRef.current.toDataURL(async (data) => {
      try {
        const available = await Sharing.isAvailableAsync();

        if (!available) {
          Alert.alert(
            "Dijeljenje nije dostupno",
            "Dijeljenje nije dostupno na ovom uređaju.",
          );

          return;
        }

        const fileUri = FileSystem.cacheDirectory + "skupljanje-slicica-qr.png";

        await FileSystem.writeAsStringAsync(fileUri, data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        await Sharing.shareAsync(fileUri, {
          mimeType: "image/png",
          dialogTitle: "Podijeli album",
        });
      } catch (error) {
        console.error(error);

        Alert.alert("Greška", "QR kod nije moguće podijeliti.");
      }
    });
  }

  // ---------------------------------------------------------
  // SCREEN
  // ---------------------------------------------------------

  return (
    <AppBackground variant="green">
      <SafeAreaView style={styles.screen}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.albumName}>{selectedAlbum.name}</Text>

          {/* QR CARD */}
          <View style={styles.qrCard}>
            <View style={styles.qrContainer}>
              <QRCode
                value={qrPayload}
                size={220}
                backgroundColor="#ffffff"
                color="#111111"
                getRef={(ref) => {
                  qrRef.current = ref;
                }}
              />
            </View>

            <Text style={styles.scanText}>
              Neka drugi korisnik skenira ovaj QR kod za usporedbu kolekcija.
            </Text>
          </View>

          {/* SHARE QR BUTTON */}
          <Pressable style={styles.shareButton} onPress={shareQrCode}>
            <MaterialCommunityIcons name="qrcode" size={23} color="#ffffff" />

            <Text style={styles.shareButtonText}>Podijeli QR kod</Text>
          </Pressable>

          {/* SHARE TEXT BUTTON */}
          <Pressable style={styles.textShareButton} onPress={shareAsText}>
            <MaterialCommunityIcons
              name="format-list-numbered"
              size={23}
              color="#f47b20"
            />

            <Text style={styles.textShareButtonText}>Podijeli kao tekst</Text>
          </Pressable>
        </ScrollView>

        <BottomNavigation />
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },

  scrollView: {
    flex: 1,
  },

  container: {
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 30,

    // Dovoljno prostora da se zadnji gumb može
    // odscrollati iznad BottomNavigation bara.
    paddingBottom: 140,
  },

  albumName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 25,
  },

  // ---------------------------------------------------------
  // QR CARD
  // ---------------------------------------------------------

  qrCard: {
    width: "100%",
    maxWidth: 380,

    backgroundColor: "#ffffff",

    borderRadius: 24,

    alignItems: "center",

    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 25,

    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 7,
  },

  qrContainer: {
    backgroundColor: "#ffffff",

    borderRadius: 18,

    padding: 16,

    borderWidth: 1,
    borderColor: "#eeeeee",
  },

  scanText: {
    marginTop: 23,

    fontSize: 15,
    lineHeight: 22,

    color: "#555555",

    textAlign: "center",

    fontWeight: "500",
  },

  // ---------------------------------------------------------
  // QR SHARE BUTTON
  // ---------------------------------------------------------

  shareButton: {
    width: "100%",
    maxWidth: 380,

    marginTop: 20,

    backgroundColor: "#f47b20",

    borderRadius: 16,

    paddingVertical: 15,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    gap: 9,

    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  shareButtonText: {
    color: "#ffffff",

    fontSize: 17,

    fontWeight: "800",
  },

  // ---------------------------------------------------------
  // TEXT SHARE BUTTON
  // ---------------------------------------------------------

  textShareButton: {
    width: "100%",
    maxWidth: 380,

    marginTop: 12,

    backgroundColor: "#ffffff",

    borderWidth: 2,
    borderColor: "#f47b20",

    borderRadius: 16,

    paddingVertical: 14,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    gap: 9,

    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  textShareButtonText: {
    color: "#f47b20",

    fontSize: 17,

    fontWeight: "800",
  },

  // ---------------------------------------------------------
  // EMPTY STATE
  // ---------------------------------------------------------

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",

    paddingBottom: 90,
  },

  emptyText: {
    color: "#ffffff",

    fontSize: 17,

    fontWeight: "700",
  },
});
