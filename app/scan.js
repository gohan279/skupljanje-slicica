import React, { useState } from "react";

import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { CameraView, useCameraPermissions } from "expo-camera";

import { useRouter } from "expo-router";

import { parseSharePayload } from "../src/stickers";

import AppBackground from "../src/AppBackground";

import BottomNavigation from "../src/BottomNavigation";

export default function ScanScreen() {
  const router = useRouter();

  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return (
      <AppBackground variant="green">
        <View style={styles.center}>
          <Text style={styles.loadingText}>
            Provjera dopuštenja za kameru...
          </Text>

          <BottomNavigation />
        </View>
      </AppBackground>
    );
  }

  if (!permission.granted) {
    return (
      <AppBackground variant="green">
        <View style={styles.permissionScreen}>
          <View style={styles.permissionCard}>
            <Text style={styles.permissionTitle}>
              Potrebno je dopuštenje za kameru
            </Text>

            <Text style={styles.permissionText}>
              Aplikacija treba pristup kameri kako bi mogla skenirati QR kod
              drugog kolekcionara.
            </Text>

            <Pressable
              style={styles.permissionButton}
              onPress={requestPermission}
            >
              <Text style={styles.permissionButtonText}>Dopusti kameru</Text>
            </Pressable>
          </View>

          <BottomNavigation />
        </View>
      </AppBackground>
    );
  }

  function handleBarcodeScanned({ data }) {
    if (scanned) {
      return;
    }

    setScanned(true);

    try {
      const sharedCollection = parseSharePayload(data);

      router.replace({
        pathname: "/compare",

        params: {
          shared: JSON.stringify(sharedCollection),
        },
      });
    } catch {
      Alert.alert(
        "Neispravan QR kod",
        "Ovaj QR kod ne sadrži podatke iz aplikacije Skupljanje Sličica.",
        [
          {
            text: "Skeniraj ponovno",
            onPress: () => setScanned(false),
          },
        ],
      );
    }
  }

  return (
    <AppBackground variant="green">
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />

        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.title}>Skeniraj QR kod</Text>

          <Text style={styles.instructions}>
            Usmjeri kameru prema QR kodu drugog kolekcionara.
          </Text>

          <View style={styles.scanFrame} />

          <Text style={styles.bottomText}>
            Usporedba će se pokrenuti automatski.
          </Text>
        </View>

        <BottomNavigation />
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 90,
  },

  loadingText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  permissionScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 100,
  },

  permissionCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 24,

    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  permissionTitle: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#222222",
    marginBottom: 12,
    textAlign: "center",
  },

  permissionText: {
    fontSize: 15,
    color: "#666666",
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 25,
  },

  permissionButton: {
    backgroundColor: "#2e9f57",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 12,
    alignSelf: "center",
  },

  permissionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,

    alignItems: "center",

    paddingTop: 60,
    paddingHorizontal: 25,
    paddingBottom: 100,
  },

  title: {
    color: "#ffffff",
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
  },

  instructions: {
    color: "#ffffff",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },

  scanFrame: {
    width: 270,
    height: 270,
    borderWidth: 3,
    borderColor: "#ffffff",
    borderRadius: 20,
    marginTop: 50,
  },

  bottomText: {
    color: "#ffffff",
    fontSize: 13,
    textAlign: "center",
    marginTop: 35,
  },
});
