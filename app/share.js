import React, { useRef } from "react";

import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import QRCode from "react-native-qrcode-svg";

import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppBackground from "../src/AppBackground";

import BottomNavigation from "../src/BottomNavigation";

import { useCollection } from "../src/CollectionContext";

import { createSharePayload } from "../src/stickers";

export default function ShareScreen() {
  const { selectedAlbum } = useCollection();

  const qrRef = useRef(null);

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

  const qrPayload = createSharePayload(selectedAlbum);

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

  return (
    <AppBackground variant="green">
      <SafeAreaView style={styles.screen}>
        <View style={styles.container}>
          <Text style={styles.title}>Podijeli album</Text>

          <Text style={styles.albumName}>{selectedAlbum.name}</Text>

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

          <Pressable style={styles.shareButton} onPress={shareQrCode}>
            <MaterialCommunityIcons
              name="share-variant"
              size={23}
              color="#ffffff"
            />

            <Text style={styles.shareButtonText}>Podijeli</Text>
          </Pressable>
        </View>

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

  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 100,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#ffffff",
    textAlign: "center",
  },

  albumName: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
    marginTop: 5,
    marginBottom: 25,
  },

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
