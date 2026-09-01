import React from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Constants from "expo-constants";

import AppBackground from "../src/AppBackground";

export default function AboutScreen() {
  const appVersion = Constants.expoConfig?.version || "1.0.0";

  function openPrivacyPolicy() {
    Linking.openURL("https://gohan279.github.io/skupljanje-slicica-privacy/");
  }

  return (
    <AppBackground>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Skupljanje Sličica</Text>

        <Text style={styles.version}>Verzija {appVersion}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>O aplikaciji</Text>

          <Text style={styles.text}>
            Skupljanje Sličica je aplikacija za jednostavno praćenje kolekcije
            sličica albuma Životinjsko Carstvo.
          </Text>

          <Text style={styles.text}>
            Možeš pratiti koje sličice posjeduješ, koje ti nedostaju i koje
            dupliće imaš za razmjenu.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mogućnosti</Text>

          <Text style={styles.item}>• Praćenje sakupljenih sličica</Text>
          <Text style={styles.item}>
            • Automatski prikaz sličica koje nedostaju
          </Text>
          <Text style={styles.item}>• Evidencija duplih sličica</Text>
          <Text style={styles.item}>• Više različitih albuma</Text>
          <Text style={styles.item}>• Dijeljenje kolekcije QR kodom</Text>
          <Text style={styles.item}>
            • Usporedba duplića između kolekcionara
          </Text>
          <Text style={styles.item}>• Usporedba razmjene po sekcijama</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sekcije albuma</Text>

          <Text style={styles.item}>Sekcija 1: 1 – 80</Text>
          <Text style={styles.item}>Sekcija 2: 81 – 160</Text>
          <Text style={styles.item}>Sekcija 3: 161 – 250</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>QR razmjena</Text>

          <Text style={styles.text}>
            QR kod omogućuje drugom kolekcionaru usporedbu vlastite kolekcije s
            tvojom.
          </Text>

          <Text style={styles.text}>
            Nakon skeniranja aplikacija prikazuje koje sličice ti možeš ponuditi
            drugom kolekcionaru i koje sličice on može ponuditi tebi.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Privatnost i podaci</Text>

          <Text style={styles.text}>
            Podaci o albumima, sakupljenim sličicama i duplićima spremaju se
            lokalno na uređaju.
          </Text>

          <Text style={styles.text}>
            QR kod sadrži samo naziv odabranog albuma te podatke potrebne za
            usporedbu sličica.
          </Text>

          <Text style={styles.text}>
            Aplikacija ne sprema e-mail adresu, broj telefona ni lokaciju
            korisnika.
          </Text>

          <Pressable style={styles.privacyButton} onPress={openPrivacyPolicy}>
            <Text style={styles.privacyButtonText}>Pravila privatnosti</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kamera</Text>

          <Text style={styles.text}>
            Kamera se koristi isključivo za skeniranje QR kodova drugih
            kolekcionara.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Napomena</Text>

          <Text style={styles.text}>
            Ova aplikacija nije službena aplikacija proizvođača albuma i nije
            povezana s proizvođačem niti vlasnikom robne marke.
          </Text>
        </View>

        <Text style={styles.footer}>Verzija {appVersion}</Text>

        <Text style={styles.footer}>© 2026</Text>
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
  },

  title: {
    fontSize: 27,
    fontWeight: "bold",
    textAlign: "center",
    color: "#222",
    marginBottom: 4,
  },

  version: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 10,
  },

  text: {
    fontSize: 14,
    color: "#555",
    lineHeight: 21,
    marginBottom: 8,
  },

  item: {
    fontSize: 14,
    color: "#555",
    lineHeight: 23,
  },

  footer: {
    textAlign: "center",
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },

  privacyButton: {
    backgroundColor: "#2e7d4f",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    marginBottom: 14,
  },

  privacyButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
