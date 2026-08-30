import React, { useState } from "react";

import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { CameraView, useCameraPermissions } from "expo-camera";

import { useRouter } from "expo-router";

import { parseSharePayload } from "../src/stickers";

export default function ScanScreen() {
  const router = useRouter();

  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);

  /*
    Expo is still checking
    camera permission.
  */
  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Provjera dopuštenja za kameru...</Text>
      </View>
    );
  }

  /*
    Camera permission
    has not been granted.
  */
  if (!permission.granted) {
    return (
      <View style={styles.permissionScreen}>
        <Text style={styles.permissionTitle}>
          Potrebno je dopuštenje za kameru
        </Text>

        <Text style={styles.permissionText}>
          Aplikacija treba pristup kameri kako bi mogla skenirati QR kod drugog
          kolekcionara.
        </Text>

        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Dopusti kameru</Text>
        </Pressable>
      </View>
    );
  }

  function handleBarcodeScanned({ data }) {
    /*
      Prevent multiple scans of
      the same QR.
    */
    if (scanned) {
      return;
    }

    setScanned(true);

    try {
      /*
        Make sure this is one of
        our application's QR codes.
      */
      const sharedCollection = parseSharePayload(data);

      /*
        Send the decoded collection
        to the comparison screen.

        Expo Router parameters should
        be strings, so convert the
        object back to JSON.
      */
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
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Dark overlay */}

      <View style={styles.overlay} pointerEvents="none">
        <Text style={styles.title}>Skeniraj QR Kod</Text>

        <Text style={styles.instructions}>
          Usmjeri kameru prema QR kodu drugog kolekcionara.
        </Text>

        {/* Visual scanning frame */}

        <View style={styles.scanFrame} />

        <Text style={styles.bottomText}>
          Usporedba će se pokrenuti automatski.
        </Text>
      </View>
    </View>
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
  },

  permissionScreen: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    padding: 30,

    backgroundColor: "#f4f4f4",
  },

  permissionTitle: {
    fontSize: 23,

    fontWeight: "bold",

    color: "#222",

    marginBottom: 12,

    textAlign: "center",
  },

  permissionText: {
    fontSize: 15,

    color: "#666",

    lineHeight: 21,

    textAlign: "center",

    marginBottom: 25,
  },

  permissionButton: {
    backgroundColor: "#2e7d4f",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 10,
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
